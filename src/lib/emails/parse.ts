import type { RawEmail } from './types';

/**
 * Parse a block of pasted text into separate RawEmail entries.
 *
 * The user is instructed to delimit emails with a line of three (or more)
 * dashes:
 *
 *     From: prof@uni.edu
 *     Subject: Scholarship
 *     Date: 2026-03-20
 *
 *     body text…
 *
 *     ---
 *
 *     From: ...
 *
 * For each chunk we pull `From:`, `Subject:`, `Date:` headers (case-insensitive)
 * off the top; everything after the first blank line is the body. If headers
 * are missing we degrade gracefully - the first non-blank line becomes the
 * subject, and the whole block becomes the body.
 */
export function parsePastedEmails(input: string): RawEmail[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Split on a line that is only dashes (3 or more)
  const chunks = trimmed
    .split(/(?:^|\n)\s*-{3,}\s*(?:\n|$)/g)
    .map(c => c.trim())
    .filter(Boolean);

  return chunks.map((chunk, idx) => parseOneEmail(chunk, `paste-${idx + 1}`));
}

export function parseOneEmail(chunk: string, id: string): RawEmail {
  const lines = chunk.split(/\r?\n/);
  let from = '';
  let subject = '';
  let date: string | undefined;

  let headerEnd = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      headerEnd = i + 1;
      break;
    }
    const m = line.match(/^\s*(from|subject|date)\s*:\s*(.*)$/i);
    if (!m) {
      headerEnd = i;
      break;
    }
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'from') from = value;
    else if (key === 'subject') subject = value;
    else if (key === 'date') date = value;
  }

  const body = lines.slice(headerEnd).join('\n').trim();

  if (!subject) {
    // Fall back: first non-blank line of the whole chunk becomes the subject
    const firstLine = lines.find(l => l.trim() !== '') ?? '(no subject)';
    subject = firstLine.slice(0, 120);
  }

  return {
    id,
    from: from || '(unknown sender)',
    subject,
    date,
    body: body || chunk,
  };
}

/** Build a RawEmail from an uploaded .txt file's contents. */
export function parseUploadedFile(
  fileName: string,
  contents: string,
  idx: number,
): RawEmail {
  const email = parseOneEmail(contents, `file-${idx + 1}`);
  // If no explicit subject header, use the filename (sans extension) as a hint.
  if (email.subject === '(no subject)' || !email.subject) {
    email.subject = fileName.replace(/\.[^.]+$/, '');
  }
  return email;
}
