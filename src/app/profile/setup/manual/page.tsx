'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

const OPPORTUNITY_TYPES = [
  'Scholarship',
  'Internship',
  'Fellowship',
  'Competition',
  'Conference',
  'Research',
  'Job',
  'Exchange Program',
];

export default function ManualProfilePage() {
  const router = useRouter();
  const { data: existing, isLoading } = trpc.profile.me.useQuery();
  const upsert = trpc.profile.upsert.useMutation();

  const [fullName, setFullName] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [university, setUniversity] = useState('');
  const [semester, setSemester] = useState<number | ''>('');
  const [cgpa, setCgpa] = useState<number | ''>('');
  const [skillsText, setSkillsText] = useState('');
  const [preferred, setPreferred] = useState<string[]>([]);
  const [financialNeed, setFinancialNeed] = useState(false);
  const [locationPreference, setLocationPreference] = useState('');
  const [pastExperience, setPastExperience] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Hydrate form if profile already exists.
  // Intentional setState-in-effect: we're syncing async server state (tRPC
  // query) into local form state exactly once when it arrives.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!existing) return;
    setFullName(existing.fullName);
    setDegreeProgram(existing.degreeProgram);
    setUniversity(existing.university ?? '');
    setSemester(existing.semester);
    setCgpa(existing.cgpa);
    setSkillsText(existing.skills.join(', '));
    setPreferred(existing.preferredOpportunityTypes);
    setFinancialNeed(existing.financialNeed);
    setLocationPreference(existing.locationPreference ?? '');
    setPastExperience(existing.pastExperience ?? '');
  }, [existing]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const togglePreferred = (t: string) =>
    setPreferred(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t],
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await upsert.mutateAsync({
        fullName,
        degreeProgram,
        university: university || null,
        semester: Number(semester),
        cgpa: Number(cgpa),
        skills: skillsText
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        preferredOpportunityTypes: preferred,
        financialNeed,
        locationPreference: locationPreference || null,
        pastExperience: pastExperience || null,
        source: 'MANUAL',
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        {/* Heading */}
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <Link href="/profile/setup" className="hover:text-foreground">
            ← Step 01
          </Link>
          <span>·</span>
          <span>Route B · Manual entry</span>
        </div>
        <h1 className="mt-6 text-5xl font-semibold leading-[1] text-foreground md:text-6xl">
          Six fields, then we&apos;re
          <br />
          <span className="italic text-muted-foreground">on the case.</span>
        </h1>

        <form onSubmit={onSubmit} className="mt-14 space-y-12">
          {/* Identity */}
          <Section label="01" title="Who you are">
            <Field label="Full name" required>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className={inputCls}
                placeholder="Ayesha Khan"
              />
            </Field>
          </Section>

          {/* Academic */}
          <Section label="02" title="Where you study">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Degree / Program" required>
                <input
                  value={degreeProgram}
                  onChange={e => setDegreeProgram(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="BS Computer Science"
                />
              </Field>
              <Field label="University">
                <input
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  className={inputCls}
                  placeholder="FAST NUCES, Lahore"
                />
              </Field>
              <Field label="Semester" required hint="1 – 16">
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={semester}
                  onChange={e =>
                    setSemester(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  required
                  className={inputCls}
                  placeholder="5"
                />
              </Field>
              <Field label="CGPA" required hint="0.00 – 4.00">
                <input
                  type="number"
                  step={0.01}
                  min={0}
                  max={4}
                  value={cgpa}
                  onChange={e =>
                    setCgpa(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  required
                  className={inputCls}
                  placeholder="3.42"
                />
              </Field>
            </div>
          </Section>

          {/* Signal */}
          <Section label="03" title="Signal for the detective">
            <Field
              label="Skills"
              hint="Comma-separated · e.g. Python, ML, Public Speaking"
            >
              <input
                value={skillsText}
                onChange={e => setSkillsText(e.target.value)}
                className={inputCls}
                placeholder="React, Python, Pitching, Data Analysis"
              />
            </Field>

            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Hunting for · select all that apply
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPPORTUNITY_TYPES.map(t => {
                  const on = preferred.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => togglePreferred(t)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        on
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label="Location preference"
                hint="City, country, or remote"
              >
                <input
                  value={locationPreference}
                  onChange={e => setLocationPreference(e.target.value)}
                  className={inputCls}
                  placeholder="Lahore · Remote"
                />
              </Field>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={financialNeed}
                    onChange={e => setFinancialNeed(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-foreground"
                  />
                  <span>Financial need · prioritise funded opportunities</span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <Field
                label="Past experience"
                hint="One paragraph · projects, jobs, things you've shipped"
              >
                <textarea
                  value={pastExperience}
                  onChange={e => setPastExperience(e.target.value)}
                  rows={4}
                  className={`${inputCls} resize-y py-3`}
                  placeholder="Built a Next.js side project, freelanced for two clients, runner-up at IBA datathon…"
                />
              </Field>
            </div>
          </Section>

          {/* Submit */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-8">
            <button
              type="submit"
              disabled={upsert.isPending}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:gap-3 disabled:opacity-50"
            >
              {upsert.isPending ? 'Filing the case…' : 'Save & open dashboard'}
              <span aria-hidden>→</span>
            </button>
            <Link
              href="/profile/setup"
              className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:bg-muted"
            >
              Back
            </Link>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              You can edit this later
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

/* - primitives - */

const inputCls =
  'h-12 w-full rounded-md border border-border bg-background px-3 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground';

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </span>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-muted-foreground">*</span>}
        </span>
        {hint && (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
