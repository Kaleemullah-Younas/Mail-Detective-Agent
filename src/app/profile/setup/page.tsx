import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ProfileSetupPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    const existing = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (existing) {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Heading */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <aside className="md:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Step 01 of 02 · Open the file
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1] text-foreground md:text-6xl">
              Tell us
              <br />
              <span className="italic text-muted-foreground">about you.</span>
            </h1>
            <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
              The detective needs a profile before it can read your inbox. Pick
              the route that hurts less.
            </p>
            <div className="mt-8 h-px w-12 bg-foreground/40" />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Either way · 2 minutes
            </p>
          </aside>

          {/* Choice cards */}
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:col-span-8 md:grid-cols-2">
            {/* Resume */}
            <Link
              href="/profile/setup/resume"
              className="group flex flex-col bg-background p-8 transition-colors hover:bg-muted/40 md:p-10"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Route A
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <ResumeIcon className="mt-8 h-10 w-10 text-foreground" />

              <h2 className="mt-6 text-3xl font-semibold text-foreground">
                Hand over your résumé.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Drop a PDF. Gemini reads the page, an OCR agent pulls your
                photo, and the form fills itself. You only confirm what matters.
              </p>

              <div className="mt-auto pt-10">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground transition-all group-hover:gap-3">
                  Upload PDF / DOCX
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>

            {/* Manual */}
            <Link
              href="/profile/setup/manual"
              className="group flex flex-col bg-background p-8 transition-colors hover:bg-muted/40 md:p-10"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Route B
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <PenIcon className="mt-8 h-10 w-10 text-foreground" />

              <h2 className="mt-6 text-3xl font-semibold text-foreground">
                Fill it in by hand.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A short structured form - degree, semester, CGPA, skills, what
                you&apos;re hunting for. Six fields. No résumé needed.
              </p>

              <div className="mt-auto pt-10">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground transition-all group-hover:gap-3">
                  Start typing
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-16 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>You can edit everything later from the dashboard</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </div>
  );
}

function ResumeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M8 4h12l6 6v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M20 4v6h6" />
      <line x1="11" y1="17" x2="21" y2="17" />
      <line x1="11" y1="21" x2="21" y2="21" />
      <line x1="11" y1="25" x2="17" y2="25" />
    </svg>
  );
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M22 4l6 6-16 16-7 1 1-7L22 4z" />
      <line x1="18" y1="8" x2="24" y2="14" />
      <line x1="6" y1="28" x2="13" y2="21" />
    </svg>
  );
}
