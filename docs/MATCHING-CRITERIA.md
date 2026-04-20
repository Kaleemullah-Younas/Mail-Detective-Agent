# MATCHING-CRITERIA.md - Scoring & Matching Algorithm

This is the most important document in the project. The scoring engine is what separates Mail Detective from a system that simply asks the AI to rank things. Every point in the score is earned by a specific, explainable rule.

---

## Score Structure

Every opportunity is scored out of 100 points across three dimensions.

| Dimension       | Max Points | What it measures                                   |
| --------------- | ---------- | -------------------------------------------------- |
| Profile Fit     | 40         | How well the opportunity matches the student       |
| Urgency         | 35         | How time-sensitive the opportunity is              |
| Completeness    | 25         | How much actionable information the email contains |
| Financial Bonus | +5         | Applied on top when relevant                       |

---

## Dimension 1 - Profile Fit (40 points)

Profile Fit measures how well the student's academic background, skills, and preferences align with the opportunity's requirements. It is composed of four sub-criteria.

---

### 1a. CGPA Match (15 points)

This criterion checks whether the student's CGPA meets the minimum required by the opportunity.

| Condition                                             | Points awarded               |
| ----------------------------------------------------- | ---------------------------- |
| No CGPA requirement stated in email                   | 15 - full points, no barrier |
| Student CGPA meets minimum AND margin is 0.5 or above | 15 - strong match            |
| Student CGPA meets minimum AND margin is below 0.5    | 10 - borderline match        |
| Student CGPA is below the stated minimum              | 0 - ineligible               |

**Margin** is defined as student CGPA minus the required minimum. A student with CGPA 3.8 applying to an opportunity requiring 3.0 has a margin of 0.8, which earns full points. A student with CGPA 3.1 applying to the same opportunity has a margin of 0.1, which earns partial points.

**Why this matters:** A student near the cutoff is technically eligible but at a disadvantage. The margin rewards opportunities where the student is comfortably qualified, not just barely qualifying.

---

### 1b. Degree Program Match (10 points)

This criterion checks whether the student's degree level matches what the opportunity requires.

| Condition                                                           | Points awarded   |
| ------------------------------------------------------------------- | ---------------- |
| Opportunity open to any degree level                                | 10 - full points |
| Student's degree matches exactly (e.g., BS required, student is BS) | 10 - full points |
| Student's degree does not match the requirement                     | 0 - ineligible   |

**Degree levels recognized:** BS, MS, PhD.

**Why this matters:** An MS-only fellowship is irrelevant to a BS student no matter how good the other details are. This criterion hard-filters degree mismatches.

---

### 1c. Skills Match (10 points)

This criterion compares the skills listed in the student's profile against the skills required by the opportunity.

| Condition                             | Points awarded                           |
| ------------------------------------- | ---------------------------------------- |
| No skills required by the opportunity | 10 - full points by default              |
| All required skills matched           | 10 - full points                         |
| Some required skills matched          | Proportional - (matched / required) × 10 |
| No required skills matched            | 0                                        |

**Matching logic:** Matching is case-insensitive and partial. If the student lists "Python" and the opportunity requires "Python scripting," that counts as a match. If the student lists "machine learning" and the opportunity requires "ML," that also counts.

**Why this matters:** Skill matching is partial by design. A student who has 3 out of 4 required skills is still a strong candidate and should see the opportunity ranked higher than one where they have 0 matching skills.

---

### 1d. Preferred Opportunity Type Match (5 points)

This criterion checks whether the opportunity type matches what the student said they are looking for.

| Condition                                               | Points awarded |
| ------------------------------------------------------- | -------------- |
| Opportunity type matches student's selected preferences | 5              |
| Opportunity type does not match preferences             | 0              |

**Opportunity types:** scholarship, internship, competition, fellowship, admission.

**Why this matters:** A student who is only looking for internships should see internships ranked higher than fellowships, even if both are equally well-matched on other dimensions.

---

## Dimension 2 - Urgency (35 points)

Urgency rewards opportunities that need attention soon. A perfect opportunity with three days left outranks a slightly worse opportunity with six months remaining, because the student must act now.

| Days remaining until deadline | Points awarded                    |
| ----------------------------- | --------------------------------- |
| Deadline has already passed   | 0 - shown as expired, card dimmed |
| 3 days or fewer remaining     | 35 - maximum urgency              |
| 4 to 7 days remaining         | 28 - very urgent                  |
| 8 to 14 days remaining        | 20 - act this week                |
| 15 to 30 days remaining       | 12 - plan this month              |
| More than 30 days remaining   | 6 - on the radar                  |
| No deadline found in email    | 10 - rolling/unknown deadline     |

**Days remaining calculation:** Computed from today's date at midnight to the extracted deadline date at midnight. Always rounded up - one hour before midnight counts as one day remaining.

**No deadline treatment:** An email with no deadline is not penalized as heavily as one far in the future. Rolling deadlines (like open applications) are common for fellowships and some internships. They receive 10 points - more than a distant deadline - because they could close any time.

**Why urgency has the second-highest weight:** Profile fit tells you if the opportunity is right for you. Urgency tells you if you still have time to do anything about it. A great opportunity you missed is worth nothing.

---

## Dimension 3 - Completeness (25 points)

Completeness rewards emails that contain enough information for the student to actually take action. An opportunity where the deadline, application link, eligibility, required documents, and contact are all clearly stated is more actionable than one with vague or missing details.

| Field present in email         | Points |
| ------------------------------ | ------ |
| Deadline clearly stated        | 7      |
| Application link or portal URL | 6      |
| Eligibility criteria listed    | 5      |
| Required documents listed      | 4      |
| Contact email or person        | 3      |
| **Maximum total**              | **25** |

**Why deadline is the most valuable completeness field:** Without a deadline, the student cannot prioritize. It is the single most actionable piece of information in any opportunity email.

**Why completeness matters:** An opportunity where you cannot figure out how to apply, what documents to prepare, or who to contact is not an actionable opportunity - even if it is a perfect profile match. Completeness rewards emails that respect the student's time.

---

## Financial Bonus (up to +5 points)

This bonus is applied on top of the 100-point score when both of the following are true:

- The email indicates the opportunity includes a financial benefit (stipend, scholarship amount, travel grant, paid position)
- The student has indicated financial need on their profile

This bonus does not apply if only one condition is true. It rewards the intersection of need and benefit.

---

## Final Score Calculation

Total Score = Profile Fit (max 40) + Urgency (max 35) + Completeness (max 25) + Financial Bonus (max 5)

The score is capped at 100 even if the financial bonus pushes it above.

---

## Score Interpretation

| Score Range | Interpretation                          |
| ----------- | --------------------------------------- |
| 85 – 100    | Excellent match - act immediately       |
| 70 – 84     | Strong match - prioritize this week     |
| 55 – 69     | Good match - review and plan            |
| 40 – 54     | Partial match - worth reading carefully |
| Below 40    | Low match or low urgency - low priority |

---

## Urgency Badge Labels

Every opportunity card displays a color-coded badge based on days remaining.

| Badge       | Color                 | Days Remaining     |
| ----------- | --------------------- | ------------------ |
| CRITICAL    | Red                   | 0 to 3 days        |
| URGENT      | Orange                | 4 to 7 days        |
| SOON        | Blue                  | 8 to 14 days       |
| PLAN AHEAD  | Green                 | 15 to 30 days      |
| ON RADAR    | Muted gray            | More than 30 days  |
| NO DEADLINE | Gray                  | Not found in email |
| EXPIRED     | Dark red, card dimmed | Deadline passed    |

---

## What Gets Filtered Out Before Scoring

The scoring engine only processes emails that Gemini classified as real opportunities (is_opportunity = true). The following are filtered out entirely and shown only in the collapsed spam section:

- Promotional emails (sales, discounts, offers)
- University newsletters and announcements
- Event invitations with no application process
- Emails without clear eligibility criteria
- Forwarded chains and automated notifications
- Emails that mention opportunities but do not contain one (e.g., "apply for our partner program - visit our website")

---

## Tie-Breaking

When two opportunities have identical total scores, the tie is broken by:

1. Urgency score - higher urgency wins
2. Profile fit score - stronger match wins
3. Completeness score - more information wins
4. Email index - earlier in the inbox wins

---

## Reasoning Output

For every scored opportunity, the system generates a human-readable list of reasons that explain the score. These appear in the "WHY THIS MATTERS" section of each card. Examples:

- "CGPA 3.82 comfortably meets requirement of 3.5"
- "Python and ML skills matched"
- "CRITICAL: only 2 days left to apply"
- "Competition matches your stated interest"
- "Financial stipend matches your indicated need"
- "Warning: CGPA slightly below stated minimum"
- "No application link found - contact organization directly"
