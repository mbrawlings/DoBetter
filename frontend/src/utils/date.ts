const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatYmdHuman(ymd: string): string {
  const [yyyy, mm, dd] = ymd.split('T')[0].split('-').map(Number);
  if (!yyyy || !mm || !dd) return ymd;
  return `${MONTHS[mm - 1]} ${dd}, ${yyyy}`;
}

// Combine a calendar date and a local time-of-day into a UTC instant (ISO string).
// The wall-clock components are interpreted in the device's current timezone.
export function combineDateAndTime(ymd: string, time: string): string {
  const [yyyy, mm, dd] = ymd.split('-').map(Number);
  const [hh, min] = time.split(':').map(Number);
  return new Date(yyyy, mm - 1, dd, hh, min).toISOString();
}

// Split a UTC instant back into device-local calendar date and time-of-day parts.
export function splitIso(iso: string): { ymd: string; time: string } {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { ymd: formatDateYmd(d), time };
}

// Compact relative time from now, e.g. "2d", "1w", "3mo", "2y". Empty for no/invalid date.
export function formatRelativeShort(value?: string | null): string {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const day = 86_400_000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return 'today';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

// Relative future label for an upcoming event, e.g. "in 9 days", "in 2 months".
// Returns { soon, label } where `soon` flags events within ~30 days (for tinting).
export function formatEventCountdown(event: { date?: string; startsAt?: string }): {
  soon: boolean;
  label: string;
} {
  const iso = event.startsAt || event.date;
  if (!iso) return { soon: false, label: '' };
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return { soon: false, label: '' };
  const day = 86_400_000;
  const days = Math.ceil((target - Date.now()) / day);
  if (days < 0) return { soon: false, label: '' };
  if (days === 0) return { soon: true, label: 'today' };
  if (days === 1) return { soon: true, label: 'tomorrow' };
  if (days < 30) return { soon: true, label: `in ${days} days` };
  const months = Math.round(days / 30);
  if (months < 12) return { soon: false, label: `in ${months} ${months === 1 ? 'month' : 'months'}` };
  const years = Math.round(days / 365);
  return { soon: false, label: `in ${years} ${years === 1 ? 'year' : 'years'}` };
}

// Display an event's "when": a precise local date+time for timed events, else a calendar date.
export function formatEventWhen(event: { date?: string; startsAt?: string }): string {
  if (event.startsAt) {
    return new Date(event.startsAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (event.date) return formatYmdHuman(event.date);
  return '';
}
