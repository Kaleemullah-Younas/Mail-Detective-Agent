# ARCHITECTURE.md - System Design

---

## Overview

Mail Detective is a full-stack Next.js application backed by MongoDB Atlas and Gemini 2.0 Flash. The system uses a three-agent AI pipeline where each agent has a single responsibility.

The architecture has three distinct layers that each do a specific job and nothing else.

---

## The Three Layers

### Layer 1 - Input & Pre-processing (Browser)

This layer collects everything the system needs before making any API call. It gathers the student profile from a structured form, splits the raw email text into individual email objects using a separator, validates that all required fields are present, and constructs the full prompt that will be sent to Gemini. Nothing intelligent happens here - it is pure data collection and formatting.

### Layer 2 - AI Extraction (Gemini 2.0 Flash)

This is the only place where AI is used. Gemini receives the complete prompt containing all emails plus the student profile. Its job is classification and extraction only - it decides whether each email is a real opportunity, and it pulls out structured fields like deadlines, eligibility criteria, required documents, and application links. Gemini does not score. Gemini does not rank. It only extracts and classifies, then returns a clean JSON array.

### Layer 3 - Scoring, Ranking & Rendering (Browser)

This layer receives the JSON from Gemini and applies the deterministic scoring engine written in JavaScript. It filters out non-opportunities, computes a score out of 100 for each real opportunity, sorts them from highest to lowest, generates action checklists, and renders the final ranked output as detective case file cards.

---

## Full Data Flow

The journey of data through Mail Detective follows seven steps in strict sequence.

**Step 1 - Profile Collection**
The user fills a structured form. All fields are captured into a JavaScript object: name, degree program, semester, CGPA, skills as a list, preferred opportunity types as checkboxes, financial need as a toggle, and location preference.

**Step 2 - Email Parsing**
The user pastes raw email text into a textarea, with each email separated by the delimiter `--- NEW EMAIL ---`. The system splits on this delimiter and filters out any empty segments, producing a clean array of individual email strings.

**Step 3 - Prompt Construction**
The system assembles a single prompt containing today's date, the student profile as structured data, all emails numbered and labeled, the exact JSON schema Gemini must return, and strict rules requiring raw JSON output with no explanation or markdown.

**Step 4 - Gemini API Call**
A single POST request is sent to the Gemini 2.0 Flash endpoint. The temperature is set to 0.1 for near-deterministic extraction. The response MIME type is set to application/json to force clean output. One call handles all emails simultaneously.

**Step 5 - JSON Parsing**
The response text is cleaned of any residual markdown formatting and parsed into a JavaScript array. Each element in the array corresponds to one email.

**Step 6 - Scoring Engine**
The deterministic scoring engine processes every email object where is_opportunity is true. It computes three sub-scores - profile fit, urgency, and completeness - and combines them into a total score out of 100. The array is then sorted descending by total score.

**Step 7 - Rendering**
The interface displays a four-metric summary bar, then renders each opportunity as an animated case file card in ranked order. Spam and irrelevant emails appear in a collapsed section at the bottom.

---

## System Boundaries

**What the AI does:**

- Reads email text and decides if it contains a real opportunity
- Extracts structured fields from unstructured natural language
- Converts ambiguous deadline phrases into standard date format
- Returns a machine-readable JSON array

**What the AI does not do:**

- Score any opportunity
- Rank or compare opportunities
- Generate action checklists
- Make any personalization decisions

**What the JS engine does:**

- Everything related to scoring, ranking, and personalization
- Matching student profile against extracted opportunity fields
- Computing urgency based on days remaining
- Generating the action checklist per opportunity
- Rendering the full results interface

---

## Key Technical Decisions

**Minimal configuration**
The application is designed to be straightforward to set up and deploy with minimal overhead.

**Server-side API calls**
All Gemini API calls are made server-side through Next.js API routes, keeping API keys secure and never exposing them to the browser.

**One API call for all emails**
Sending all emails in a single prompt is faster and cheaper than one call per email. Gemini 2.0 Flash handles up to fifteen emails in its context window with no issues.

**Low temperature (0.1)**
Extraction tasks require consistency, not creativity. A near-zero temperature ensures Gemini returns the same fields in the same format every time.

**Forced JSON MIME type**
Setting responseMimeType to application/json instructs Gemini to return raw JSON without markdown code fences, eliminating the need for brittle string cleaning.

**Deterministic scoring in JS**
The scoring and ranking engine is built separately from the AI. This makes the ranking fully explainable — every score can be traced back to specific rules.

---

## Error Handling

| Situation                     | What happens                                      |
| ----------------------------- | ------------------------------------------------- |
| Missing API key               | Error message shown in Urdu, process stops        |
| Empty email textarea          | Error message shown, process stops                |
| Incomplete profile            | Error message shown, process stops                |
| Gemini API failure            | Full error message surfaced to user               |
| Unparseable JSON response     | Raw response shown for debugging                  |
| All emails classified as spam | Spam section shown, no ranked cards               |
| Deadline already passed       | Card shown at bottom, marked expired, 50% opacity |
