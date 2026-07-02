import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { NotificationPrefs } from './notificationPrefs';

// Only schedule reminders that fire within this many days from now. Keeps the
// pending queue small (iOS caps at 64) and lets recurring dates re-arm on the
// next app open.
const WINDOW_DAYS = 60;
// Hard ceiling on scheduled notifications regardless of window contents.
const MAX_SCHEDULED = 60;
const DAY_MS = 86_400_000;

const ANDROID_CHANNEL_ID = 'reminders';

export type ReminderKind = 'birthday' | 'anniversary' | 'event';

export type NotifiablePerson = {
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

export type PlannedReminder = {
  triggerAt: Date;
  title: string;
  body: string;
  data: { personId: string; kind: ReminderKind };
};

function fullName(p: NotifiablePerson): string {
  return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
}

// Parse the month/day out of a "YYYY-MM-DD" (or ISO) calendar string.
function parseMonthDay(value: string): { month: number; day: number } | null {
  const datePart = value.split('T')[0];
  const [, mm, dd] = datePart.split('-').map(Number);
  if (!mm || !dd || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return { month: mm, day: dd };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function atTime(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function minusDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_MS);
}

// "today" | "tomorrow" | "in N days" for copy at fire time.
function leadLabel(leadDays: number): string {
  if (leadDays <= 0) return 'today';
  if (leadDays === 1) return 'tomorrow';
  return `in ${leadDays} days`;
}

// For a recurring month/day, find the earliest trigger (occurrence minus lead,
// at the preferred time) that is still in the future and inside the window.
function nextRecurringTrigger(
  month: number,
  day: number,
  prefs: NotificationPrefs,
  now: Date,
  windowEnd: Date,
): Date | null {
  const startYear = now.getFullYear();
  for (const year of [startYear, startYear + 1]) {
    const safeDay = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
    const occurrence = atTime(new Date(year, month - 1, safeDay), prefs.hour, prefs.minute);
    const trigger = minusDays(occurrence, prefs.leadDays);
    if (trigger >= now && trigger <= windowEnd) return trigger;
  }
  return null;
}

export function computeReminders(
  persons: NotifiablePerson[],
  prefs: NotificationPrefs,
  now: Date = new Date(),
): PlannedReminder[] {
  const windowEnd = new Date(now.getTime() + WINDOW_DAYS * DAY_MS);
  const label = leadLabel(prefs.leadDays);
  const reminders: PlannedReminder[] = [];

  for (const person of persons) {
    if (!person?.id) continue;
    const name = fullName(person) || 'Someone';

    if (person.birthDate) {
      const md = parseMonthDay(person.birthDate);
      if (md) {
        const trigger = nextRecurringTrigger(md.month, md.day, prefs, now, windowEnd);
        if (trigger) {
          reminders.push({
            triggerAt: trigger,
            title: `${name}'s birthday`,
            body: `Their birthday is ${label}.`,
            data: { personId: person.id, kind: 'birthday' },
          });
        }
      }
    }

    if (person.anniversaryDate) {
      const md = parseMonthDay(person.anniversaryDate);
      if (md) {
        const trigger = nextRecurringTrigger(md.month, md.day, prefs, now, windowEnd);
        if (trigger) {
          reminders.push({
            triggerAt: trigger,
            title: `${name}'s anniversary`,
            body: `Their anniversary is ${label}.`,
            data: { personId: person.id, kind: 'anniversary' },
          });
        }
      }
    }

    for (const event of person.upcomingEvents ?? []) {
      if (!event?.title) continue;
      let base: Date | null = null;
      if (event.startsAt) {
        const d = new Date(event.startsAt);
        if (!Number.isNaN(d.getTime())) base = d;
      } else if (event.date) {
        const md = parseMonthDay(event.date);
        const datePart = event.date.split('T')[0];
        const [yyyy] = datePart.split('-').map(Number);
        if (md && yyyy) base = atTime(new Date(yyyy, md.month - 1, md.day), prefs.hour, prefs.minute);
      }
      if (!base) continue;
      const trigger = minusDays(base, prefs.leadDays);
      if (trigger >= now && trigger <= windowEnd) {
        reminders.push({
          triggerAt: trigger,
          title: event.title,
          body: `${name} · ${label}`,
          data: { personId: person.id, kind: 'event' },
        });
      }
    }
  }

  reminders.sort((a, b) => a.triggerAt.getTime() - b.triggerAt.getTime());
  return reminders.slice(0, MAX_SCHEDULED);
}

// Request permission if it hasn't been decided yet. Returns whether we can post
// notifications. Safe to call from UI.
export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Re-derive the full pending set from scratch: cancel everything, then schedule
// the current window. Idempotent, so it's safe to call on every trigger.
export async function syncNotifications(
  persons: NotifiablePerson[],
  prefs: NotificationPrefs,
): Promise<void> {
  if (Platform.OS === 'web') return;

  if (!prefs.enabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  const granted = (await Notifications.getPermissionsAsync()).granted;
  if (!granted) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminders = computeReminders(persons, prefs);
  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: reminder.data,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.triggerAt,
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
    });
  }
}
