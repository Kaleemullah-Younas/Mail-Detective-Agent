'use client';

import type { ClassifiedEmail, ScoredEmail, Verdict } from '@/lib/emails/types';
import { HighlightedText } from './HighlightedText';
import { urgencyOf, daysUntil, prettyDeadline } from '@/lib/emails/deadline';

type Props = {
  scored: ScoredEmail | null;
  unscored: ClassifiedEmail | null;
  saved: boolean;
  onToggleStar: () => void;
  onClose: () => void;
};

export function EmailDetail({
  scored,
  unscored,
  saved,
  onToggleStar,
  onClose,
}: Props) {
  if (!scored && !unscored) {
    return (
      <section className="flex h-full items-center justify-center bg-background">
        <div className="max-w-sm px-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Nothing selected
          </p>
          <h3 className="mt-3 font-serif text-3xl text-foreground">
            Pick a case from the list.
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            The detective&apos;s notes open here.
          </p>
        </div>
      </section>
    );
  }

  if (scored) {
    return (
      <ScoredDetail
        email={scored}
        saved={saved}
        onToggleStar={onToggleStar}
        onClose={onClose}
      />
    );
  }
  return <UnscoredDetail email={unscored!} onClose={onClose} />;
}

function ScoredDetail({
  email,
  saved,
  onToggleStar,
  onClose,
}: {
  email: ScoredEmail;
  saved: boolean;
  onToggleStar: () => void;
  onClose: () => void;
}) {
  const days = daysUntil(email.deadlineIso);
  const u = urgencyOf(email.deadlineIso);

  return (
    <section className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground md:hidden"
        >
          ← back
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Case file · {email.opportunityType}
        </span>
        <span className="ml-auto flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleStar}
            className={`font-mono text-[11px] uppercase tracking-[0.25em] transition-colors ${
              saved
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {saved ? '★ saved' : '☆ save for later'}
          </button>
          {email.link && (
            <a
              href={email.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center rounded-full bg-foreground px-3 font-mono text-[10px] uppercase tracking-[0.25em] text-background hover:opacity-90"
            >
              Open link ↗
            </a>
          )}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b border-border px-6 py-6 md:px-10 md:py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {email.organisation || email.from}
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-4xl">
            {email.title}
          </h1>
          <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted-foreground md:text-base">
            {email.summary}
          </p>

          {/* Verdict + score strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            <VerdictCard verdict={email.verdict} score={email.score} />
            <Dim label="Urgency" value={email.urgencyScore} />
            <Dim label="Fit" value={email.fitScore} />
            <Dim label="Eligibility" value={email.eligibilityScore} />
            <Dim label="Effort↔Reward" value={email.effortRewardScore} />
          </div>

          {/* Reasoning */}
          {email.reasoning && (
            <blockquote className="mt-6 border-l-2 border-foreground/40 pl-4 font-serif text-lg italic text-foreground">
              “{email.reasoning}”
            </blockquote>
          )}
        </header>

        {/* Facts grid */}
        <section className="border-b border-border px-6 py-6 md:px-10">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Fact
              label="Deadline"
              value={
                <span className="flex flex-wrap items-center gap-2">
                  {prettyDeadline(email.deadline, email.deadlineIso)}
                  {days !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                        u === 'CRITICAL'
                          ? 'bg-red-500 text-white'
                          : u === 'SOON'
                            ? 'bg-amber-500 text-black'
                            : u === 'PAST'
                              ? 'border border-red-500/40 text-red-500 line-through'
                              : 'border border-border text-foreground'
                      }`}
                    >
                      {days < 0
                        ? `${Math.abs(days)} days ago`
                        : days === 0
                          ? 'today'
                          : `${days} days left`}
                    </span>
                  )}
                </span>
              }
            />
            <Fact label="Location" value={email.location || '-'} />
            <Fact label="Value / stipend" value={email.stipendOrValue || '-'} />
            <Fact
              label="Highlights"
              value={
                email.highlights.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {email.highlights.map((h, i) => (
                      <span
                        key={`${h}-${i}`}
                        className="rounded-full border border-border px-2 py-0.5 text-[11px]"
                      >
                        {h}
                      </span>
                    ))}
                  </span>
                ) : (
                  '-'
                )
              }
            />
          </div>

          {(email.eligibility.length > 0 ||
            email.requiredDocuments.length > 0) && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {email.eligibility.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Eligibility
                  </p>
                  <ul className="mt-2 space-y-1">
                    {email.eligibility.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-baseline gap-2 text-sm text-foreground"
                      >
                        <span className="text-muted-foreground">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {email.requiredDocuments.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Documents
                  </p>
                  <ul className="mt-2 space-y-1">
                    {email.requiredDocuments.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-baseline gap-2 text-sm text-foreground"
                      >
                        <span className="text-muted-foreground">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Original email body with highlights */}
        <section className="px-6 py-6 md:px-10 md:py-8">
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Original email
            </p>
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              from · {email.from}
            </span>
            {email.date && (
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {new Date(email.date).toISOString().slice(0, 10)}
              </span>
            )}
          </div>
          <h3 className="mt-3 font-serif text-xl text-foreground">
            {email.subject}
          </h3>
          <div className="mt-4 whitespace-pre-wrap border-l-2 border-border pl-4 font-mono text-[13px] leading-relaxed text-foreground">
            <HighlightedText text={email.body} highlights={email.highlights} />
          </div>
        </section>
      </div>
    </section>
  );
}

function UnscoredDetail({
  email,
  onClose,
}: {
  email: ClassifiedEmail;
  onClose: () => void;
}) {
  return (
    <section className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground md:hidden"
        >
          ← back
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Filter agent · {email.category.toLowerCase()}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {email.from}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground">
          {email.subject || '(no subject)'}
        </h1>
        <blockquote className="mt-4 border-l-2 border-foreground/40 pl-4 text-sm italic text-foreground">
          “{email.reason}”
        </blockquote>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Confidence · {Math.round(email.confidence * 100)}%
        </p>
        <pre className="mt-6 whitespace-pre-wrap border-l-2 border-border pl-4 font-mono text-[13px] leading-relaxed text-foreground">
          {email.body}
        </pre>
      </div>
    </section>
  );
}

/* ------- small presentation helpers ------- */

function VerdictCard({ verdict, score }: { verdict: Verdict; score: number }) {
  const tone =
    verdict === 'APPLY'
      ? 'bg-foreground text-background'
      : verdict === 'CONSIDER'
        ? 'border border-border text-foreground bg-background'
        : 'border border-border text-muted-foreground bg-background';
  return (
    <div
      className={`flex flex-col items-start justify-center rounded-md p-3 ${tone}`}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-80">
        verdict
      </span>
      <span className="mt-1 font-serif text-2xl leading-none">
        {verdict === 'APPLY'
          ? 'Apply'
          : verdict === 'CONSIDER'
            ? 'Consider'
            : 'Skip'}
      </span>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] opacity-80">
        score · {score}/100
      </span>
    </div>
  );
}

function Dim({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-xl text-foreground">{value}</p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full bg-foreground" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 text-sm text-foreground">{value}</div>
    </div>
  );
}
