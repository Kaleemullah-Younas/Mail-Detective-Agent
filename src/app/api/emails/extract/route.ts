import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { withGemini, GEMINI_MODEL } from '@/lib/gemini';
import type {
  ClassifiedEmail,
  ExtractedEmail,
  OpportunityType,
} from '@/lib/emails/types';
import { OPPORTUNITY_TYPES } from '@/lib/emails/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ClassifiedSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  date: z.string().optional(),
  body: z.string(),
  category: z.enum(['RELEVANT', 'IRRELEVANT', 'SPAM', 'IGNORE']),
  reason: z.string(),
  confidence: z.number(),
});

const BodySchema = z.object({
  emails: z.array(ClassifiedSchema).min(1).max(30),
});

const EXTRACT_PROMPT = `You are the EXTRACT agent in Mail Detective - the second
stage of the opportunity-detection pipeline. You receive emails that the
FILTER agent has already marked as real opportunities, and you pull structured
fields out of each one.

Return ONLY JSON of the shape:

{
  "results": [
    {
      "id":                "<echo the email id>",
      "title":             "<short opportunity name, max 80 chars>",
      "organisation":      "<issuing org>" | null,
      "opportunityType":   "Scholarship" | "Internship" | "Fellowship" | "Competition" | "Conference" | "Research" | "Job" | "Exchange Program" | "Other",
      "deadline":          "<YYYY-MM-DD if parseable, else the raw phrase>" | null,
      "eligibility":       ["<short bullet>", ...],
      "requiredDocuments": ["<short bullet>", ...],
      "link":              "<apply / info url>" | null,
      "location":          "<city, country, or 'Remote'>" | null,
      "stipendOrValue":    "<e.g. 'Full tuition + USD 9500/month'>" | null,
      "summary":           "<1-2 sentence plain-English summary, max 240 chars>"
    }
  ]
}

Rules:
- No prose, no markdown, no code fences.
- Every input id must appear exactly once.
- If a field is not present in the email, use null or [] - do NOT invent.
- Convert deadline to YYYY-MM-DD if the email gives a clear calendar date
  (e.g. "15 May 2026" → "2026-05-15"). If only a relative phrase like "close
  in 7 days" is available, put the raw phrase in deadline and leave it as a
  string.
- eligibility bullets should be short noun phrases (e.g. "CGPA ≥ 3.0",
  "Pakistani nationality", "3rd or 4th-year undergrad").
- requiredDocuments likewise short (e.g. "CV", "Transcript", "Statement of
  purpose").
- If the email is multi-opportunity (e.g. a LinkedIn digest listing 5 jobs),
  return ONE entry covering the whole digest (title = category + count).`;

type GeminiItem = {
  id: string;
  title?: string;
  organisation?: string | null;
  opportunityType?: string | null;
  deadline?: string | null;
  eligibility?: string[];
  requiredDocuments?: string[];
  link?: string | null;
  location?: string | null;
  stipendOrValue?: string | null;
  summary?: string;
};

function safeParse(text: string): { results: GeminiItem[] } | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

function normaliseType(raw: string | null | undefined): OpportunityType {
  if (!raw) return 'Other';
  const match = OPPORTUNITY_TYPES.find(
    t => t.toLowerCase() === raw.toLowerCase().trim(),
  );
  return match ?? 'Other';
}

/** Try to coerce deadline text into ISO (YYYY-MM-DD). */
function toIso(deadline: string | null | undefined): string | null {
  if (!deadline) return null;
  // Already YYYY-MM-DD?
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return deadline;
  const d = new Date(deadline);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues.map(i => i.message).join('; ')
        : 'Invalid body';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Filter to RELEVANT only - the extract agent shouldn't waste tokens on
  // spam/noise. Everything else passes through untouched (we'll still return
  // entries for them so the caller can line up ids).
  const relevant = body.emails.filter(e => e.category === 'RELEVANT');

  // If there are no relevant ones, short-circuit.
  if (relevant.length === 0) {
    return NextResponse.json({ extracted: [] });
  }

  const list = relevant.map(e => ({
    id: e.id,
    from: (e.from || '').slice(0, 160),
    subject: (e.subject || '').slice(0, 200),
    date: e.date || '',
    body: (e.body || '').slice(0, 2400),
  }));

  try {
    const result = await withGemini(client =>
      client.chat.completions.create({
        model: 'GLM-5.1',
        messages: [
          { role: 'system', content: EXTRACT_PROMPT },
          {
            role: 'user',
            content: `Emails to extract (JSON):\n${JSON.stringify(list, null, 2)}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    );

    const parsed = safeParse(result.choices[0]?.message?.content ?? '');
    if (!parsed || !Array.isArray(parsed.results)) {
      return NextResponse.json(
        {
          error: 'Extract agent returned unreadable output',
          raw: result.choices[0]?.message?.content,
        },
        { status: 502 },
      );
    }

    const byId = new Map<string, GeminiItem>();
    for (const r of parsed.results) {
      if (r && typeof r.id === 'string') byId.set(r.id, r);
    }

    const extracted: ExtractedEmail[] = relevant.map(
      (email): ExtractedEmail => {
        const r = byId.get(email.id);
        const deadline = r?.deadline ?? null;
        return {
          ...(email as ClassifiedEmail),
          title: (r?.title ?? email.subject ?? 'Untitled opportunity').slice(
            0,
            140,
          ),
          organisation: r?.organisation ?? null,
          opportunityType: normaliseType(r?.opportunityType),
          deadline: deadline,
          deadlineIso: toIso(deadline),
          eligibility: Array.isArray(r?.eligibility)
            ? r!.eligibility.slice(0, 8).map(s => String(s).slice(0, 120))
            : [],
          requiredDocuments: Array.isArray(r?.requiredDocuments)
            ? r!.requiredDocuments.slice(0, 8).map(s => String(s).slice(0, 120))
            : [],
          link:
            typeof r?.link === 'string' && r.link.length > 0 ? r.link : null,
          location: r?.location ?? null,
          stipendOrValue: r?.stipendOrValue ?? null,
          summary: (r?.summary ?? '').slice(0, 300),
        };
      },
    );

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error('[emails/extract]', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
