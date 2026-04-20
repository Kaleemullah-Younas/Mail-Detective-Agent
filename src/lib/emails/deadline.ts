/**
 * Compute how many days from `today` until `iso` (a YYYY-MM-DD date string).
 * Returns null if iso is falsy or unparseable.
 */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = new Date(`${iso}T23:59:59Z`);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export type DeadlineUrgency =
  | 'PAST'
  | 'CRITICAL' // ≤ 7 days
  | 'SOON' // ≤ 30 days
  | 'LATER' // ≤ 90 days
  | 'FAR' // > 90
  | 'UNKNOWN';

export function urgencyOf(iso: string | null | undefined): DeadlineUrgency {
  const d = daysUntil(iso);
  if (d === null) return 'UNKNOWN';
  if (d < 0) return 'PAST';
  if (d <= 7) return 'CRITICAL';
  if (d <= 30) return 'SOON';
  if (d <= 90) return 'LATER';
  return 'FAR';
}

export function prettyDeadline(
  deadlineRaw: string | null,
  iso: string | null
): string {
  if (iso) {
    const d = new Date(`${iso}T00:00:00Z`);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return deadlineRaw ?? 'No deadline';
}
