import type { NotificationPrefs } from './notificationPrefs';

export type WebPushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type NotificationSettingsInput = {
  enabled: boolean;
  leadDays: NotificationPrefs['leadDays'];
  hour: number;
  minute: number;
  timeZone: string;
};

type StandaloneNavigator = Navigator & { standalone?: boolean };

function browserNavigator(): StandaloneNavigator | null {
  if (typeof navigator === 'undefined') return null;
  return navigator;
}

export function isIosDevice(): boolean {
  const nav = browserNavigator();
  if (!nav) return false;
  if (/iPhone|iPad|iPod/i.test(nav.userAgent)) return true;
  return nav.platform === 'MacIntel' && nav.maxTouchPoints > 1;
}

export function isStandaloneDisplay(): boolean {
  const nav = browserNavigator();
  if (!nav || typeof window === 'undefined') return false;
  if (nav.standalone === true) return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  );
}

export function webPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// iOS only delivers Web Push from an installed home-screen app.
export function canUseWebPush(): boolean {
  if (!webPushSupported()) return false;
  if (isIosDevice() && !isStandaloneDisplay()) return false;
  return true;
}

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function toNotificationSettings(prefs: NotificationPrefs): NotificationSettingsInput {
  return {
    enabled: prefs.enabled,
    leadDays: prefs.leadDays,
    hour: prefs.hour,
    minute: prefs.minute,
    timeZone: browserTimeZone(),
  };
}

export function requestWebPushPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function subscriptionKeys(subscription: PushSubscription): WebPushSubscriptionInput | null {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!subscription.endpoint || !p256dh || !auth) return null;
  return { endpoint: subscription.endpoint, p256dh, auth };
}

async function ensureSubscription(publicKey: string): Promise<WebPushSubscriptionInput | null> {
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }
  return subscriptionKeys(subscription);
}

export async function subscribeWebPush(publicKey: string): Promise<WebPushSubscriptionInput | null> {
  if (!canUseWebPush() || Notification.permission !== 'granted') return null;
  try {
    return await ensureSubscription(publicKey);
  } catch {
    return null;
  }
}

export async function refreshWebPushSubscription(
  publicKey: string,
): Promise<WebPushSubscriptionInput | null> {
  if (!canUseWebPush() || Notification.permission !== 'granted') return null;
  try {
    return await ensureSubscription(publicKey);
  } catch {
    return null;
  }
}

export async function unsubscribeWebPush(): Promise<string | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}
