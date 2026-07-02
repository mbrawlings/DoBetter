import * as React from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useQuery } from '@apollo/client';
import { PERSONS_QUERY } from '../graphql/operations';
import { navigationRef } from '../navigation/navigationRef';
import { syncNotifications, type NotifiablePerson } from './scheduler';
import { useNotificationPrefs } from './useNotificationPrefs';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Keeps on-device scheduled reminders in sync with the user's people and prefs.
// Mount once inside the authenticated tree (needs Apollo + navigation context).
export function useNotificationSync(): void {
  const { prefs, loaded } = useNotificationPrefs();
  const { data } = useQuery(PERSONS_QUERY, {
    variables: { filter: null },
    fetchPolicy: 'cache-and-network',
  });

  const latest = React.useRef<{ persons: NotifiablePerson[]; prefs: typeof prefs }>({
    persons: [],
    prefs,
  });
  latest.current = { persons: (data?.persons as NotifiablePerson[]) ?? [], prefs };

  const runSync = React.useCallback(() => {
    if (Platform.OS === 'web') return;
    void syncNotifications(latest.current.persons, latest.current.prefs);
  }, []);

  // Re-derive the schedule whenever prefs or the people list change.
  React.useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(runSync, 400);
    return () => clearTimeout(timer);
  }, [loaded, prefs, data, runSync]);

  // Re-arm recurring reminders each time the app returns to the foreground.
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') runSync();
    });
    return () => sub.remove();
  }, [runSync]);

  // Deep-link into the tapped person when a reminder is opened.
  React.useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const personId = (response.notification.request.content.data as { personId?: string })
        ?.personId;
      if (personId && navigationRef.isReady()) {
        (navigationRef as any).navigate('PersonHub', { id: personId });
      }
    });
    return () => sub.remove();
  }, []);
}
