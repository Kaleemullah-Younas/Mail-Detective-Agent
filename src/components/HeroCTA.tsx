'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export function HeroCTA() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard"
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-brand font-medium text-background transition-all duration-300 hover:gap-3"
        >
          Go to Dashboard
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3">
      <Link
        href="/signup"
        className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-brand font-medium text-background transition-all duration-300 hover:gap-3"
      >
        Start the investigation
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
      <Link
        href="/signin"
        className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-brand font-medium text-foreground transition-colors hover:bg-muted"
      >
        Sign In
      </Link>
    </div>
  );
}
