'use client';

import Link from 'next/link';
import type { EmailCategory } from '@/lib/emails/types';

export type Folder = 'OPPORTUNITIES' | 'SAVED' | 'IGNORED' | 'SPAM';

export function Sidebar({
  active,
  counts,
  profileName,
  onPick,
}: {
  active: Folder;
  counts: Record<Folder, number>;
  profileName: string;
  onPick: (f: Folder) => void;
}) {
  return (
    <aside className="flex h-full flex-col border-r border-border bg-background">
      {/* Detective */}
      <div className="border-b border-border px-5 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Detective
        </p>
        <p className="mt-1 truncate font-serif text-xl text-foreground">
          {profileName}
        </p>
        <Link
          href="/profile/setup/manual"
          className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          edit profile →
        </Link>
      </div>

      {/* Folders */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Case folders
        </p>
        <FolderRow
          label="Opportunities"
          hint="scored · ranked"
          count={counts.OPPORTUNITIES}
          active={active === 'OPPORTUNITIES'}
          onClick={() => onPick('OPPORTUNITIES')}
        />
        <FolderRow
          label="Saved"
          hint="starred for later"
          count={counts.SAVED}
          active={active === 'SAVED'}
          onClick={() => onPick('SAVED')}
          accent="star"
        />

        <p className="mt-5 px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Filtered out
        </p>
        <FolderRow
          label="Ignored"
          hint="noise · automated"
          count={counts.IGNORED}
          active={active === 'IGNORED'}
          onClick={() => onPick('IGNORED')}
        />
        <FolderRow
          label="Spam"
          hint="phishing · scams"
          count={counts.SPAM}
          active={active === 'SPAM'}
          onClick={() => onPick('SPAM')}
          accent="danger"
        />
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Mail Detective · every email investigated
      </div>
    </aside>
  );
}

function FolderRow({
  label,
  hint,
  count,
  active,
  onClick,
  accent,
}: {
  label: string;
  hint: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: 'star' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-foreground text-background' : 'hover:bg-muted/60'
      }`}
    >
      <span
        aria-hidden
        className={`font-mono text-[11px] ${
          active
            ? 'text-background/60'
            : accent === 'star'
              ? 'text-foreground'
              : accent === 'danger'
                ? 'text-red-500'
                : 'text-muted-foreground'
        }`}
      >
        {accent === 'star' ? '★' : accent === 'danger' ? '▲' : ''}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm">{label}</span>
        <span
          className={`block font-mono text-[9px] uppercase tracking-[0.25em] ${
            active ? 'text-background/60' : 'text-muted-foreground'
          }`}
        >
          {hint}
        </span>
      </span>
      <span
        className={`font-mono text-[11px] ${
          active ? 'text-background' : 'text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export type { EmailCategory };
