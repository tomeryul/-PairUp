/** Israeli date formatting helpers. */

const heDate = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const heDateShort = new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const heTime = new Intl.DateTimeFormat('he-IL', {
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (ts: number | string | Date): string =>
  heDate.format(new Date(ts));

export const formatDateShort = (ts: number | string | Date): string =>
  heDateShort.format(new Date(ts));

export const formatDateTime = (ts: number | string | Date): string =>
  `${heDateShort.format(new Date(ts))} · ${heTime.format(new Date(ts))}`;

/** Returns yyyy-mm-dd for the local day. */
export const dayKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Whole days between two day-keys (a - b). */
export const daysBetween = (a: string, b: string): number => {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((da.getTime() - db.getTime()) / 86_400_000);
};

/** Human friendly remaining time until an ISO day. */
export const timeUntil = (isoDay: string): string => {
  const diff = daysBetween(isoDay, dayKey());
  if (diff <= 0) return 'מוכנה להיפתח';
  if (diff === 1) return 'נפתחת מחר';
  if (diff < 30) return `עוד ${diff} ימים`;
  const months = Math.round(diff / 30);
  if (months < 12) return `עוד כ-${months} חודשים`;
  const years = Math.floor(diff / 365);
  return years === 1 ? 'עוד כשנה' : `עוד כ-${years} שנים`;
};
