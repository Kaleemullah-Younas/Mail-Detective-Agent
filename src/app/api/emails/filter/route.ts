import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { withGemini, GEMINI_MODEL } from '@/lib/gemini';
import type { ClassifiedEmail, EmailCategory } from '@/lib/emails/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RawEmailSchema = z.object({
  id: z.string().min(1),
  from: z.string().default(''),
  subject: z.string().default(''),
  date: z.string().optional(),
  body: z.string().default(''),
});

const BodySchema = z.object({
  emails: z.array(RawEmailSchema).min(1).max(30),
});

const FILTER_PROMPT = `You are the FILTER agent in Mail Detective - a system that
surfaces real opportunities for students buried in a noisy inbox.

For each email, return one of four categories:

- "RELEVANT"    - a real opportunity the student could apply to or act on:
                  scholarships, fellowships, internships, job openings,
                  competitions, conferences, research assistantships,
                  calls for papers, hackathons with prizes, Y-Combinator-style
                  programmes, etc.
- "IRRELEVANT"  - legitimate emails that are NOT opportunities: promotions,
                  marketing newsletters, product updates, receipts, OTPs,
                  attendance reminders, personal chit-chat, login alerts.
- "SPAM"        - phishing, scams, crypto "you won", fake banks, Nigerian
                  prince, malware bait.
- "IGNORE"      - automated/system noise that is neither spam nor useful:
                  calendar pings, social notifications, slack digests, etc.
                  Use this when IRRELEVANT feels too strong.

Be decisive. A LinkedIn job digest with concrete listings is RELEVANT. A
LinkedIn "5 new jobs you might like" teaser with no deadlines or applicable
links is IGNORE. A course-completion certificate is IRRELEVANT. An OTP is
IGNORE.

Return ONLY a JSON object of the shape:

{
  "results": [
    {
      "id":         "<echo the email id>",
      "category":   "RELEVANT" | "IRRELEVANT" | "SPAM" | "IGNORE",
      "reason":     "<max 18 words>",
      "confidence": 0.0 - 1.0
    }
  ]
}

No prose. No markdown fences. Every input id must appear exactly once.`;

type GeminiResult = {
  id: string;
  category: string;
  reason: string;
  confidence: number;
};

function normaliseCategory(raw: string): EmailCategory {
  const v = raw.trim().toUpperCase();
  if (
    v === 'RELEVANT' ||
    v === 'IRRELEVANT' ||
    v === 'SPAM' ||
    v === 'IGNORE'
  ) {
    return v;
  }
  if (v.startsWith('REL')) return 'RELEVANT';
  if (v.startsWith('IRR')) return 'IRRELEVANT';
  if (v.startsWith('SPA') || v.startsWith('PHI')) return 'SPAM';
  return 'IGNORE';
}

function safeParse(text: string): { results: GeminiResult[] } | null {
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

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const json = await req.json();
    body = BodySchema.parse(json);
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues.map(i => i.message).join('; ')
        : 'Invalid request body';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Ship a compact, numbered list to Gemini. We truncate each body so we
  // stay well inside the context window on free-tier rate limits.
  const list = body.emails.map(e => ({
    id: e.id,
    from: (e.from || '').slice(0, 160),
    subject: (e.subject || '').slice(0, 200),
    date: e.date || '',
    body: (e.body || '').slice(0, 1200),
  }));

  try {
    const result = await withGemini(client =>
      client.chat.completions.create({
        model: 'GLM-5.1',
        messages: [
          { role: 'system', content: FILTER_PROMPT },
          {
            role: 'user',
            content: `Emails to classify (JSON):\n${JSON.stringify(list, null, 2)}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    );

    const parsed = safeParse(result.choices[0]?.message?.content ?? '');
    if (!parsed || !Array.isArray(parsed.results)) {
      return NextResponse.json(
        {
          error: 'Filter agent returned unreadable output',
          raw: result.choices[0]?.message?.content,
        },
        { status: 502 },
      );
    }

    // Build a lookup so we can return ClassifiedEmail in original order, and
    // fall back to IGNORE for any email Gemini dropped.
    const byId = new Map<string, GeminiResult>();
    for (const r of parsed.results) {
      if (r && typeof r.id === 'string') byId.set(r.id, r);
    }

    const classified: ClassifiedEmail[] = body.emails.map(email => {
      const r = byId.get(email.id);
      return {
        ...email,
        category: r ? normaliseCategory(r.category) : 'IGNORE',
        reason: r?.reason?.slice(0, 200) || 'No reason returned',
        confidence:
          typeof r?.confidence === 'number'
            ? Math.max(0, Math.min(1, r.confidence))
            : 0.5,
      };
    });

    return NextResponse.json({ classified });
  } catch (err) {
    console.error('[emails/filter]', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
