'use client';

import type { ClassifiedEmail, ScoredEmail, Verdict } from '@/lib/emails/types';
import { urgencyOf, daysUntil, prettyDeadline } from '@/lib/emails/deadline';

/**
 * Middle pane of the dashboard - a Gmail-style list of emails for the
 * currently-selected folder. Scored emails get a score pill and deadline
 * chip; unscored (ignored/spam) emails just show the basics.
 */
export function EmailList({
  scored,
  unscored,
  selectedId,
  savedIds,
  onSelect,
  onToggleStar,
  folderLabel,
}: {
  /** Scored opportunities (only relevant for Opportunities + Saved folders) */
  scored: ScoredEmail[];
  /** Filter-only emails for the Ignored/Spam folders */
  unscored: ClassifiedEmail[];
  selectedId: string | null;
  savedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  folderLabel: string;
}) {
  const showScored = scored.length > 0;
  const showUnscored = unscored.length > 0;
  const empty = !showScored && !showUnscored;

  return (
    <section className="flex h-full flex-col border-r border-border bg-background">
      <header className="flex items-baseline gap-3 border-b border-border px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Folder
        </p>
        <h2 className="font-serif text-xl text-foreground">{folderLabel}</h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {scored.length + unscored.length} item
          {scored.length + unscored.length === 1 ? '' : 's'}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {empty && (
          <div className="p-10 text-center">
            <p className="font-serif text-2xl text-foreground">Nothing here.</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Investigate more emails to fill this folder.
            </p>
          </div>
        )}

        {showScored && (
          <ul className="divide-y divide-border">
            {scored.map(e => (
              <ScoredRow
                key={e.id}
                email={e}
                selected={selectedId === e.id}
                saved={savedIds.has(e.id)}
                onSelect={() => onSelect(e.id)}
                onToggleStar={() => onToggleStar(e.id)}
              />
            ))}
          </ul>
        )}

        {showScored && showUnscored && (
          <div className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            -
          </div>
        )}

        {showUnscored && (
          <ul className="divide-y divide-border">
            {unscored.map(e => (
              <UnscoredRow
                key={e.id}
                email={e}
                selected={selectedId === e.id}
                onSelect={() => onSelect(e.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ScoredRow({
  email,
  selected,
  saved,
  onSelect,
  onToggleStar,
}: {
  email: ScoredEmail;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
}) {
  const u = urgencyOf(email.deadlineIso);
  const days = daysUntil(email.deadlineIso);

  return (
    <li
      onClick={onSelect}
      className={`grid cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-3.5 transition-colors ${
        selected ? 'bg-muted' : 'hover:bg-muted/40'
      }`}
    >
      {/* Left: score pill + star */}
      <div className="flex flex-col items-center gap-1.5 pt-0.5">
        <ScorePill score={email.score} verdict={email.verdict} />
        <button
          type="button"
          onClick={ev => {
            ev.stopPropagation();
            onToggleStar();
          }}
          title={saved ? 'Unsave' : 'Save for later'}
          className={`text-sm leading-none transition-colors ${
            saved
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>

      {/* Middle: content */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            {email.opportunityType}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">·</span>
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {email.organisation || email.from}
          </span>
        </div>

        <p className="mt-1 truncate text-[15px] font-medium text-foreground">
          {email.title}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {email.summary || email.subject}
        </p>

        {/* Deadline + highlight chips */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <DeadlineChip
            urgency={u}
            days={days}
            label={prettyDeadline(email.deadline, email.deadlineIso)}
          />
          {email.highlights.slice(0, 3).map((h, i) => (
            <span
              key={`${h}-${i}`}
              className="rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground"
            >
              {h}
            </span>
          ))}
          {email.stipendOrValue && (
            <span className="rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] text-background">
              {email.stipendOrValue.length > 36
                ? email.stipendOrValue.slice(0, 34) + '…'
                : email.stipendOrValue}
            </span>
          )}
        </div>
      </div>

      {/* Right: verdict */}
      <VerdictTag verdict={email.verdict} />
    </li>
  );
}

function UnscoredRow({
  email,
  selected,
  onSelect,
}: {
  email: ClassifiedEmail;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li
      onClick={onSelect}
      className={`grid cursor-pointer grid-cols-[1fr_auto] items-start gap-3 px-4 py-3 transition-colors ${
        selected ? 'bg-muted' : 'hover:bg-muted/40'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">
          {email.subject || '(no subject)'}
        </p>
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {email.from}
        </p>
        <p className="mt-1 truncate text-xs italic text-muted-foreground">
          “{email.reason}”
        </p>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {Math.round(email.confidence * 100)}%
      </span>
    </li>
  );
}

/* --------- chips --------- */

function ScorePill({ score, verdict }: { score: number; verdict: Verdict }) {
  const tone =
    verdict === 'APPLY'
      ? 'bg-foreground text-background'
      : verdict === 'CONSIDER'
        ? 'bg-muted text-foreground border border-border'
        : 'bg-background text-muted-foreground border border-border';
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-[11px] ${tone}`}
    >
      {score}
    </span>
  );
}

function VerdictTag({ verdict }: { verdict: Verdict }) {
  const color =
    verdict === 'APPLY'
      ? 'text-foreground'
      : verdict === 'CONSIDER'
        ? 'text-muted-foreground'
        : 'text-muted-foreground/60';
  return (
    <span
      className={`mt-0.5 shrink-0 font-mono text-[9px] uppercase tracking-[0.3em] ${color}`}
    >
      {verdict}
    </span>
  );
}

function DeadlineChip({
  urgency,
  days,
  label,
}: {
  urgency: ReturnType<typeof urgencyOf>;
  days: number | null;
  label: string;
}) {
  if (urgency === 'UNKNOWN') {
    return (
      <span className="rounded-full border border-dashed border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
        no deadline
      </span>
    );
  }

  // After the UNKNOWN early return above, urgency is narrowed.
  const styles: Record<'PAST' | 'CRITICAL' | 'SOON' | 'LATER' | 'FAR', string> =
    {
      PAST: 'border border-red-500/40 text-red-500 line-through',
      CRITICAL: 'bg-red-500 text-white',
      SOON: 'bg-amber-500 text-black',
      LATER: 'border border-border text-foreground',
      FAR: 'border border-border text-muted-foreground',
    };

  const suffix =
    days === null
      ? ''
      : days < 0
        ? ` · ${Math.abs(days)}d ago`
        : days === 0
          ? ' · today'
          : ` · ${days}d left`;

  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${styles[urgency]}`}
    >
      {label}
      {suffix}
    </span>
  );
}
