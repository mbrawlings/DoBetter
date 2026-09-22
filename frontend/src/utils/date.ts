const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Parse the month/day out of a "YYYY-MM-DD" (or ISO) calendar string.
export function parseMonthDay(value: string): { month: number; day: number } | null {
  const datePart = value.split('T')[0];
  const [, mm, dd] = datePart.split('-').map(Number);
  if (!mm || !dd || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return { month: mm, day: dd };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

// Years elapsed from a "YYYY-MM-DD" date to `year`. Null when the stored year is
// missing or implausible (contact imports use placeholder years like 1604).
export function yearsSince(value: string | null | undefined, year: number): number | null {
  if (!value) return null;
  const start = Number(value.split('T')[0].split('-')[0]);
  if (!start) return null;
  const n = year - start;
  return n >= 1 && n <= 120 ? n : null;
}

export function birthdayTitle(name: string, value: string | null | undefined, year: number): string {
  const n = yearsSince(value, year);
  return n ? `${name}'s ${ordinal(n)} Birthday` : `${name}'s Birthday`;
}

// Spouse anniversaries are the user's own ("with"); anyone else's are theirs.
export function anniversaryTitle(
  name: string,
  value: string | null | undefined,
  year: number,
  relationship?: string | null,
): string {
  const n = yearsSince(value, year);
  const count = n ? `${ordinal(n)} ` : '';
  return relationship === 'spouse' ? `${count}Anniversary with ${name}` : `${name}'s ${count}Anniversary`;
}

function toYmd(value: string): string {
  return value.split('T')[0];
}

function localDateFromYmd(ymd: string): Date | null {
  const [yyyy, mm, dd] = toYmd(ymd).split('-').map(Number);
  if (!yyyy || !mm || !dd) return null;
  return new Date(yyyy, mm - 1, dd);
}

function formatYmdHuman(ymd: string): string {
  const [yyyy, mm, dd] = toYmd(ymd).split('-').map(Number);
  if (!yyyy || !mm || !dd) return ymd;
  return `${MONTHS[mm - 1]} ${dd}, ${yyyy}`;
}

export function addCalendarDays(ymd: string, days: number): string {
  const date = localDateFromYmd(ymd);
  if (!date) return toYmd(ymd);
  date.setDate(date.getDate() + days);
  return formatDateYmd(date);
}

// Inclusive YYYY-MM-DD walk. Caps at a year so a bad range can't explode the calendar.
export function eachYmdInclusive(start: string, end: string): string[] {
  const from = toYmd(start);
  const to = toYmd(end);
  if (!from) return [];
  if (!to || to <= from) return [from];
  const out: string[] = [];
  let cur = from;
  for (let i = 0; i < 366 && cur <= to; i++) {
    out.push(cur);
    cur = addCalendarDays(cur, 1);
  }
  return out;
}

function daysInclusive(start: string, end: string): number {
  const a = localDateFromYmd(start);
  const b = localDateFromYmd(end);
  if (!a || !b) return 1;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
}

export function formatYmdRange(start: string, end: string): string {
  const from = toYmd(start);
  const to = toYmd(end);
  if (!to || to <= from) return formatYmdHuman(from);
  const [sy, sm, sd] = from.split('-').map(Number);
  const [ey, em, ed] = to.split('-').map(Number);
  if (sy === ey && sm === em) return `${MONTHS[sm - 1]} ${sd}–${ed}, ${sy}`;
  if (sy === ey) return `${MONTHS[sm - 1]} ${sd} – ${MONTHS[em - 1]} ${ed}, ${sy}`;
  return `${MONTHS[sm - 1]} ${sd}, ${sy} – ${MONTHS[em - 1]} ${ed}, ${ey}`;
}

type EventWhen = {
  date?: string;
  endDate?: string;
  startsAt?: string;
};

function eventRangeEndYmd(event: EventWhen): string | undefined {
  const start = event.date ? toYmd(event.date) : undefined;
  const end = event.endDate ? toYmd(event.endDate) : undefined;
  if (start && end && end > start) return end;
  return undefined;
}

// True if the event hasn't ended yet (in progress or still upcoming).
export function isEventUpcomingOrOngoing(event: EventWhen, now: Date = new Date()): boolean {
  if (event.startsAt) {
    const t = new Date(event.startsAt).getTime();
    return !Number.isNaN(t) && t >= now.getTime();
  }
  const start = event.date ? toYmd(event.date) : '';
  if (!start) return false;
  const end = eventRangeEndYmd(event) ?? start;
  return end >= formatDateYmd(now);
}

export function eventStartMs(event: EventWhen): number {
  if (event.startsAt) {
    const t = new Date(event.startsAt).getTime();
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
  }
  const start = event.date ? localDateFromYmd(event.date) : null;
  return start ? start.getTime() : Number.POSITIVE_INFINITY;
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

function countdownFromStart(target: Date): { soon: boolean; label: string } {
  const day = 86_400_000;
  const days = Math.ceil((target.getTime() - Date.now()) / day);
  if (days < 0) return { soon: false, label: '' };
  if (days === 0) return { soon: true, label: 'today' };
  if (days === 1) return { soon: true, label: 'tomorrow' };
  if (days < 30) return { soon: true, label: `in ${days} days` };
  const months = Math.round(days / 30);
  if (months < 12) return { soon: false, label: `in ${months} ${months === 1 ? 'month' : 'months'}` };
  const years = Math.round(days / 365);
  return { soon: false, label: `in ${years} ${years === 1 ? 'year' : 'years'}` };
}

// Relative future label for an upcoming event, e.g. "in 9 days", "in 2 months".
// Multi-day all-day events that have already started show "day 3 of 8".
// Returns { soon, label } where `soon` flags events within ~30 days (for tinting).
export function formatEventCountdown(event: EventWhen): {
  soon: boolean;
  label: string;
} {
  if (!event.startsAt) {
    const startYmd = event.date ? toYmd(event.date) : '';
    const endYmd = eventRangeEndYmd(event);
    if (startYmd && endYmd) {
      const today = formatDateYmd(new Date());
      if (today > endYmd) return { soon: false, label: '' };
      if (today >= startYmd) {
        const total = daysInclusive(startYmd, endYmd);
        const dayNum = daysInclusive(startYmd, today);
        return { soon: true, label: `day ${dayNum} of ${total}` };
      }
    }
    const start = startYmd ? localDateFromYmd(startYmd) : null;
    if (!start) return { soon: false, label: '' };
    return countdownFromStart(start);
  }
  const target = new Date(event.startsAt);
  if (Number.isNaN(target.getTime())) return { soon: false, label: '' };
  return countdownFromStart(target);
}

// Display an event's "when": a precise local date+time for timed events, else a calendar date or range.
export function formatEventWhen(event: EventWhen): string {
  if (event.startsAt) {
    return new Date(event.startsAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (event.date) {
    const end = eventRangeEndYmd(event);
    return end ? formatYmdRange(event.date, end) : formatYmdHuman(event.date);
  }
  return '';
}
