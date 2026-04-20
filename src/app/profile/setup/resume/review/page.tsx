'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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

type Extraction = {
  fullName: string | null;
  degreeProgram: string | null;
  university: string | null;
  semester: number | null;
  cgpa: number | null;
  skills: string[];
  preferredOpportunityTypes: string[];
  financialNeed: boolean | null;
  locationPreference: string | null;
  pastExperience: string | null;
};

type StoredPayload = {
  extraction: Extraction;
  resumeFileName?: string;
};

export default function ResumeReviewPage() {
  const router = useRouter();
  const upsert = trpc.profile.upsert.useMutation();

  const [hydrated, setHydrated] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
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

  // Track which fields Gemini actually filled (so we can highlight the empty ones)
  const [autofilled, setAutofilled] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mj.resume.extraction');
      const fname = sessionStorage.getItem('mj.resume.filename');
      if (!raw) {
        router.replace('/profile/setup/resume');
        return;
      }
      const payload = JSON.parse(raw) as StoredPayload;
      const e = payload.extraction;
      const filled = new Set<string>();

      if (e.fullName) {
        setFullName(e.fullName);
        filled.add('fullName');
      }
      if (e.degreeProgram) {
        setDegreeProgram(e.degreeProgram);
        filled.add('degreeProgram');
      }
      if (e.university) {
        setUniversity(e.university);
        filled.add('university');
      }
      if (typeof e.semester === 'number') {
        setSemester(e.semester);
        filled.add('semester');
      }
      if (typeof e.cgpa === 'number') {
        setCgpa(e.cgpa);
        filled.add('cgpa');
      }
      if (e.skills?.length) {
        setSkillsText(e.skills.join(', '));
        filled.add('skills');
      }
      if (e.preferredOpportunityTypes?.length) {
        setPreferred(e.preferredOpportunityTypes);
        filled.add('preferredOpportunityTypes');
      }
      if (typeof e.financialNeed === 'boolean') {
        setFinancialNeed(e.financialNeed);
        filled.add('financialNeed');
      }
      if (e.locationPreference) {
        setLocationPreference(e.locationPreference);
        filled.add('locationPreference');
      }
      if (e.pastExperience) {
        setPastExperience(e.pastExperience);
        filled.add('pastExperience');
      }
      setAutofilled(filled);
      setResumeFileName(fname || payload.resumeFileName || null);
    } catch {
      router.replace('/profile/setup/resume');
      return;
    } finally {
      setHydrated(true);
    }
  }, [router]);

  const togglePreferred = (t: string) =>
    setPreferred(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t],
    );

  const missingRequired = useMemo(() => {
    const miss: string[] = [];
    if (!fullName.trim()) miss.push('Full name');
    if (!degreeProgram.trim()) miss.push('Degree / Program');
    if (semester === '' || Number(semester) < 1) miss.push('Semester');
    if (cgpa === '' || Number(cgpa) < 0) miss.push('CGPA');
    return miss;
  }, [fullName, degreeProgram, semester, cgpa]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (missingRequired.length > 0) {
      setError(
        `Please fill the required field${missingRequired.length > 1 ? 's' : ''}: ${missingRequired.join(', ')}`,
      );
      return;
    }
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
        source: 'RESUME',
        resumeFileName: resumeFileName || null,
      });
      sessionStorage.removeItem('mj.resume.extraction');
      sessionStorage.removeItem('mj.resume.filename');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        Loading draft…
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <Link href="/profile/setup/resume" className="hover:text-foreground">
            ← Step 01
          </Link>
          <span>·</span>
          <span>Route A · Confirm the draft</span>
        </div>

        <h1 className="mt-6 text-5xl font-semibold leading-[1] text-foreground md:text-6xl">
          The detective read it.
          <br />
          <span className="italic text-muted-foreground">
            Confirm what&apos;s true.
          </span>
        </h1>

        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
          Fields Gemini was confident about are filled in. Empty fields are the
          ones it couldn&apos;t read - fill the required ones below and
          we&apos;re done.
          {resumeFileName && (
            <span className="block mt-2 font-mono text-[10px] uppercase tracking-[0.25em]">
              Source · {resumeFileName}
            </span>
          )}
        </p>

        <form onSubmit={onSubmit} className="mt-14 space-y-12">
          <Section label="01" title="Who you are">
            <Field
              label="Full name"
              required
              autofilled={autofilled.has('fullName')}
              empty={!fullName.trim()}
            >
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className={inputCls}
                placeholder="Ayesha Khan"
              />
            </Field>
          </Section>

          <Section label="02" title="Where you study">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label="Degree / Program"
                required
                autofilled={autofilled.has('degreeProgram')}
                empty={!degreeProgram.trim()}
              >
                <input
                  value={degreeProgram}
                  onChange={e => setDegreeProgram(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="BS Computer Science"
                />
              </Field>
              <Field
                label="University"
                autofilled={autofilled.has('university')}
                empty={!university.trim()}
              >
                <input
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  className={inputCls}
                  placeholder="FAST NUCES, Lahore"
                />
              </Field>
              <Field
                label="Semester"
                required
                hint="1 – 16"
                autofilled={autofilled.has('semester')}
                empty={semester === ''}
              >
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
              <Field
                label="CGPA"
                required
                hint="0.00 – 4.00"
                autofilled={autofilled.has('cgpa')}
                empty={cgpa === ''}
              >
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

          <Section label="03" title="Signal for the detective">
            <Field
              label="Skills"
              hint="Comma-separated"
              autofilled={autofilled.has('skills')}
              empty={!skillsText.trim()}
            >
              <input
                value={skillsText}
                onChange={e => setSkillsText(e.target.value)}
                className={inputCls}
                placeholder="React, Python, Data Analysis"
              />
            </Field>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Hunting for · select all that apply
                </p>
                {autofilled.has('preferredOpportunityTypes') && (
                  <AutofillStamp />
                )}
              </div>
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
                autofilled={autofilled.has('locationPreference')}
                empty={!locationPreference.trim()}
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
                hint="One paragraph"
                autofilled={autofilled.has('pastExperience')}
                empty={!pastExperience.trim()}
              >
                <textarea
                  value={pastExperience}
                  onChange={e => setPastExperience(e.target.value)}
                  rows={4}
                  className={`${inputCls} resize-y py-3`}
                  placeholder="Built a Next.js side project, freelanced for two clients…"
                />
              </Field>
            </div>
          </Section>

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
              {upsert.isPending
                ? 'Filing the case…'
                : 'Confirm & open dashboard'}
              <span aria-hidden>→</span>
            </button>
            <Link
              href="/profile/setup/resume"
              className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:bg-muted"
            >
              Upload a different résumé
            </Link>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {autofilled.size}/10 fields auto-filled
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'h-12 w-full rounded-md border border-border bg-background px-3 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground';

function AutofillStamp() {
  return (
    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/70">
      · auto-filled
    </span>
  );
}

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
        <h2 className="font-serif text-2xl text-foreground">{title}</h2>
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
  autofilled,
  empty,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  autofilled?: boolean;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-muted-foreground">*</span>}
        </span>
        <span className="flex items-baseline gap-2">
          {hint && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {hint}
            </span>
          )}
          {autofilled && !empty && <AutofillStamp />}
          {required && empty && (
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-red-500">
              · needs you
            </span>
          )}
        </span>
      </div>
      {children}
    </label>
  );
}
