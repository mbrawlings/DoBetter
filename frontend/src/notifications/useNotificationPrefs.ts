import * as React from 'react';
import {
  ensurePrefsLoaded,
  getPrefsSnapshot,
  isPrefsLoaded,
  subscribePrefs,
  updateNotificationPrefs,
  type NotificationPrefs,
} from './notificationPrefs';

export function useNotificationPrefs(): {
  prefs: NotificationPrefs;
  loaded: boolean;
  update: (prefs: NotificationPrefs) => Promise<void>;
} {
  React.useEffect(() => {
    void ensurePrefsLoaded();
  }, []);

  const prefs = React.useSyncExternalStore(subscribePrefs, getPrefsSnapshot);
  const loaded = React.useSyncExternalStore(subscribePrefs, isPrefsLoaded);

  return { prefs, loaded, update: updateNotificationPrefs };
}
