<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/logo/logowhite.svg">
  <img src="public/logo/logomark.svg" alt="Mail Detective Logo" width="160"/>
</picture>

# Mail Detective

### AI-Powered Opportunity Inbox Copilot

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.4-6366F1?style=for-the-badge)](https://better-auth.com/)

[![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=for-the-badge&logo=trpc&logoColor=white)](https://trpc.io/)

</div>

---

## Overview

**Mail Detective** is an AI-powered inbox copilot designed for university students. Every week students receive dozens of emails about scholarships, internships, competitions, and fellowships — most get buried or ignored. Mail Detective investigates every email, extracts the intelligence hidden inside, and tells the student exactly which opportunity to act on first and why.

Three AI agents work the case in sequence:

|         Agent         | Role                                                        |
| :-------------------: | :---------------------------------------------------------- |
| **Agent 1 — Filter**  | Classifies each email: `RELEVANT`, `IGNORE`, or `SPAM`      |
| **Agent 2 — Extract** | Pulls 16 structured fields from every relevant email        |
|  **Agent 3 — Score**  | Scores each opportunity 0–100 against the student's profile |

The final output is a ranked list of opportunities — deadline-aware, profile-matched, and verdict-stamped (`APPLY`, `CONSIDER`, or `SKIP`).

---

## The Problem

Students miss life-changing opportunities because email inboxes are noisy. The problem is not lack of opportunity — it is lack of signal. Mail Detective solves this by applying a three-stage AI pipeline on raw email text and producing a concise, prioritized action list personalized to each student's academic profile.

---

## Key Features

- **Three-agent AI pipeline** — Filter, Extract, and Score emails in sequence
- **16-field structured extraction** — Deadlines, eligibility, stipends, documents, and more
- **Profile-based scoring** — Each opportunity scored 0–100 against the student's academic profile
- **Verdict system** — Clear `APPLY`, `CONSIDER`, or `SKIP` recommendations
- **Deadline awareness** — Urgency-based ranking with countdown tracking
- **Resume parsing** — Upload a PDF resume to auto-populate your profile
- **Multi-key Gemini rotation** — Built-in API key rotation with retry on 429/503
- **Full auth system** — Email/password, OAuth (GitHub, Google), email verification, password reset
- **Dark mode** — System-aware theme switching

---

## Quick Start

### Prerequisites

|                                        Requirement                                         |    Version    |
| :----------------------------------------------------------------------------------------: | :-----------: |
|   ![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)    |      18+      |
| ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white) | Atlas cluster |
| ![Gemini](https://img.shields.io/badge/Gemini-API_Key-4285F4?logo=google&logoColor=white)  |   Required    |
|                ![Brevo](https://img.shields.io/badge/Brevo-SMTP_Key-0078D4)                |   Required    |

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mail-detective.git
cd mail-detective

# Install dependencies
npm install

# Copy environment file and fill in credentials
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

```env
# MongoDB Atlas
DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>"

# Better Auth
BETTER_AUTH_SECRET="your-32-char-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Brevo SMTP (email verification)
BREVO_USER="your@email.com"
BREVO_PASS="xsmtpsib-..."

# Gemini - comma-separated for key rotation
GEMINI_API_KEY="key1,key2,key3"
```

> See [docs/API-INTEGRATION.md](docs/API-INTEGRATION.md) for Gemini configuration details.

---

## Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Framework | Next.js 16.1 (App Router, Turbopack) |
| Frontend  | React 19, Tailwind CSS 4             |
| Language  | TypeScript 5                         |
| Database  | MongoDB Atlas + Prisma 6             |
| Auth      | Better Auth 1.4                      |
| AI        | Gemini 2.0 Flash (multi-key)         |
| API Layer | tRPC 11                              |
| Email     | Brevo SMTP (Nodemailer)              |

---

## Project Structure

```
mail-detective/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Better Auth handler
│   │   │   ├── emails/        # filter · extract · score
│   │   │   └── trpc/          # tRPC router
│   │   ├── dashboard/         # Main email client UI
│   │   ├── profile/setup/     # Onboarding wizard
│   │   ├── signin / signup/   # Auth pages
│   │   └── settings/
│   ├── components/
│   │   └── dashboard/         # Sidebar · EmailList · EmailDetail
│   ├── lib/
│   │   ├── gemini.ts          # Multi-key rotation client
│   │   ├── emails/            # types · parse · scoring logic
│   │   └── auth.ts
│   └── server/routers/        # tRPC routers
├── prisma/schema.prisma        # MongoDB schema
└── docs/                      # Architecture & API docs
```

---

## Documentation

<div align="center">

|                        Document                        | Description                       |
| :----------------------------------------------------: | :-------------------------------- |
|            [docs/README.md](docs/README.md)            | Documentation index               |
|      [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)      | System design & data flow         |
|   [docs/API-INTEGRATION.md](docs/API-INTEGRATION.md)   | Gemini 2.0 Flash setup & prompts  |
| [docs/MATCHING-CRITERIA.md](docs/MATCHING-CRITERIA.md) | Scoring algorithm & ranking logic |
|       [docs/SAMPLE-DATA.md](docs/SAMPLE-DATA.md)       | Sample emails & test data         |

</div>

---

## Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema to MongoDB Atlas
```

---

## License

This project is proprietary. All rights reserved.

---

<div align="center">

_No email will escape._

</div>
