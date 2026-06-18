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
