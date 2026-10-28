import webpush from 'web-push';
import User from '../db/models/User.js';
import Person from '../db/models/person.js';
import NotificationDelivery from '../db/models/notificationDelivery.js';
import { dueReminders, isApplePushEndpoint, pushTargets } from './reminders.js';

const DISPATCH_INTERVAL_MS = 5 * 60 * 1000;
const PUSH_TTL_SECONDS = 12 * 60 * 60;

let running = false;
let warnedUnconfigured = false;
let timer = null;

function pushClient() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    if (!warnedUnconfigured) {
      console.warn('Web Push is disabled: set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT');
      warnedUnconfigured = true;
    }
    return null;
  }
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch (err) {
    if (!warnedUnconfigured) {
      console.warn('Web Push is disabled:', err?.message || err);
      warnedUnconfigured = true;
    }
    return null;
  }
  return webpush;
}

async function sendReminder(client, user, reminder) {
  let claimed;
  try {
    claimed = await NotificationDelivery.create({
      userId: user._id,
      dedupeKey: reminder.dedupeKey,
    });
  } catch (err) {
    if (err?.code === 11000) return false;
    throw err;
  }

  const payload = JSON.stringify({
    title: reminder.title,
    body: reminder.body,
    personId: reminder.personId,
    tag: reminder.dedupeKey,
  });

  const { deliver, extraAppleEndpoints } = pushTargets(user.pushSubscriptions);
  let delivered = false;
  let appleDelivered = false;
  const stale = [];
  for (const sub of deliver) {
    try {
      await client.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
        { TTL: PUSH_TTL_SECONDS },
      );
      delivered = true;
      if (isApplePushEndpoint(sub.endpoint)) appleDelivered = true;
    } catch (err) {
      const status = err?.statusCode;
      if (status === 404 || status === 410) {
        stale.push(sub.endpoint);
      } else {
        console.error('web push failed', status || '', err?.message || err);
      }
    }
  }

  const drop = appleDelivered ? [...stale, ...extraAppleEndpoints] : stale;
  if (drop.length) {
    await User.updateOne(
      { _id: user._id },
      { $pull: { pushSubscriptions: { endpoint: { $in: drop } } } },
    );
  }

  if (!delivered) {
    await NotificationDelivery.deleteOne({ _id: claimed._id });
    return false;
  }
  return true;
}

export async function dispatchReminders() {
  if (running) return { skipped: true, sent: 0 };
  const client = pushClient();
  if (!client) return { skipped: true, sent: 0 };

  running = true;
  try {
    const users = await User.find({
      'notificationPrefs.enabled': true,
      'pushSubscriptions.0': { $exists: true },
    }).select('notificationPrefs pushSubscriptions');

    let sent = 0;
    for (const user of users) {
      const prefs = user.notificationPrefs;
      if (!prefs?.timeZone) continue;
      try {
        const persons = await Person.find({
          orgId: user._id,
          'meta.isDeleted': { $ne: true },
        })
          .select('firstName lastName relationship birthDate anniversaryDate upcomingEvents')
          .lean();
        const reminders = dueReminders(persons, prefs);
        for (const reminder of reminders) {
          const didSend = await sendReminder(client, user, reminder);
          if (didSend) sent += 1;
        }
      } catch (err) {
        console.error('reminder dispatch failed for user', user._id?.toString(), err);
      }
    }
    return { skipped: false, sent };
  } finally {
    running = false;
  }
}

export function startReminderDispatcher() {
  if (timer) return;
  const tick = () => {
    void dispatchReminders().catch((err) => {
      console.error('reminder dispatch failed', err);
    });
  };
  timer = setInterval(tick, DISPATCH_INTERVAL_MS);
  if (typeof timer.unref === 'function') timer.unref();
}
