const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type MeterUnit = 'miles' | 'hours';

export type LogMonthGroup<T> = {
  key: string;
  label: string;
  logs: T[];
};

export function groupLogsByMonth<T extends { date?: string | null }>(logs: readonly T[]): LogMonthGroup<T>[] {
  const groups: LogMonthGroup<T>[] = [];
  for (const log of logs) {
    const [yyyy, mm] = (log.date ?? '').split('T')[0].split('-');
    const month = Number(mm);
    const known = Boolean(yyyy) && month >= 1 && month <= 12;
    const key = known ? `${yyyy}-${mm}` : 'undated';
    const label = known ? `${MONTHS[month - 1]} ${yyyy}` : 'Undated';
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.logs.push(log);
    } else {
      groups.push({ key, label, logs: [log] });
    }
  }
  return groups;
}

export function dayOfMonth(date?: string | null): string {
  const day = Number((date ?? '').split('T')[0].split('-')[2]);
  return day ? String(day) : '';
}

export function isMeterUnit(value: string): value is MeterUnit {
  switch (value) {
    case 'miles':
    case 'hours':
      return true;
    default:
      return false;
  }
}

export function formatCost(cost: number | null | undefined): string {
  if (cost == null || !Number.isFinite(cost)) return '';
  const negative = cost < 0;
  const cents = Math.round(Math.abs(cost) * 100);
  const dollars = Math.floor(cents / 100);
  const remainder = cents % 100;
  const grouped = dollars.toLocaleString('en-US');
  const body = remainder === 0 ? grouped : `${grouped}.${String(remainder).padStart(2, '0')}`;
  return negative ? `-$${body}` : `$${body}`;
}

export function formatMeter(meter: { unit: string; value: number } | null | undefined): string {
  if (!meter || !isMeterUnit(meter.unit) || !Number.isFinite(meter.value)) return '';
  const value = Number.isInteger(meter.value)
    ? meter.value.toLocaleString('en-US')
    : meter.value.toLocaleString('en-US', { maximumFractionDigits: 3 });
  switch (meter.unit) {
    case 'miles':
      return `${value} mi`;
    case 'hours':
      return `${value} hr`;
    default: {
      const _exhaustive: never = meter.unit;
      return _exhaustive;
    }
  }
}
