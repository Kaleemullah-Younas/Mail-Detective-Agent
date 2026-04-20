'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

type Status = 'idle' | 'reading' | 'extracting' | 'done' | 'error';

const ACCEPT = ['application/pdf'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export default function ResumeUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const accept = (f: File) => {
    setError(null);
    if (!ACCEPT.includes(f.type) && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF résumés are accepted for now.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('File is larger than 8 MB. Compress it and try again.');
      return;
    }
    setFile(f);
    setStatus('idle');
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) accept(f);
  }, []);

  const onSubmit = async () => {
    if (!file) return;
    setError(null);
    setStatus('reading');

    const form = new FormData();
    form.append('file', file);

    try {
      setStatus('extracting');
      const res = await fetch('/api/resume/extract', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Extraction failed (${res.status})`);
      }
      const data = await res.json();

      // Stash the extraction in sessionStorage and hand off to the review page.
      sessionStorage.setItem('mj.resume.extraction', JSON.stringify(data));
      sessionStorage.setItem('mj.resume.filename', file.name);
      setStatus('done');
      router.push('/profile/setup/resume/review');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const busy = status === 'reading' || status === 'extracting';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <Link href="/profile/setup" className="hover:text-foreground">
            ← Step 01
          </Link>
          <span>·</span>
          <span>Route A · Résumé intake</span>
        </div>

        <h1 className="mt-6 text-5xl font-semibold leading-[1] text-foreground md:text-6xl">
          Hand over the
          <br />
          <span className="italic text-muted-foreground">evidence.</span>
        </h1>

        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
          Drop a PDF résumé. The detective&apos;s first agent reads the page and
          pulls your program, semester, CGPA, skills, and experience into a
          draft. You review and confirm on the next screen - nothing is saved
          until you say so.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={`mt-12 flex cursor-pointer flex-col items-center justify-center border border-dashed p-10 text-center transition-colors md:p-16 ${
            dragOver
              ? 'border-foreground bg-muted/40'
              : 'border-border hover:bg-muted/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) accept(f);
            }}
          />

          <UploadIcon className="h-10 w-10 text-foreground" />

          <p className="mt-6 text-2xl font-medium text-foreground md:text-3xl">
            {file ? file.name : 'Drop your résumé.'}
          </p>

          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {file
              ? `${(file.size / 1024).toFixed(0)} kb · ready for the detective`
              : 'PDF only · max 8 mb · or click to browse'}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-8">
          <button
            type="button"
            disabled={!file || busy}
            onClick={onSubmit}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:gap-3 disabled:opacity-40"
          >
            {status === 'reading' && 'Reading the page…'}
            {status === 'extracting' && 'Interrogating Gemini…'}
            {status === 'done' && 'Done · redirecting…'}
            {(status === 'idle' || status === 'error') &&
              (file ? 'Extract & review' : 'Pick a file first')}
            <span aria-hidden>→</span>
          </button>

          {file && !busy && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setStatus('idle');
                setError(null);
              }}
              className="inline-flex h-12 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Use a different file
            </button>
          )}

          <Link
            href="/profile/setup/manual"
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Fill manually instead →
          </Link>
        </div>

        {/* Footnote */}
        <div className="mt-16 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>
            Two agents work this step · Gemini reads text · OCR reads your photo
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M16 22V6" />
      <path d="M10 12l6-6 6 6" />
      <path d="M6 22v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}
