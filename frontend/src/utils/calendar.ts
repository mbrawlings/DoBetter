import { formatDateYmd, isLeapYear, parseMonthDay, splitIso } from './date';

export type CalendarKind = 'birthday' | 'anniversary' | 'event';

export type CalendarItem = {
  id: string;
  personId: string;
  personName: string;
  kind: CalendarKind;
  title: string;
  ymd: string;
  startsAt?: string;
  notes?: string;
};

export type CalendarPerson = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
  anniversaryDate?: string | null;
  upcomingEvents?: Array<{
    title?: string | null;
    date?: string | null;
    startsAt?: string | null;
    notes?: string | null;
  } | null> | null;
};

// react-native-calendars multi-dot marking shape.
export type MarkedDates = Record<
  string,
  {
    dots: Array<{ key: string; color: string }>;
    selected?: boolean;
    selectedColor?: string;
  }
>;

export const KIND_COLORS: Record<CalendarKind, string> = {
  birthday: '#B85C3E',
  anniversary: '#8E5C9C',
  event: '#3F7B8E',
};

export const KIND_ICONS: Record<CalendarKind, string> = {
  birthday: 'cake-variant-outline',
  anniversary: 'heart-outline',
  event: 'calendar',
};

function fullName(p: CalendarPerson): string {
  return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Someone';
}

// Turn a recurring month/day into a concrete YYYY-MM-DD in the given year,
// folding Feb 29 to Feb 28 on non-leap years (mirrors the notification scheduler).
function recurringYmd(month: number, day: number, year: number): string {
  const safeDay = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
  return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

// Aggregate all dated items across people into flat CalendarItems.
// Recurring birthdays/anniversaries are projected onto `year` and `year + 1`
// so that views spanning a year boundary (e.g. late December) still show them.
export function buildCalendarItems(persons: CalendarPerson[], year: number): CalendarItem[] {
  const items: CalendarItem[] = [];
  const years = [year, year + 1];

  for (const person of persons) {
    if (!person?.id) continue;
    const name = fullName(person);

    if (person.birthDate) {
      const md = parseMonthDay(person.birthDate);
      if (md) {
        for (const y of years) {
          const ymd = recurringYmd(md.month, md.day, y);
          items.push({
            id: `${person.id}:birthday:${ymd}`,
            personId: person.id,
            personName: name,
            kind: 'birthday',
            title: `${name}'s birthday`,
            ymd,
          });
        }
      }
    }

    if (person.anniversaryDate) {
      const md = parseMonthDay(person.anniversaryDate);
      if (md) {
        for (const y of years) {
          const ymd = recurringYmd(md.month, md.day, y);
          items.push({
            id: `${person.id}:anniversary:${ymd}`,
            personId: person.id,
            personName: name,
            kind: 'anniversary',
            title: `${name}'s anniversary`,
            ymd,
          });
        }
      }
    }

    const events = person.upcomingEvents ?? [];
    events.forEach((event, idx) => {
      if (!event?.title) return;
      let ymd: string | null = null;
      if (event.startsAt) {
        ymd = splitIso(event.startsAt).ymd;
      } else if (event.date) {
        ymd = event.date.split('T')[0];
      }
      if (!ymd) return;
      items.push({
        id: `${person.id}:event:${ymd}:${idx}`,
        personId: person.id,
        personName: name,
        kind: 'event',
        title: event.title,
        ymd,
        startsAt: event.startsAt ?? undefined,
        notes: event.notes ?? undefined,
      });
    });
  }

  return items;
}

// Sort key within a day: timed events by their instant, all-day/recurring first.
function itemSortValue(item: CalendarItem): number {
  if (item.startsAt) {
    const t = new Date(item.startsAt).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

export function groupByDay(items: CalendarItem[]): Record<string, CalendarItem[]> {
  const grouped: Record<string, CalendarItem[]> = {};
  for (const item of items) {
    (grouped[item.ymd] ??= []).push(item);
  }
  for (const ymd of Object.keys(grouped)) {
    grouped[ymd].sort((a, b) => itemSortValue(a) - itemSortValue(b));
  }
  return grouped;
}

// Build the markedDates map for the month grid. Dedupes dots by kind so a day
// with three birthdays shows a single birthday-colored dot, not three.
export function buildMarkedDates(items: CalendarItem[], selectedYmd?: string): MarkedDates {
  const marked: MarkedDates = {};
  for (const item of items) {
    const entry = (marked[item.ymd] ??= { dots: [] });
    if (!entry.dots.some((d) => d.key === item.kind)) {
      entry.dots.push({ key: item.kind, color: KIND_COLORS[item.kind] });
    }
  }
  if (selectedYmd) {
    const entry = (marked[selectedYmd] ??= { dots: [] });
    entry.selected = true;
    entry.selectedColor = '#B85C3E';
  }
  return marked;
}

// Chronological agenda groups (day + its items) from `from` for `days` days.
export function buildAgenda(
  items: CalendarItem[],
  from: Date,
  days: number,
): Array<{ ymd: string; items: CalendarItem[] }> {
  const startYmd = formatDateYmd(from);
  const end = new Date(from.getTime() + days * 86_400_000);
  const endYmd = formatDateYmd(end);
  const grouped = groupByDay(items.filter((i) => i.ymd >= startYmd && i.ymd <= endYmd));
  return Object.keys(grouped)
    .sort()
    .map((ymd) => ({ ymd, items: grouped[ymd] }));
}
