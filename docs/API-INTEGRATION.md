# API-INTEGRATION.md - Gemini 2.0 Flash Integration

---

## Why Gemini 2.0 Flash

Mail Detective uses Gemini 2.0 Flash as its AI backbone for three reasons. First, it produces clean, structured JSON output reliably - critical for a system that depends on machine-readable extraction. Second, its one-million token context window means all fifteen emails plus the student profile fit comfortably in a single call. Third, it is fast - response times are typically under five seconds for a full inbox analysis, which keeps the user experience responsive.

GLM-4 was considered as an alternative but its JSON consistency in English-language extraction tasks is weaker, and it is optimized for Chinese-language workloads. For this problem, Gemini is the clear choice.

---

## API Configuration

| Parameter          | Value            | Reason                                |
| ------------------ | ---------------- | ------------------------------------- |
| Model              | gemini-2.0-flash | Best balance of speed and quality     |
| Temperature        | 0.1              | Near-deterministic extraction         |
| Max Output Tokens  | 8192             | Enough for 15 emails with full JSON   |
| Response MIME Type | application/json | Forces raw JSON, no markdown wrapping |

**Temperature at 0.1** is critical. Extraction tasks need consistency, not creativity. At higher temperatures, Gemini may vary its JSON structure, invent deadline dates, or add fields not in the schema. At 0.1, it follows the schema precisely every time.

**Response MIME Type** set to application/json is one of the most important settings. Without it, Gemini wraps its JSON in markdown code fences, requiring brittle string cleaning. With it, the response is raw parseable JSON.

---

## Single Call Strategy

All emails are sent in one API call, not one call per email. This is intentional.

**Advantages of one call:**

- Faster total response time - one network round trip instead of fifteen
- Lower API cost - fewer requests, less overhead
- Consistent output format - one schema check instead of fifteen
- Gemini can cross-reference emails - useful if two emails are about the same opportunity

**Why it works:** At an average of 300 tokens per email, fifteen emails consume roughly 4,500 tokens. The student profile adds another 200 tokens. The prompt instructions add 500 tokens. The total input is well under 6,000 tokens - a tiny fraction of Gemini 2.0 Flash's one-million token limit.

---

## What Gemini Extracts

For every email, Gemini extracts the following 16 fields. These fields feed directly into the scoring engine.

| Field              | Type          | Description                                                        |
| ------------------ | ------------- | ------------------------------------------------------------------ |
| email_index        | Number        | Position of the email (1-based)                                    |
| is_opportunity     | Boolean       | True if email contains a real actionable opportunity               |
| spam_reason        | Text or null  | Why it was classified as non-opportunity                           |
| opportunity_type   | Enum          | scholarship, internship, competition, fellowship, admission, other |
| title              | Text          | Short name of the opportunity                                      |
| organization       | Text          | Name of the offering organization                                  |
| deadline           | Date or null  | Converted to YYYY-MM-DD format                                     |
| deadline_text      | Text or null  | Original deadline phrase from the email                            |
| eligibility        | List of text  | Each eligibility condition as a separate item                      |
| required_documents | List of text  | Each required document as a separate item                          |
| min_cgpa           | Number        | Minimum CGPA required (0 if not stated)                            |
| degree_required    | Enum          | BS, MS, PhD, or Any                                                |
| skills_required    | List of text  | Skills mentioned as requirements                                   |
| location           | Text or null  | City, country, or Remote                                           |
| financial_benefit  | Boolean       | True if a stipend, scholarship, or payment is involved             |
| application_link   | URL or null   | Direct link to apply                                               |
| contact_email      | Email or null | Contact person or address                                          |
| key_benefits       | List of text  | Main benefits of the opportunity                                   |

---

## Classification Rules

Gemini is instructed to classify an email as a real opportunity only if all three of the following are true:

1. The email describes something the student can actively apply for or participate in
2. There is a clear target audience with some form of eligibility
3. There is a defined process to apply, register, or respond

Emails that fail any of these conditions are classified as non-opportunities. Common non-opportunity types include promotional sales emails, university newsletters without a specific call to action, event announcements with no application process, and automated system notifications.

---

## Deadline Extraction and Normalization

Deadline extraction is one of the most important tasks Gemini performs. Deadlines appear in email bodies in many formats:

- "Apply by April 30, 2025"
- "Deadline: 30/04/2025"
- "Applications close at the end of this month"
- "Last date to apply is next Friday"
- "Rolling admissions - apply soon"

Gemini is instructed to convert any found deadline into YYYY-MM-DD format and also return the original phrase as deadline_text for transparency. If no deadline is found, both fields return null.

Today's date is injected into the prompt so Gemini can correctly interpret relative phrases like "next Friday" or "end of this month."

---

## Prompt Design Principles

The prompt given to Gemini follows five principles.

**Specificity over generality.** The prompt provides the exact JSON schema Gemini must follow, field by field, with types and allowed values. Vague instructions produce vague output.

**Hard output rules.** Gemini is explicitly told to return only the JSON array with no explanation, no preamble, no markdown. This is reinforced by the responseMimeType setting at the API level.

**Contextual grounding.** The student profile is included in the prompt so Gemini can extract fields more intelligently. For example, when the profile shows a BS Computer Science student, Gemini can better identify relevant skill requirements.

**Date injection.** Today's date is included so relative deadline phrases are interpreted correctly.

**Strict classification criteria.** Gemini is told exactly what counts as a real opportunity and what does not, preventing over-classification of newsletters and promotional content as opportunities.

---
