const LEAD_DAYS = new Set([0, 1, 3, 7]);
const DAY_MS = 86_400_000;

function pad(n) {
  return String(n).padStart(2, '0');
}

function ymd(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function asDateString(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    const yyyy = value.getUTCFullYear();
    const mm = pad(value.getUTCMonth() + 1);
    const dd = pad(value.getUTCDate());
    return `${yyyy}-${mm}-${dd}`;
  }
  return String(value);
}

function parseMonthDay(value) {
  const datePart = asDateString(value);
  if (!datePart) return null;
  const [, mm, dd] = datePart.split('T')[0].split('-').map(Number);
  if (!mm || !dd || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return { month: mm, day: dd };
}

function fullName(person) {
  return `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
}

function leadLabel(leadDays) {
  if (leadDays <= 0) return 'today';
  if (leadDays === 1) return 'tomorrow';
  return `in ${leadDays} days`;
}

function ordinal(n) {
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

function yearsSince(value, year) {
  const raw = asDateString(value);
  if (!raw) return null;
  const start = Number(raw.split('T')[0].split('-')[0]);
  if (!start) return null;
  const n = year - start;
  return n >= 1 && n <= 120 ? n : null;
}

function birthdayTitle(name, value, year) {
  const n = yearsSince(value, year);
  return n ? `${name}'s ${ordinal(n)} Birthday` : `${name}'s Birthday`;
}

function anniversaryTitle(name, value, year, relationship) {
  const n = yearsSince(value, year);
  const count = n ? `${ordinal(n)} ` : '';
  return relationship === 'spouse'
    ? `${count}Anniversary with ${name}`
    : `${name}'s ${count}Anniversary`;
}

function addCalendarDays(year, month, day, delta) {
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + delta);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

function zonedParts(date, timeZone) {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const parts = Object.fromEntries(formatted.map((part) => [part.type, part.value]));
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

export function localYmd(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return ymd(parts.year, parts.month, parts.day);
}

function timeZoneOffsetMs(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - date.getTime();
}

// Wall-clock time in `timeZone` as a UTC instant. A second pass covers DST transitions.
export function zonedWallTimeToUtc(year, month, day, hour, minute, timeZone) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = timeZoneOffsetMs(utcGuess, timeZone);
  let utc = new Date(utcGuess.getTime() - offset);
  const corrected = timeZoneOffsetMs(utc, timeZone);
  if (corrected !== offset) {
    utc = new Date(utcGuess.getTime() - corrected);
  }
  return utc;
}

export function webPushPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== 'string' || !timeZone.trim() || timeZone.length > 100) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function normalizeNotificationSettings(input) {
  const leadDays = Number(input?.leadDays);
  const hour = Number(input?.hour);
  const minute = Number(input?.minute);
  const timeZone = typeof input?.timeZone === 'string' ? input.timeZone.trim() : '';
  if (!LEAD_DAYS.has(leadDays)) throw new Error('Invalid lead time');
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('Invalid hour');
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new Error('Invalid minute');
  if (!isValidTimeZone(timeZone)) throw new Error('Invalid time zone');
  return {
    enabled: Boolean(input.enabled),
    leadDays,
    hour,
    minute,
    timeZone,
  };
}

export function normalizePushSubscription(input) {
  const endpoint = typeof input?.endpoint === 'string' ? input.endpoint.trim() : '';
  const p256dh = typeof input?.p256dh === 'string' ? input.p256dh.trim() : '';
  const auth = typeof input?.auth === 'string' ? input.auth.trim() : '';
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error('Invalid push subscription');
  }
  if (url.protocol !== 'https:') throw new Error('Invalid push subscription');
  if (!p256dh || !auth || p256dh.length > 200 || auth.length > 200) {
    throw new Error('Invalid push subscription');
  }
  return { endpoint, p256dh, auth };
}

const APPLE_PUSH_HOST = 'web.push.apple.com';

export function isApplePushEndpoint(endpoint) {
  try {
    return new URL(endpoint).hostname === APPLE_PUSH_HOST;
  } catch {
    return false;
  }
}

function plainSubscription(sub) {
  return {
    endpoint: sub.endpoint,
    p256dh: sub.p256dh,
    auth: sub.auth,
  };
}

// Apple is one slot per account. Any other host stays matched by exact endpoint.
export function applyPushSubscription(existing, next) {
  const subs = Array.isArray(existing) ? existing : [];
  if (isApplePushEndpoint(next.endpoint)) {
    return [
      ...subs.filter((sub) => !isApplePushEndpoint(sub.endpoint)).map(plainSubscription),
      plainSubscription(next),
    ];
  }
  const index = subs.findIndex((sub) => sub.endpoint === next.endpoint);
  if (index >= 0) {
    return subs.map((sub, i) => (i === index ? plainSubscription(next) : plainSubscription(sub)));
  }
  return [...subs.map(plainSubscription), plainSubscription(next)];
}

// Send to every non-Apple subscription and only the last Apple entry (newest append).
export function pushTargets(subscriptions) {
  const subs = Array.isArray(subscriptions) ? subscriptions : [];
  let lastApple = -1;
  for (let i = 0; i < subs.length; i += 1) {
    if (isApplePushEndpoint(subs[i]?.endpoint)) lastApple = i;
  }
  const deliver = [];
  const extraAppleEndpoints = [];
  subs.forEach((sub, i) => {
    if (!sub?.endpoint) return;
    if (!isApplePushEndpoint(sub.endpoint)) {
      deliver.push(sub);
      return;
    }
    if (i === lastApple) deliver.push(sub);
    else extraAppleEndpoints.push(sub.endpoint);
  });
  return { deliver, extraAppleEndpoints };
}

function occurrenceForYear(month, day, year) {
  const safeDay = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
  return { year, month, day: safeDay };
}

function triggerOnDay(year, month, day, leadDays, hour, minute, timeZone) {
  const triggerDay = addCalendarDays(year, month, day, -leadDays);
  return zonedWallTimeToUtc(triggerDay.year, triggerDay.month, triggerDay.day, hour, minute, timeZone);
}

function isDueToday(triggerAt, now, timeZone) {
  return triggerAt.getTime() <= now.getTime() && localYmd(triggerAt, timeZone) === localYmd(now, timeZone);
}

// Reminders whose send time has arrived and is still that trigger's local calendar day.
export function dueReminders(persons, prefs, now = new Date()) {
  const timeZone = prefs.timeZone;
  if (!isValidTimeZone(timeZone)) return [];
  const today = localYmd(now, timeZone);
  const year = Number(today.slice(0, 4));
  const label = leadLabel(prefs.leadDays);
  const reminders = [];

  for (const person of persons) {
    const personId = person?.id ?? person?._id?.toString();
    if (!personId) continue;
    const name = fullName(person) || 'Someone';

    const pushRecurring = (month, day, kind, titleForYear) => {
      for (const occurrenceYear of [year, year + 1]) {
        const occurrence = occurrenceForYear(month, day, occurrenceYear);
        const triggerAt = triggerOnDay(
          occurrence.year,
          occurrence.month,
          occurrence.day,
          prefs.leadDays,
          prefs.hour,
          prefs.minute,
          timeZone,
        );
        if (!isDueToday(triggerAt, now, timeZone)) continue;
        const occurrenceYmd = ymd(occurrence.year, occurrence.month, occurrence.day);
        reminders.push({
          triggerAt,
          title: titleForYear(occurrence.year),
          body: kind === 'birthday'
            ? `Their birthday is ${label}.`
            : `${person.relationship === 'spouse' ? 'Your' : 'Their'} anniversary is ${label}.`,
          personId,
          kind,
          dedupeKey: `${personId}:${kind}:${occurrenceYmd}`,
        });
      }
    };

    const birth = parseMonthDay(person.birthDate);
    if (birth) {
      pushRecurring(birth.month, birth.day, 'birthday', (occurrenceYear) =>
        birthdayTitle(name, person.birthDate, occurrenceYear),
      );
    }

    const anniversary = parseMonthDay(person.anniversaryDate);
    if (anniversary) {
      pushRecurring(anniversary.month, anniversary.day, 'anniversary', (occurrenceYear) =>
        anniversaryTitle(name, person.anniversaryDate, occurrenceYear, person.relationship),
      );
    }

    for (const event of person.upcomingEvents ?? []) {
      if (!event?.title) continue;
      let triggerAt = null;
      let occurrenceYmd = null;
      if (event.startsAt) {
        const start = new Date(event.startsAt);
        if (!Number.isNaN(start.getTime())) {
          const parts = zonedParts(start, timeZone);
          triggerAt = new Date(start.getTime() - prefs.leadDays * DAY_MS);
          occurrenceYmd = ymd(parts.year, parts.month, parts.day);
        }
      } else if (event.date) {
        const md = parseMonthDay(event.date);
        const yyyy = Number(asDateString(event.date).split('T')[0].split('-')[0]);
        if (md && yyyy) {
          triggerAt = triggerOnDay(yyyy, md.month, md.day, prefs.leadDays, prefs.hour, prefs.minute, timeZone);
          occurrenceYmd = ymd(yyyy, md.month, md.day);
        }
      }
      if (!triggerAt || !occurrenceYmd || !isDueToday(triggerAt, now, timeZone)) continue;
      reminders.push({
        triggerAt,
        title: event.title,
        body: `${name} · ${label}`,
        personId,
        kind: 'event',
        dedupeKey: `${personId}:event:${occurrenceYmd}:${event.title}`,
      });
    }
  }

  reminders.sort((a, b) => a.triggerAt.getTime() - b.triggerAt.getTime());
  return reminders;
}
