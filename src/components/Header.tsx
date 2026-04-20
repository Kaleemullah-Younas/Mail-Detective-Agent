'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserDropdown } from '@/components/UserDropdown';

export function Header() {
  const { data: session, isPending } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-12 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-foreground transition-all duration-300"
        >
          <Image
            src="/logo/logowhite.svg"
            alt="Mail Detective"
            width={32}
            height={32}
            unoptimized
            className="rounded-sm dark:hidden"
          />
          <Image
            src="/logo/logomark.svg"
            alt="Mail Detective"
            width={32}
            height={32}
            unoptimized
            className="hidden rounded-sm dark:block"
          />
          <span className="font-brand text-2xl leading-none tracking-tight">
            Mail Detective
          </span>
        </Link>

        {/* Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          ) : session ? (
            <UserDropdown user={session.user} />
          ) : (
            <>
              <Link
                href="/signin"
                className="flex h-9 items-center justify-center rounded-lg px-3 sm:px-4 text-sm font-brand font-medium text-muted-foreground transition-all duration-300 hover:text-foreground cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex h-9 items-center justify-center rounded-lg bg-primary px-3 sm:px-5 text-sm font-brand font-medium text-primary-foreground transition-all duration-300 hover:opacity-90 shadow-sm cursor-pointer"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
