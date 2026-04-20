'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { EmailIntake } from '@/components/dashboard/EmailIntake';
import { Sidebar, type Folder } from '@/components/dashboard/Sidebar';
import { EmailList } from '@/components/dashboard/EmailList';
import { EmailDetail } from '@/components/dashboard/EmailDetail';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/Toast';
import type {
  RawEmail,
  ClassifiedEmail,
  ExtractedEmail,
  ScoredEmail,
} from '@/lib/emails/types';

type Profile = {
  id: string;
  fullName: string;
  degreeProgram: string;
  university: string | null;
  semester: number;
  cgpa: number;
  skills: string[];
  preferredOpportunityTypes: string[];
  financialNeed: boolean;
  locationPreference: string | null;
  source: 'MANUAL' | 'RESUME';
};

type Stage = 'idle' | 'filtering' | 'extracting' | 'scoring' | 'done' | 'error';

const STAGE_LABEL: Record<Stage, string> = {
  idle: '',
  filtering: 'Agent 1 · filtering opportunities from noise',
  extracting: 'Agent 2 · extracting deadlines and details',
  scoring: 'Agent 3 · scoring against your profile',
  done: '',
  error: '',
};

export function DashboardClient({ profile }: { profile: Profile }) {
  const toast = useToast();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [classified, setClassified] = useState<ClassifiedEmail[]>([]);
  const [scored, setScored] = useState<ScoredEmail[]>([]);

  const [folder, setFolder] = useState<Folder>('OPPORTUNITIES');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Mobile: false = list visible, true = detail visible. Ignored on desktop.
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Saved emails (persistent) ---
  const savedQuery = trpc.savedEmail.list.useQuery();
  const savedIdsSet = useMemo(
    () => new Set((savedQuery.data ?? []).map(r => r.emailId)),
    [savedQuery.data],
  );

  // --- Investigation batch persistence ---
  const batchQuery = trpc.investigationBatch.getLatest.useQuery();
  const saveBatch = trpc.investigationBatch.save.useMutation();
  const clearBatch = trpc.investigationBatch.clear.useMutation();
  // Prevent re-restoring from DB after the user explicitly resets
  const didResetRef = useRef(false);

  useEffect(() => {
    if (didResetRef.current) return;
    if (!batchQuery.data) return;
    // Only restore if local state is still pristine
    if (stage !== 'idle' || classified.length > 0 || scored.length > 0) return;
    const data = batchQuery.data as { classified: unknown; scored: unknown };
    setClassified(data.classified as ClassifiedEmail[]);
    setScored(data.scored as ScoredEmail[]);
    setStage('done');
    setFolder('OPPORTUNITIES');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchQuery.data]);

  const saveMut = trpc.savedEmail.save.useMutation({
    onSuccess: () => savedQuery.refetch(),
  });
  const unsaveMut = trpc.savedEmail.unsave.useMutation({
    onSuccess: () => savedQuery.refetch(),
  });

  const utils = trpc.useUtils();

  const toggleStar = async (emailId: string) => {
    // Email may live in the current scored batch OR in the Saved folder
    // (reconstructed from the DB). Check both.
    const liveEmail = scored.find(e => e.id === emailId);
    const savedRow =
      (savedQuery.data ?? []).find(r => r.emailId === emailId) ?? null;

    const wasSaved = savedIdsSet.has(emailId);

    try {
      if (wasSaved) {
        await unsaveMut.mutateAsync({ emailId });
        toast.success(
          'Removed from Saved',
          liveEmail?.title ?? savedRow?.title,
        );
      } else {
        const email = liveEmail;
        if (!email) return;
        await saveMut.mutateAsync({
          emailId: email.id,
          from: email.from,
          subject: email.subject,
          date: email.date ?? null,
          body: email.body,
          title: email.title,
          organisation: email.organisation,
          opportunityType: email.opportunityType,
          deadline: email.deadline,
          deadlineIso: email.deadlineIso,
          eligibility: email.eligibility,
          requiredDocuments: email.requiredDocuments,
          link: email.link,
          location: email.location,
          stipendOrValue: email.stipendOrValue,
          summary: email.summary,
          score: email.score,
          urgencyScore: email.urgencyScore,
          fitScore: email.fitScore,
          eligibilityScore: email.eligibilityScore,
          effortRewardScore: email.effortRewardScore,
          verdict: email.verdict,
          reasoning: email.reasoning,
          highlights: email.highlights,
        });
        toast.success('Saved for later', email.title);
      }
      utils.savedEmail.list.invalidate();
    } catch (err) {
      toast.error(
        wasSaved ? 'Could not unsave' : 'Could not save',
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  // --- Pipeline ---
  const runPipeline = async (emails: RawEmail[]) => {
    setError(null);
    setSelectedId(null);
    setStage('filtering');
    try {
      // 1. Filter
      const filterRes = await fetch('/api/emails/filter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      if (!filterRes.ok) {
        const body = await filterRes.json().catch(() => ({}));
        throw new Error(body?.error || `Filter failed (${filterRes.status})`);
      }
      const { classified: filtered } = (await filterRes.json()) as {
        classified: ClassifiedEmail[];
      };
      setClassified(filtered);

      const relevant = filtered.filter(e => e.category === 'RELEVANT');
      if (relevant.length === 0) {
        setScored([]);
        setStage('done');
        setFolder('OPPORTUNITIES');
        return;
      }

      // 2. Extract
      setStage('extracting');
      const extractRes = await fetch('/api/emails/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ emails: relevant }),
      });
      if (!extractRes.ok) {
        const body = await extractRes.json().catch(() => ({}));
        throw new Error(body?.error || `Extract failed (${extractRes.status})`);
      }
      const { extracted } = (await extractRes.json()) as {
        extracted: ExtractedEmail[];
      };

      // 3. Score
      setStage('scoring');
      const scoreRes = await fetch('/api/emails/score', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ emails: extracted }),
      });
      if (!scoreRes.ok) {
        const body = await scoreRes.json().catch(() => ({}));
        throw new Error(body?.error || `Score failed (${scoreRes.status})`);
      }
      const { scored: ranked } = (await scoreRes.json()) as {
        scored: ScoredEmail[];
      };
      setScored(ranked);
      setSelectedId(ranked[0]?.id ?? null);
      setStage('done');
      setFolder('OPPORTUNITIES');
      // Persist so results survive navigation / re-login
      saveBatch.mutate({
        classified: filtered as Record<string, unknown>[],
        scored: ranked as unknown as Record<string, unknown>[],
      });
      const apply = ranked.filter(r => r.verdict === 'APPLY').length;
      toast.success(
        'Case closed',
        `${ranked.length} opportunit${ranked.length === 1 ? 'y' : 'ies'} scored · ${apply} worth applying to`,
      );
    } catch (err) {
      setStage('error');
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error('Investigation failed', message);
    }
  };

  const reset = () => {
    didResetRef.current = true;
    clearBatch.mutate();
    setStage('idle');
    setError(null);
    setClassified([]);
    setScored([]);
    setSelectedId(null);
  };

  const isBusy =
    stage === 'filtering' || stage === 'extracting' || stage === 'scoring';

  // --- Derived folder contents ---
  const savedScored = useMemo<ScoredEmail[]>(() => {
    const session = new Map(scored.map(s => [s.id, s]));
    const rows = savedQuery.data ?? [];
    return rows.map(row => {
      // Prefer live session version if available (fresh body highlighting)
      const live = session.get(row.emailId);
      if (live) return live;
      // Reconstruct ScoredEmail from the persisted row
      return {
        id: row.emailId,
        from: row.from,
        subject: row.subject,
        date: row.date ?? undefined,
        body: row.body,
        category: 'RELEVANT' as const,
        reason: row.summary,
        confidence: 1,
        title: row.title,
        organisation: row.organisation,
        opportunityType:
          (row.opportunityType as ScoredEmail['opportunityType']) ?? 'Other',
        deadline: row.deadline,
        deadlineIso: row.deadlineIso,
        eligibility: row.eligibility,
        requiredDocuments: row.requiredDocuments,
        link: row.link,
        location: row.location,
        stipendOrValue: row.stipendOrValue,
        summary: row.summary,
        score: row.score,
        urgencyScore: row.urgencyScore,
        fitScore: row.fitScore,
        eligibilityScore: row.eligibilityScore,
        effortRewardScore: row.effortRewardScore,
        verdict: (row.verdict as ScoredEmail['verdict']) ?? 'CONSIDER',
        reasoning: row.reasoning,
        highlights: row.highlights,
      };
    });
  }, [savedQuery.data, scored]);

  const ignored = useMemo(
    () =>
      classified.filter(
        e => e.category === 'IGNORE' || e.category === 'IRRELEVANT',
      ),
    [classified],
  );
  const spam = useMemo(
    () => classified.filter(e => e.category === 'SPAM'),
    [classified],
  );

  const counts: Record<Folder, number> = {
    OPPORTUNITIES: scored.length,
    SAVED: savedScored.length,
    IGNORED: ignored.length,
    SPAM: spam.length,
  };

  const folderLabel =
    folder === 'OPPORTUNITIES'
      ? 'Opportunities'
      : folder === 'SAVED'
        ? 'Saved'
        : folder === 'IGNORED'
          ? 'Ignored'
          : 'Spam';

  const folderScored =
    folder === 'OPPORTUNITIES' ? scored : folder === 'SAVED' ? savedScored : [];

  const folderUnscored =
    folder === 'IGNORED' ? ignored : folder === 'SPAM' ? spam : [];

  // Pick selected email for the detail pane
  const selectedScored =
    folderScored.find(e => e.id === selectedId) ?? folderScored[0] ?? null;
  const selectedUnscored =
    folderUnscored.find(e => e.id === selectedId) ?? folderUnscored[0] ?? null;

  // Ensure we don't carry a selectedId across folder switches
  const effectiveSelectedId =
    selectedScored?.id ?? selectedUnscored?.id ?? null;

  useEffect(() => {
    // When folder flips and selectedId is no longer in view, reset the hint.
    if (
      selectedId &&
      !folderScored.some(e => e.id === selectedId) &&
      !folderUnscored.some(e => e.id === selectedId)
    ) {
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  /* ---------- INTAKE VIEW (pre-run) ---------- */
  if (stage === 'idle' || isBusy || stage === 'error') {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-background">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
          <div className="flex flex-wrap items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>
              File -
              <span className="text-foreground">
                {profile.id.slice(-6).toUpperCase()}
              </span>
            </span>
            <span>·</span>
            <span>
              Detective on duty -{' '}
              <span className="text-foreground">{profile.fullName}</span>
            </span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h1 className="text-5xl font-semibold leading-[1] text-foreground md:text-6xl">
                The Inbox is a<br />
                <span className="italic text-muted-foreground">
                  crime scene.
                </span>
              </h1>
              <p className="mt-6 max-w-[54ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                Feed the detective five to twenty emails. Three agents - Filter,
                Extract, Score - work the case and rank every opportunity
                against your profile.
              </p>
              {isBusy && (
                <div className="mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-foreground" />
                  {STAGE_LABEL[stage]}
                </div>
              )}
            </div>

            <ProfileCard profile={profile} />
          </div>

          <div className="mt-16 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>02 - Intake the mail</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-6">
            <EmailIntake onSubmit={runPipeline} isPending={isBusy} />
          </div>

          {error && (
            <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- EMAIL CLIENT (post-run) ---------- */

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
  };

  const handleBackToList = () => {
    setMobileDetailOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      {/* Mobile top bar - only visible below md */}
      <div className="flex items-center gap-3 border-y border-border px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open folders"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Folder
          </p>
          <p className="truncate text-lg font-medium text-foreground">
            {folderLabel}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {folderScored.length + folderUnscored.length}
        </span>
      </div>

      {/* Main split - 3 panes on desktop, single pane on mobile */}
      <div className="grid w-full flex-1 grid-cols-1 overflow-hidden border-t border-border md:grid-cols-[260px_minmax(300px,380px)_1fr]">
        {/* Sidebar - static column on desktop, slide-over drawer on mobile */}
        <div className="hidden overflow-hidden md:block">
          <Sidebar
            active={folder}
            counts={counts}
            profileName={profile.fullName}
            onPick={f => {
              setFolder(f);
              setMobileDetailOpen(false);
            }}
          />
        </div>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close folders"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 w-[280px] max-w-[82vw] border-r border-border bg-background shadow-xl">
              <Sidebar
                active={folder}
                counts={counts}
                profileName={profile.fullName}
                onPick={f => {
                  setFolder(f);
                  setMobileDetailOpen(false);
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* List pane */}
        <div
          className={`overflow-hidden ${
            mobileDetailOpen ? 'hidden md:block' : 'block'
          }`}
        >
          <EmailList
            scored={folderScored}
            unscored={folderUnscored}
            selectedId={effectiveSelectedId}
            savedIds={savedIdsSet}
            onSelect={handleSelect}
            onToggleStar={toggleStar}
            folderLabel={folderLabel}
          />
        </div>

        {/* Detail pane */}
        <div
          className={`overflow-hidden ${
            mobileDetailOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <EmailDetail
            scored={selectedScored}
            unscored={selectedUnscored}
            saved={selectedScored ? savedIdsSet.has(selectedScored.id) : false}
            onToggleStar={() => selectedScored && toggleStar(selectedScored.id)}
            onClose={handleBackToList}
          />
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:px-5">
        <span>
          Investigated {classified.length} · {scored.length} real ·{' '}
          {ignored.length} ignored · {spam.length} spam
        </span>
        <button
          type="button"
          onClick={reset}
          className="text-muted-foreground hover:text-foreground"
        >
          ← investigate another batch
        </button>
      </div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <aside className="md:col-span-4">
      <div className="border border-border bg-background p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Profile on file
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          {profile.fullName}
        </h2>
        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Program" value={profile.degreeProgram} />
          {profile.university && (
            <Row label="University" value={profile.university} />
          )}
          <Row label="Semester" value={String(profile.semester)} />
          <Row label="CGPA" value={profile.cgpa.toFixed(2)} />
          {profile.locationPreference && (
            <Row label="Location" value={profile.locationPreference} />
          )}
          <Row
            label="Funded only"
            value={profile.financialNeed ? 'yes' : 'no'}
          />
        </dl>
        {profile.skills.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Skills
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.skills.slice(0, 12).map(s => (
                <span
                  key={s}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
