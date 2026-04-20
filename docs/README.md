# Mail Detective

### No email will escape

AI-Powered Email Intelligence Platform — Opportunity Inbox Copilot

---

## What is Mail Detective?

Mail Detective is an AI-powered email intelligence platform built for university students. Students receive dozens of emails about scholarships, internships, competitions, and fellowships every week - but most get ignored, buried, or mistaken for spam. Mail Detective investigates every email, extracts the intelligence hidden inside, and tells the student exactly which opportunity to act on first and why.

It goes into your inbox, finds what matters, and files a classified report.

---

## Documentation Index

| Document             | Description                               |
| -------------------- | ----------------------------------------- |
| README.md            | Project overview - this file              |
| ARCHITECTURE.md      | System design, data flow, components      |
| MATCHING-CRITERIA.md | Full scoring algorithm and matching logic |
| API-INTEGRATION.md   | Gemini 2.0 Flash setup and prompt design  |
| UI-FLOW.md           | Screen by screen user journey             |
| SAMPLE-DATA.md       | Sample emails used in the demo            |

---

## The Problem Being Solved

University students in Pakistan receive a high volume of opportunity-related emails. The core problems are:

- Real opportunities look identical to promotional spam at a glance
- Important deadlines are buried inside long email bodies
- Students have no way to know which opportunity fits their profile best
- Action steps are never clearly stated in the emails themselves
- No system exists that ranks opportunities by personal relevance

Mail Detective solves all five problems in a single workflow.

---

## Tech Stack Summary

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Framework      | Next.js 16.1 (App Router, Turbopack)                    |
| Frontend       | React 19, Tailwind CSS 4, TypeScript 5                  |
| Database       | MongoDB Atlas + Prisma 6                                |
| Auth           | Better Auth 1.4                                         |
| AI Model       | Gemini 2.0 Flash via Google AI Studio API               |
| API Layer      | tRPC 11                                                 |
| Scoring Engine | Deterministic TypeScript — no AI involvement in ranking |
| Email          | Brevo SMTP (Nodemailer)                                 |

---

## Core Capabilities

- Accepts 5 to 15 raw emails pasted by the user
- Classifies each email as a real opportunity or noise
- Extracts 16 structured fields per email using AI
- Scores every opportunity out of 100 using a rule-based algorithm
- Ranks opportunities from highest to lowest priority
- Generates a practical action checklist per opportunity
- Displays urgency level with deadline countdown
- Collapses spam and irrelevant emails into a separate section

---

## Who Uses This

Any Pakistani university student who wants to stop missing opportunities. The system is designed around the Pakistani higher education context - HEC scholarships, LUMS admissions, Systems Limited internships, ICPC competitions, and similar local and international opportunities that regularly land in student inboxes.
