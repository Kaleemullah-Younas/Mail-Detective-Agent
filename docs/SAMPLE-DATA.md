# SAMPLE-DATA.md - Demo Sample Emails

---

## Purpose

These eight emails are hardcoded in the application and load instantly when the user clicks "Load Sample Emails." They are designed to demonstrate the full range of system capabilities: real opportunities of different types, spam, newsletters, and varying levels of email completeness.

The set includes Pakistani-context opportunities (HEC, Systems Limited, Amal Academy, LUMS) alongside international ones (Google, ICPC) to reflect the realistic inbox of a Pakistani CS student.

---

## Email Set Overview

| #   | Type        | Classification   | Organization    | Key test                               |
| --- | ----------- | ---------------- | --------------- | -------------------------------------- |
| 1   | Scholarship | Real opportunity | HEC Pakistan    | Financial need match, CGPA requirement |
| 2   | Internship  | Real opportunity | Systems Limited | Skills match, paid position            |
| 3   | Competition | Real opportunity | ICPC            | No CGPA requirement, team-based        |
| 4   | Promotional | Spam             | Daraz.pk        | Spam classification test               |
| 5   | Fellowship  | Real opportunity | Amal Academy    | No CGPA req, final year focus          |
| 6   | Competition | Real opportunity | Google          | Skills requirement, international      |
| 7   | Newsletter  | Spam             | UMT             | Newsletter classification test         |
| 8   | Admission   | Real opportunity | LUMS            | MS/MBA level, documents-heavy          |

---

## Email 1 - HEC Need-Based Scholarship

**Subject:** HEC Need-Based Scholarship 2025 - Applications Open
**From:** scholarships@hec.gov.pk
**Classification:** Real opportunity - Scholarship

**What it tests:**

- Financial benefit flag triggered (scholarship = financial benefit)
- CGPA minimum of 2.5 - low bar, accessible to most students
- Degree requirement: BS only
- Financial need matching - student who marked financial need gets bonus points
- Pakistani government context - highly relevant to local students

**Key extracted fields:**

- Opportunity type: Scholarship
- Organization: Higher Education Commission of Pakistan
- Deadline: May 15, 2025
- Min CGPA: 2.5
- Degree required: BS
- Financial benefit: Yes
- Required documents: Family income certificate, enrollment letter, CNIC copy, transcript
- Eligibility: Pakistani national, BS student, family income below Rs. 45,000/month

---

## Email 2 - Systems Limited ML Internship

**Subject:** Systems Limited Summer Internship 2025 - AI/ML Track
**From:** careers@systemsltd.com
**Classification:** Real opportunity - Internship

**What it tests:**

- Skills matching - requires Python, TensorFlow or PyTorch, basic NLP
- CGPA requirement of 3.0 - medium bar
- Semester requirement - 5th semester or above (not extracted as a field but in eligibility)
- Financial benefit - PKR 35,000/month stipend
- Location matching - Lahore Gulberg office
- Application link present - full completeness points

**Key extracted fields:**

- Opportunity type: Internship
- Organization: Systems Limited
- Deadline: April 30, 2025
- Min CGPA: 3.0
- Degree required: BS
- Skills required: Python, TensorFlow, PyTorch, NLP
- Financial benefit: Yes (PKR 35,000/month)
- Location: Lahore
- Application link: Present

---

## Email 3 - ICPC Asia Regional

**Subject:** ICPC Asia Regional 2025 - Team Registration Open
**From:** icpc@nu.edu.pk
**Classification:** Real opportunity - Competition

**What it tests:**

- No CGPA requirement - full CGPA points regardless of student score
- No degree requirement - open to all enrolled students
- Competition type matching
- No financial benefit (prize pool in USD but not a stipend)
- Distant deadline (October 1, 2025) - low urgency score
- Team-based - eligibility mentions team of 3

**Key extracted fields:**

- Opportunity type: Competition
- Organization: ICPC
- Deadline: October 1, 2025
- Min CGPA: 0 (none required)
- Degree required: Any
- Financial benefit: No (prize pool is prize, not stipend)
- Location: Lahore (FAST-NU venue)
- Application link: Present

---

## Email 4 - Daraz Sale (Spam)

**Subject:** MEGA SALE - 70% off at Daraz!
**From:** noreply@daraz.pk
**Classification:** Spam - Promotional

**What it tests:**

- Spam classification - promotional email with no eligibility, no application process
- System correctly identifies and excludes this from ranked results
- Appears in the collapsed spam section with reason: "promotional email"

**Why it is spam:**

- No target audience with eligibility criteria
- No application process
- No opportunity for the student to participate in anything meaningful
- Purely commercial promotional content

---

## Email 5 - Amal Academy Fellowship

**Subject:** Amal Academy CareerPrep Fellowship - Spring 2025
**From:** apply@amalfellowship.org
**Classification:** Real opportunity - Fellowship

**What it tests:**

- No CGPA requirement - full CGPA points
- Final year student focus (but not hard-requirement)
- Online and weekend format - location flexible
- Financial benefit - PKR 10,000 completion stipend
- Fellowship type matching
- Urgent deadline - April 20, 2025 (close deadline tests urgency scoring)

**Key extracted fields:**

- Opportunity type: Fellowship
- Organization: Amal Academy
- Deadline: April 20, 2025
- Min CGPA: 0 (none required)
- Degree required: Any (BS final year preferred)
- Financial benefit: Yes (PKR 10,000 completion payment)
- Location: Remote (online, weekends)
- Application link: Present

---

## Email 6 - Google Solution Challenge

**Subject:** Google Solution Challenge 2025 - Pakistan Chapter
**From:** developer@google.com
**Classification:** Real opportunity - Competition

**What it tests:**

- International tech company context
- Skills requirement - Android, Flutter, Web, ML optional
- No CGPA requirement
- Team size requirement (2 to 4 members)
- Financial benefit - prize money for top teams
- UN SDG alignment mentioned - broader eligibility
- Application link present

**Key extracted fields:**

- Opportunity type: Competition
- Organization: Google
- Deadline: May 20, 2025
- Min CGPA: 0 (none required)
- Degree required: Any (must be a student)
- Skills required: Android, Flutter, or Web development
- Financial benefit: Yes (USD 3,000 for top global teams)
- Location: Remote/online
- Application link: Present

---

## Email 7 - UMT Weekly Newsletter (Spam)

**Subject:** UMT Weekly Newsletter - April Edition
**From:** newsletter@umt.edu.pk
**Classification:** Spam - Newsletter

**What it tests:**

- Newsletter classification - informational content with no application opportunity
- University-branded email correctly classified as non-opportunity
- Appears in spam section with reason: "university newsletter, no application opportunity"

**Why it is spam:**

- No call to action for the student to apply or participate
- No eligibility criteria
- Informational content only (schedule, cafeteria menu, cricket match)
- No structured opportunity for the student

---

## Email 8 - LUMS MBA Admission

**Subject:** LUMS MBA Early Admission - Merit Scholarships Available
**From:** admissions@lums.edu.pk
**Classification:** Real opportunity - Admission

**What it tests:**

- Admission type opportunity
- Multiple required documents - tests completeness scoring
- Scholarship available - financial benefit flag
- Work experience preferred but not required - nuanced eligibility
- GMAT/GRE optional for this cohort
- High-prestige institution - tests organization extraction
- Distant deadline (June 30, 2025) - moderate urgency

**Key extracted fields:**

- Opportunity type: Admission
- Organization: LUMS School of Business
- Deadline: June 30, 2025
- Min CGPA: Not stated (strong academic record preferred)
- Degree required: BS (any field, for MBA)
- Financial benefit: Yes (up to 100% tuition waiver)
- Required documents: Transcripts, 2 recommendation letters, personal statement, GMAT/GRE optional
- Application link: Present

---

## What a Demo Run Should Show

When the sample emails are loaded and a typical BS CS student profile is entered (CGPA around 3.5, skills in Python and ML, financial need checked, internship and scholarship preferred), the expected ranked output should look approximately like this:

| Rank | Opportunity                | Why ranked here                                       |
| ---- | -------------------------- | ----------------------------------------------------- |
| 1    | Amal Fellowship            | Urgent deadline + no CGPA barrier + financial benefit |
| 2    | Systems Limited Internship | Strong skills match + stipend + clear deadline        |
| 3    | HEC Scholarship            | Financial need match + accessible CGPA requirement    |
| 4    | Google Solution Challenge  | Good match but skills partially different             |
| 5    | LUMS MBA                   | Good completeness but distant deadline and MS-level   |
| 6    | ICPC Competition           | No barriers but very distant deadline                 |
| Spam | Daraz sale                 | Promotional                                           |
| Spam | UMT Newsletter             | Informational                                         |

The exact ranking depends on the student's profile inputs. This ordering is illustrative for a typical BS CS student.
