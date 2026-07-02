import { getPref, setPref } from '../providers/prefsStorage';

const PREFS_KEY = 'dobetter.pref.notifications';

export type LeadDays = 0 | 1 | 3 | 7;

export const LEAD_DAYS_VALUES: readonly LeadDays[] = [0, 1, 3, 7];

export type NotificationPrefs = {
  enabled: boolean;
  leadDays: LeadDays;
  hour: number;
  minute: number;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  leadDays: 1,
  hour: 9,
  minute: 0,
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? Math.trunc(value) : NaN;
  if (Number.isNaN(n) || n < min || n > max) return fallback;
  return n;
}

function normalize(raw: unknown): NotificationPrefs {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PREFS };
  const obj = raw as Record<string, unknown>;
  const leadRaw = clampInt(obj.leadDays, 0, 7, DEFAULT_PREFS.leadDays);
  const leadDays: LeadDays = (LEAD_DAYS_VALUES as readonly number[]).includes(leadRaw)
    ? (leadRaw as LeadDays)
    : DEFAULT_PREFS.leadDays;
  return {
    enabled: typeof obj.enabled === 'boolean' ? obj.enabled : DEFAULT_PREFS.enabled,
    leadDays,
    hour: clampInt(obj.hour, 0, 23, DEFAULT_PREFS.hour),
    minute: clampInt(obj.minute, 0, 59, DEFAULT_PREFS.minute),
  };
}

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  const stored = await getPref(PREFS_KEY);
  if (!stored) return { ...DEFAULT_PREFS };
  try {
    return normalize(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await setPref(PREFS_KEY, JSON.stringify(normalize(prefs)));
}

// Lightweight subscribable store so the settings screen and the background sync
// hook stay in sync without prop drilling or a provider.
let cache: NotificationPrefs = { ...DEFAULT_PREFS };
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getPrefsSnapshot(): NotificationPrefs {
  return cache;
}

export function isPrefsLoaded(): boolean {
  return loaded;
}

export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Loads persisted prefs into the cache once. Idempotent.
export function ensurePrefsLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = loadNotificationPrefs().then((prefs) => {
      cache = prefs;
      loaded = true;
      emit();
    });
  }
  return loadPromise;
}

export async function updateNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  cache = normalize(prefs);
  loaded = true;
  emit();
  await saveNotificationPrefs(cache);
}
