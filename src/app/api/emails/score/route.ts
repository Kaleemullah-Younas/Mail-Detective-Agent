import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withGemini, GEMINI_MODEL } from '@/lib/gemini';
import type { ExtractedEmail, ScoredEmail, Verdict } from '@/lib/emails/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ExtractedSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  date: z.string().optional(),
  body: z.string(),
  category: z.enum(['RELEVANT', 'IRRELEVANT', 'SPAM', 'IGNORE']),
  reason: z.string(),
  confidence: z.number(),
  title: z.string(),
  organisation: z.string().nullable(),
  opportunityType: z.string(),
  deadline: z.string().nullable(),
  deadlineIso: z.string().nullable(),
  eligibility: z.array(z.string()),
  requiredDocuments: z.array(z.string()),
  link: z.string().nullable(),
  location: z.string().nullable(),
  stipendOrValue: z.string().nullable(),
  summary: z.string(),
});

const BodySchema = z.object({
  emails: z.array(ExtractedSchema).min(1).max(30),
});

const SCORE_PROMPT = `You are the SCORE agent in Mail Detective - the final
stage. You rank opportunities for ONE specific student based on their profile.
Think like a clear-eyed career adviser.

You will be given:
  1. The student's profile (program, semester, CGPA, skills, preferences).
  2. Today's date (ISO).
  3. A list of already-extracted opportunities.

For EACH opportunity return four dimension sub-scores (0–100), a composite
score (0–100), a verdict, a one-line reasoning, and up to 12 highlight
phrases from the email that matter for the decision.

Dimensions:
  urgency      - deadline closeness. >90 if deadline within 14 days, 70-85 if
                 within a month, 50-65 within 2-3 months, 30-45 within 6
                 months, 10-25 further out, 50 if unknown.
  fit          - match to the student's skills, degree program, and preferred
                 opportunity types.
  eligibility  - does the student meet the stated requirements (semester,
                 CGPA, degree, nationality if mentioned)? 0 if clearly
                 ineligible, 100 if an obvious yes, 60 if unclear.
  effortReward - weight of payoff (prize, stipend, tuition, career weight)
                 versus application effort. Higher when high-value and
                 low-friction.

Composite: weighted blend 0.35*eligibility + 0.30*fit + 0.20*urgency +
0.15*effortReward. Round to the nearest integer.

Verdict rules:
  "APPLY"    - score ≥ 70 and eligibility ≥ 60
  "CONSIDER" - score 45-69 OR (score ≥ 70 but eligibility < 60)
  "SKIP"     - score < 45 OR eligibility < 30

highlights: 3-12 short (1-5 word) phrases copied VERBATIM from the email body
- the UI will bold these. Pick phrases that drive the verdict: the deadline
date, the specific stipend value, key skills matched, red flags.

Return ONLY JSON:

{
  "results": [
    {
      "id": "<email id>",
      "score": 0-100,
      "urgency": 0-100,
      "fit": 0-100,
      "eligibility": 0-100,
      "effortReward": 0-100,
      "verdict": "APPLY" | "CONSIDER" | "SKIP",
      "reasoning": "<one short sentence, max 32 words>",
      "highlights": ["<phrase>", ...]
    }
  ]
}`;

type GeminiItem = {
  id: string;
  score?: number;
  urgency?: number;
  fit?: number;
  eligibility?: number;
  effortReward?: number;
  verdict?: string;
  reasoning?: string;
  highlights?: string[];
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

function clamp(n: unknown, fallback = 50): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toVerdict(raw: string | undefined): Verdict {
  const v = (raw || '').trim().toUpperCase();
  if (v === 'APPLY' || v === 'CONSIDER' || v === 'SKIP') return v;
  return 'CONSIDER';
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: 'No profile on file' }, { status: 400 });
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

  const today = new Date().toISOString().slice(0, 10);
  const profilePayload = {
    fullName: profile.fullName,
    degreeProgram: profile.degreeProgram,
    university: profile.university,
    semester: profile.semester,
    cgpa: profile.cgpa,
    skills: profile.skills,
    preferredOpportunityTypes: profile.preferredOpportunityTypes,
    financialNeed: profile.financialNeed,
    locationPreference: profile.locationPreference,
    pastExperience: profile.pastExperience,
  };

  const list = body.emails.map(e => ({
    id: e.id,
    title: e.title,
    organisation: e.organisation,
    opportunityType: e.opportunityType,
    deadline: e.deadline,
    deadlineIso: e.deadlineIso,
    eligibility: e.eligibility,
    requiredDocuments: e.requiredDocuments,
    location: e.location,
    stipendOrValue: e.stipendOrValue,
    summary: e.summary,
    // Trim body so we stay well within rate-limited context.
    bodyExcerpt: (e.body || '').slice(0, 1500),
  }));

  try {
    const result = await withGemini(client =>
      client.chat.completions.create({
        model: 'GLM-5.1',
        messages: [
          { role: 'system', content: SCORE_PROMPT },
          {
            role: 'user',
            content: `Today: ${today}\n\nStudent profile:\n${JSON.stringify(
              profilePayload,
              null,
              2,
            )}\n\nOpportunities to score:\n${JSON.stringify(list, null, 2)}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    );

    const parsed = safeParse(result.choices[0]?.message?.content ?? '');
    if (!parsed || !Array.isArray(parsed.results)) {
      return NextResponse.json(
        {
          error: 'Score agent returned unreadable output',
          raw: result.choices[0]?.message?.content,
        },
        { status: 502 },
      );
    }

    const byId = new Map<string, GeminiItem>();
    for (const r of parsed.results) {
      if (r && typeof r.id === 'string') byId.set(r.id, r);
    }

    const scored: ScoredEmail[] = body.emails.map((e): ScoredEmail => {
      const r = byId.get(e.id);
      return {
        ...(e as ExtractedEmail),
        score: clamp(r?.score, 50),
        urgencyScore: clamp(r?.urgency, 50),
        fitScore: clamp(r?.fit, 50),
        eligibilityScore: clamp(r?.eligibility, 50),
        effortRewardScore: clamp(r?.effortReward, 50),
        verdict: toVerdict(r?.verdict),
        reasoning: (r?.reasoning ?? '').slice(0, 240),
        highlights: Array.isArray(r?.highlights)
          ? r!.highlights
              .map(h => String(h).trim())
              .filter(h => h.length > 0 && h.length <= 60)
              .slice(0, 12)
          : [],
      };
    });

    // Sort descending by score so the most important case is on top.
    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({ scored });
  } catch (err) {
    console.error('[emails/score]', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
