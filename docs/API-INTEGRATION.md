# API-INTEGRATION.md - GLM-5.1 Integration

---

## Why GLM-5.1

Mail Detective uses GLM-5.1 via z.ai as its AI backbone. It exposes an OpenAI-compatible API, making it a drop-in replacement that works with the standard OpenAI client. It produces clean, structured JSON output reliably — critical for a system that depends on machine-readable extraction — and handles large context windows comfortably, meaning all emails plus the student profile fit in a single call.

---

## API Configuration

| Parameter   | Value                               | Reason                            |
| ----------- | ----------------------------------- | --------------------------------- |
| Model       | GLM-5.1                             | Best balance of speed and quality |
| Base URL    | https://api.z.ai/api/coding/paas/v4 | z.ai OpenAI-compatible endpoint   |
| Temperature | 0.1                                 | Near-deterministic extraction     |

**Temperature at 0.1** is critical. Extraction tasks need consistency, not creativity. At higher temperatures the model may vary its JSON structure or invent deadline dates. At 0.1, it follows the schema precisely every time.

**OpenAI-compatible client** means no proprietary SDK is needed. The standard `openai` npm package is used with a custom `baseURL` pointing to z.ai, and multi-key rotation is handled in `src/lib/gemini.ts` (the GLM gateway module).

---

## Single Call Strategy

All emails are sent in one API call, not one call per email. This is intentional.

**Advantages of one call:**

- Faster total response time - one network round trip instead of fifteen
- Lower API cost - fewer requests, less overhead
- Consistent output format - one schema check instead of fifteen
- The model can cross-reference emails - useful if two emails are about the same opportunity

**Why it works:** At an average of 300 tokens per email, fifteen emails consume roughly 4,500 tokens. The student profile adds another 200 tokens. The prompt instructions add 500 tokens. The total input is well under 6,000 tokens, well within GLM-5.1's context window.

---

## What the Model Extracts

For every email, the model extracts the following 16 fields. These fields feed directly into the scoring engine.

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

The model is instructed to classify an email as a real opportunity only if all three of the following are true:

1. The email describes something the student can actively apply for or participate in
2. There is a clear target audience with some form of eligibility
3. There is a defined process to apply, register, or respond

Emails that fail any of these conditions are classified as non-opportunities. Common non-opportunity types include promotional sales emails, university newsletters without a specific call to action, event announcements with no application process, and automated system notifications.

---

## Deadline Extraction and Normalization

Deadline extraction is one of the most important tasks the model performs. Deadlines appear in email bodies in many formats:

- "Apply by April 30, 2025"
- "Deadline: 30/04/2025"
- "Applications close at the end of this month"
- "Last date to apply is next Friday"
- "Rolling admissions - apply soon"

The model is instructed to convert any found deadline into YYYY-MM-DD format and also return the original phrase as deadline_text for transparency. If no deadline is found, both fields return null.

Today's date is injected into the prompt so the model can correctly interpret relative phrases like "next Friday" or "end of this month."

---

## Prompt Design Principles

The prompt follows five principles.

**Specificity over generality.** The prompt provides the exact JSON schema the model must follow, field by field, with types and allowed values. Vague instructions produce vague output.

**Hard output rules.** The model is explicitly told to return only the JSON array with no explanation, no preamble, no markdown.

**Contextual grounding.** The student profile is included in the prompt so the model can extract fields more intelligently. For example, when the profile shows a BS Computer Science student, it can better identify relevant skill requirements.

**Date injection.** Today's date is included so relative deadline phrases are interpreted correctly.

**Strict classification criteria.** The model is told exactly what counts as a real opportunity and what does not, preventing over-classification of newsletters and promotional content as opportunities.

---
