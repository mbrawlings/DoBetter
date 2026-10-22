import * as React from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useQuery } from '@apollo/client';
import { PERSONS_QUERY, SAVE_WEB_PUSH_SUBSCRIPTION, WEB_PUSH_PUBLIC_KEY_QUERY } from '../graphql/operations';
import { apolloClient } from '../providers/apollo';
import { navigationRef } from '../navigation/navigationRef';
import { syncNotifications, type NotifiablePerson } from './scheduler';
import { useNotificationPrefs } from './useNotificationPrefs';
import { canUseWebPush, refreshWebPushSubscription, toNotificationSettings } from './webPush';

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
  const { data: pushKeyData } = useQuery(WEB_PUSH_PUBLIC_KEY_QUERY, {
    skip: Platform.OS !== 'web',
    fetchPolicy: 'cache-first',
  });

  const latest = React.useRef<{ persons: NotifiablePerson[]; prefs: typeof prefs }>({
    persons: [],
    prefs,
  });
  latest.current = { persons: (data?.persons as NotifiablePerson[]) ?? [], prefs };
  const refreshingWebPush = React.useRef(false);

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

  const refreshWebSubscription = React.useCallback(() => {
    if (Platform.OS !== 'web' || !loaded || !latest.current.prefs.enabled) return;
    const publicKey = pushKeyData?.webPushPublicKey as string | null | undefined;
    if (!publicKey || !canUseWebPush()) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (refreshingWebPush.current) return;
    refreshingWebPush.current = true;
    void (async () => {
      try {
        const subscription = await refreshWebPushSubscription(publicKey);
        if (!subscription || !latest.current.prefs.enabled) return;
        await apolloClient.mutate({
          mutation: SAVE_WEB_PUSH_SUBSCRIPTION,
          variables: {
            subscription,
            settings: toNotificationSettings({ ...latest.current.prefs, enabled: true }),
          },
        });
      } catch {
        // The next launch retries. Local reminder settings stay as the user left them.
      } finally {
        refreshingWebPush.current = false;
      }
    })();
  }, [loaded, pushKeyData?.webPushPublicKey]);

  // Re-arm native reminders, and refresh a web push subscription, when the app opens.
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      runSync();
      refreshWebSubscription();
    });
    return () => sub.remove();
  }, [runSync, refreshWebSubscription]);

  // Deep-link into the tapped person when a native reminder is opened.
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

  // iOS replaces push endpoints, so refresh the subscription when reminders are on.
  React.useEffect(() => {
    refreshWebSubscription();
  }, [refreshWebSubscription, prefs.enabled]);

  // Open the person a web reminder linked to, including a cold start via ?openPerson=.
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const pending = new Set<string>();
    let cancelled = false;
    let timer = 0;

    const clearOpenPersonParam = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('openPerson')) return;
      params.delete('openPerson');
      const next = params.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`,
      );
    };

    const flush = () => {
      if (!navigationRef.isReady()) return;
      for (const personId of [...pending]) {
        (navigationRef as any).navigate('PersonHub', { id: personId });
        pending.delete(personId);
        clearOpenPersonParam();
      }
    };

    const ensureTimer = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        if (cancelled) return;
        flush();
        if (pending.size === 0) {
          window.clearInterval(timer);
          timer = 0;
        }
      }, 50);
    };

    const queue = (personId: string) => {
      if (!/^[a-f\d]{24}$/i.test(personId)) {
        clearOpenPersonParam();
        return;
      }
      pending.add(personId);
      flush();
      if (pending.size > 0) ensureTimer();
    };

    const fromUrl = new URLSearchParams(window.location.search).get('openPerson');
    if (fromUrl) queue(fromUrl);

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'openPerson') return;
      if (typeof event.data.personId === 'string') queue(event.data.personId);
    };
    navigator.serviceWorker?.addEventListener('message', onMessage);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      navigator.serviceWorker?.removeEventListener('message', onMessage);
    };
  }, []);
}
