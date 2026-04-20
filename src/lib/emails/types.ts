/**
 * Shared types for the email pipeline.
 * An email moves through three agents:
 *   RawEmail          →   ClassifiedEmail   (Filter)
 *                      →  ExtractedEmail    (Extract)
 *                      →  ScoredEmail       (Score)
 */

export type RawEmail = {
  /** Client-generated stable id so we can carry it through the pipeline */
  id: string;
  from: string;
  subject: string;
  /** ISO-8601 date string, optional */
  date?: string;
  body: string;
};

export type EmailCategory = 'RELEVANT' | 'IRRELEVANT' | 'SPAM' | 'IGNORE';

export type ClassifiedEmail = RawEmail & {
  category: EmailCategory;
  /** Short one-line reason the filter agent chose this category */
  reason: string;
  /** 0-1 confidence score from the filter agent */
  confidence: number;
};

export type OpportunityType =
  | 'Scholarship'
  | 'Internship'
  | 'Fellowship'
  | 'Competition'
  | 'Conference'
  | 'Research'
  | 'Job'
  | 'Exchange Program'
  | 'Other';

/** Output of the Extract agent - structured fields for a relevant email. */
export type ExtractedEmail = ClassifiedEmail & {
  /** Short headline, e.g. "Fulbright Foreign Student Program 2026" */
  title: string;
  organisation: string | null;
  opportunityType: OpportunityType;
  /** ISO-8601 date string if we could parse it, else the raw phrase Gemini found */
  deadline: string | null;
  /** True only if deadline is a parseable ISO date in the future */
  deadlineIso: string | null;
  eligibility: string[];
  requiredDocuments: string[];
  link: string | null;
  location: string | null;
  /** Stipend, prize, tuition coverage - whatever was mentioned */
  stipendOrValue: string | null;
  /** 1-2 sentence human summary */
  summary: string;
};

export type Verdict = 'APPLY' | 'CONSIDER' | 'SKIP';

/** Output of the Score agent - adds profile-aware scoring. */
export type ScoredEmail = ExtractedEmail & {
  /** 0-100 headline score the sort order is based on */
  score: number;
  /** Dimension sub-scores, each 0-100 */
  urgencyScore: number;
  fitScore: number;
  eligibilityScore: number;
  effortRewardScore: number;
  verdict: Verdict;
  /** Detective-voice one-liner explaining the verdict */
  reasoning: string;
  /**
   * Tokens/phrases that the Score agent found meaningful in the email body -
   * the UI renders these with a highlight in the detail view.
   * Max 12, each 1-5 words.
   */
  highlights: string[];
};

/* ---------- UI constants ---------- */

export const CATEGORY_LABEL: Record<EmailCategory, string> = {
  RELEVANT: 'Relevant',
  IRRELEVANT: 'Irrelevant',
  SPAM: 'Spam',
  IGNORE: 'Ignore',
};

export const CATEGORY_ORDER: EmailCategory[] = [
  'RELEVANT',
  'IRRELEVANT',
  'IGNORE',
  'SPAM',
];

export const VERDICT_LABEL: Record<Verdict, string> = {
  APPLY: 'Apply',
  CONSIDER: 'Consider',
  SKIP: 'Skip',
};

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  'Scholarship',
  'Internship',
  'Fellowship',
  'Competition',
  'Conference',
  'Research',
  'Job',
  'Exchange Program',
  'Other',
];
