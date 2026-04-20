import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { withGemini, GEMINI_MODEL } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const EXTRACTION_PROMPT = `You are an extraction agent for Mail Detective, a system
that matches students to scholarship/internship emails.

Read the attached résumé PDF and return a STRICT JSON object with the shape:

{
  "fullName":                  string | null,
  "degreeProgram":             string | null,   // e.g. "BS Computer Science"
  "university":                string | null,   // institution name
  "semester":                  number | null,   // integer 1-16; infer from year if needed
  "cgpa":                      number | null,   // 0.00 - 4.00 scale; convert from % if obvious
  "skills":                    string[],        // deduped, title-cased, max 25
  "preferredOpportunityTypes": string[],        // from ["Scholarship","Internship","Fellowship","Competition","Conference","Research","Job","Exchange Program"]; infer from resume
  "financialNeed":             boolean | null,  // true only if resume explicitly mentions need-based aid
  "locationPreference":        string | null,   // city/country/remote if stated
  "pastExperience":            string | null    // 1 short paragraph summary (max 400 chars)
}

Rules:
- Return ONLY the JSON object. No prose, no markdown fences.
- Use null for unknowns. Do not hallucinate universities or CGPAs.
- If CGPA is on a 10-scale or %, convert to 4-scale (percentage/25, capped at 4).
- If semester is not explicit but "3rd year" is mentioned, estimate (year * 2 - 1).
- skills must be a short array of concrete skills, not sentences.`;

type Extraction = {
  fullName: string | null;
  degreeProgram: string | null;
  university: string | null;
  semester: number | null;
  cgpa: number | null;
  skills: string[];
  preferredOpportunityTypes: string[];
  financialNeed: boolean | null;
  locationPreference: string | null;
  pastExperience: string | null;
};

function safeParse(text: string): Extraction | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned) as Extraction;
  } catch {
    // Fall back: find the first `{ ... }` block
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as Extraction;
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

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  let extractedText = '';
  try {
    // pdf-parse v2 requires worker/canvas plumbing in server runtimes.
    const { CanvasFactory } = await import('pdf-parse/worker');
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buf, CanvasFactory });
    try {
      const parsedPdf = await parser.getText();
      extractedText = parsedPdf.text || '';
    } finally {
      await parser.destroy();
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to read PDF file', raw: String(err) },
      { status: 400 },
    );
  }

  try {
    const result = await withGemini(async client => {
      return client.chat.completions.create({
        model: GEMINI_MODEL,
        messages: [
          { role: 'system', content: EXTRACTION_PROMPT },
          { role: 'user', content: `Resume Text:\n${extractedText}` },
        ],
        temperature: 0.1,
      });
    });

    const text = result.choices[0]?.message?.content ?? '';
    const parsed = safeParse(text);

    if (!parsed) {
      return NextResponse.json(
        { error: 'Gemini returned unreadable output', raw: text },
        { status: 502 },
      );
    }

    // Light normalisation on the server
    const normalised: Extraction = {
      fullName: parsed.fullName?.toString().trim() || null,
      degreeProgram: parsed.degreeProgram?.toString().trim() || null,
      university: parsed.university?.toString().trim() || null,
      semester:
        typeof parsed.semester === 'number'
          ? Math.min(16, Math.max(1, Math.round(parsed.semester)))
          : null,
      cgpa:
        typeof parsed.cgpa === 'number'
          ? Math.min(4, Math.max(0, Number(parsed.cgpa.toFixed(2))))
          : null,
      skills: Array.isArray(parsed.skills)
        ? Array.from(
            new Set(parsed.skills.map(s => String(s).trim()).filter(Boolean)),
          ).slice(0, 25)
        : [],
      preferredOpportunityTypes: Array.isArray(parsed.preferredOpportunityTypes)
        ? parsed.preferredOpportunityTypes
            .map(s => String(s).trim())
            .filter(Boolean)
        : [],
      financialNeed:
        typeof parsed.financialNeed === 'boolean' ? parsed.financialNeed : null,
      locationPreference: parsed.locationPreference?.toString().trim() || null,
      pastExperience: parsed.pastExperience?.toString().trim() || null,
    };

    return NextResponse.json({
      extraction: normalised,
      resumeFileName: file.name,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown extraction error';
    console.error('[resume/extract]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
