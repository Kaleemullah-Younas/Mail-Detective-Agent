'use client';

import { useMemo, useState } from 'react';
import { getSampleInbox } from '@/lib/emails/sample-inbox';
import { parsePastedEmails, parseUploadedFile } from '@/lib/emails/parse';
import type { RawEmail } from '@/lib/emails/types';

type Tab = 'paste' | 'upload' | 'inbox';

const PASTE_EXAMPLE = `From: fulbright@usefp.org
Subject: Fulbright 2026 applications open
Date: 2026-03-18

Applications for the Fulbright Foreign Student Program are now open.
Deadline: 15 May 2026. Apply at https://fulbright.usefp.org/apply

---

From: careers@afiniti.com
Subject: Software Engineer (Islamabad)

We are hiring full-time Software Engineers. 0-2 years experience.
Apply: afiniti.com/careers`;

export function EmailIntake({
  onSubmit,
  isPending,
}: {
  onSubmit: (emails: RawEmail[]) => void;
  isPending: boolean;
}) {
  const [tab, setTab] = useState<Tab>('paste');

  // --- Paste state ---
  const [pasted, setPasted] = useState('');
  const pastedEmails = useMemo(() => parsePastedEmails(pasted), [pasted]);

  // --- Upload state ---
  const [uploaded, setUploaded] = useState<RawEmail[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- Sample inbox state ---
  // Lazy initialiser - runs once on mount, only on the client, so the random
  // shuffle stays stable within a single mount.
  const [inbox, setInbox] = useState<RawEmail[]>(() => getSampleInbox(15));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const shuffle = () => {
    const fresh = getSampleInbox(15);
    setInbox(fresh);
    setSelected(new Set());
  };

  const toggleSelected = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAll = () => setSelected(new Set(inbox.map(e => e.id)));
  const selectNone = () => setSelected(new Set());

  const onFiles = async (files: FileList | null) => {
    setUploadError(null);
    if (!files || files.length === 0) return;
    if (files.length > 25) {
      setUploadError('Maximum 25 files per batch.');
      return;
    }
    const out: RawEmail[] = [];
    let idx = 0;
    for (const f of Array.from(files)) {
      if (!f.name.toLowerCase().endsWith('.txt') && f.type !== 'text/plain') {
        setUploadError(`"${f.name}" is not a .txt file.`);
        return;
      }
      if (f.size > 1024 * 1024) {
        setUploadError(`"${f.name}" is larger than 1 MB.`);
        return;
      }
      const text = await f.text();
      out.push(parseUploadedFile(f.name, text, idx));
      idx++;
    }
    setUploaded(out);
  };

  const candidateEmails: RawEmail[] =
    tab === 'paste'
      ? pastedEmails
      : tab === 'upload'
        ? uploaded
        : inbox.filter(e => selected.has(e.id));

  const submit = () => {
    if (candidateEmails.length === 0) return;
    onSubmit(candidateEmails);
  };

  return (
    <section className="border border-border bg-background">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <TabButton active={tab === 'paste'} onClick={() => setTab('paste')}>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
            01
          </span>
          <span>Paste</span>
        </TabButton>
        <TabButton active={tab === 'upload'} onClick={() => setTab('upload')}>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
            02
          </span>
          <span>Upload .txt</span>
        </TabButton>
        <TabButton active={tab === 'inbox'} onClick={() => setTab('inbox')}>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
            03
          </span>
          <span>Sample inbox</span>
        </TabButton>
      </div>

      {/* Panel */}
      <div className="p-6 md:p-8">
        {tab === 'paste' && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Paste one or more emails. Separate them with a line of three
              dashes (---).
            </p>
            <textarea
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              rows={16}
              spellCheck={false}
              placeholder={PASTE_EXAMPLE}
              className="mt-3 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-1 focus:ring-foreground"
            />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Detected - {pastedEmails.length} email
              {pastedEmails.length === 1 ? '' : 's'}
            </p>
          </div>
        )}

        {tab === 'upload' && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Drop up to 25 .txt files - one email per file.
            </p>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center border border-dashed border-border p-10 text-center transition-colors hover:bg-muted/40">
              <input
                type="file"
                accept=".txt,text/plain"
                multiple
                hidden
                onChange={e => onFiles(e.target.files)}
              />
              <p className="font-serif text-2xl text-foreground">
                {uploaded.length === 0
                  ? 'Click or drop .txt files'
                  : `${uploaded.length} file${
                      uploaded.length === 1 ? '' : 's'
                    } loaded`}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                .txt only · max 1 mb each
              </p>
            </label>

            {uploadError && (
              <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-600 dark:text-red-400">
                {uploadError}
              </div>
            )}

            {uploaded.length > 0 && (
              <ul className="mt-4 divide-y divide-border border border-border">
                {uploaded.map(e => (
                  <li key={e.id} className="flex items-baseline gap-4 p-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {e.id}
                    </span>
                    <span className="truncate text-sm text-foreground">
                      {e.subject}
                    </span>
                    <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground">
                      {e.from}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'inbox' && (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                15 random emails from a pool of 50 · tick the ones to
                investigate
              </p>
              <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-muted-foreground hover:text-foreground"
                >
                  select all
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-muted-foreground hover:text-foreground"
                >
                  clear
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={shuffle}
                  className="text-foreground hover:opacity-70"
                >
                  refresh ↻
                </button>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-border border border-border">
              {inbox.map(e => {
                const on = selected.has(e.id);
                return (
                  <li
                    key={e.id}
                    onClick={() => toggleSelected(e.id)}
                    className={`grid cursor-pointer grid-cols-[auto_1fr_auto] items-baseline gap-4 p-3 transition-colors ${
                      on ? 'bg-muted/60' : 'hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleSelected(e.id)}
                      onClick={ev => ev.stopPropagation()}
                      className="h-4 w-4 cursor-pointer accent-foreground"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        {e.subject}
                      </p>
                      <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {e.from}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {e.date
                        ? new Date(e.date).toISOString().slice(0, 10)
                        : ''}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Selected - {selected.size} of {inbox.length}
            </p>
          </div>
        )}

        {/* Action bar */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <button
            type="button"
            disabled={candidateEmails.length === 0 || isPending}
            onClick={submit}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:gap-3 disabled:opacity-40"
          >
            {isPending
              ? 'Agents at work…'
              : `Investigate ${candidateEmails.length || ''}${
                  candidateEmails.length
                    ? ` email${candidateEmails.length === 1 ? '' : 's'}`
                    : 'emails'
                }`}
            <span aria-hidden>→</span>
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Filter agent runs first · extract & score come next
          </span>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-baseline justify-center gap-2 px-4 py-3 text-sm transition-colors ${
        active
          ? 'bg-background text-foreground'
          : 'bg-muted/40 text-muted-foreground hover:text-foreground'
      } ${active ? '' : 'border-b border-border'}`}
    >
      {children}
    </button>
  );
}
