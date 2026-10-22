import * as React from 'react';
import { Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { useMutation, useQuery } from '@apollo/client';
import { BackButton, FieldRow, NavBar } from '../components/ui';
import SortSheet, { SortOption } from '../components/modals/SortSheet';
import TimeInput, { formatHumanTime } from '../components/inputs/TimeInput';
import { useNotificationPrefs } from '../notifications/useNotificationPrefs';
import { ensurePermission } from '../notifications/scheduler';
import type { LeadDays, NotificationPrefs } from '../notifications/notificationPrefs';
import {
  isIosDevice,
  isStandaloneDisplay,
  requestWebPushPermission,
  subscribeWebPush,
  toNotificationSettings,
  unsubscribeWebPush,
  webPushSupported,
} from '../notifications/webPush';
import {
  REMOVE_WEB_PUSH_SUBSCRIPTION,
  SAVE_WEB_PUSH_SUBSCRIPTION,
  UPDATE_NOTIFICATION_SETTINGS,
  WEB_PUSH_PUBLIC_KEY_QUERY,
} from '../graphql/operations';
import { colorsLight, fontFamily, radius } from '../theme/theme';

const LEAD_OPTIONS: SortOption<string>[] = [
  { value: '0', label: 'Same day' },
  { value: '1', label: '1 day before' },
  { value: '3', label: '3 days before' },
  { value: '7', label: '1 week before' },
];

const LEAD_LABELS: Record<string, string> = {
  '0': 'Same day',
  '1': '1 day before',
  '3': '3 days before',
  '7': '1 week before',
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

type PermissionState = 'unknown' | 'granted' | 'denied';

export default function NotificationsScreen({ navigation }: any) {
  const { prefs, loaded, update } = useNotificationPrefs();
  const isWeb = Platform.OS === 'web';
  const webBlocked = isWeb && isIosDevice() && !isStandaloneDisplay();
  const webReady = isWeb && webPushSupported() && !webBlocked;

  const { data: pushKeyData, loading: pushKeyLoading } = useQuery(WEB_PUSH_PUBLIC_KEY_QUERY, {
    skip: !isWeb,
  });
  const publicKey = (pushKeyData?.webPushPublicKey as string | null | undefined) ?? null;
  const [saveSubscription] = useMutation(SAVE_WEB_PUSH_SUBSCRIPTION);
  const [removeSubscription] = useMutation(REMOVE_WEB_PUSH_SUBSCRIPTION);
  const [updateSettings] = useMutation(UPDATE_NOTIFICATION_SETTINGS);

  const [leadSheetVisible, setLeadSheetVisible] = React.useState(false);
  const [permission, setPermission] = React.useState<PermissionState>('unknown');
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isWeb) {
      if (typeof Notification === 'undefined') return;
      if (Notification.permission === 'granted') setPermission('granted');
      else if (Notification.permission === 'denied') setPermission('denied');
      return;
    }
    let active = true;
    Notifications.getPermissionsAsync().then((res) => {
      if (active) setPermission(res.granted ? 'granted' : 'denied');
    });
    return () => {
      active = false;
    };
  }, [isWeb]);

  async function persistSettings(next: NotificationPrefs) {
    await update(next);
    if (!isWeb) return;
    await updateSettings({ variables: { settings: toNotificationSettings(next) } });
  }

  async function handleToggle(next: boolean) {
    setSaveError(null);
    if (isWeb) {
      if (!next) {
        const endpoint = await unsubscribeWebPush();
        await update({ ...prefs, enabled: false });
        try {
          await updateSettings({
            variables: { settings: toNotificationSettings({ ...prefs, enabled: false }) },
          });
          if (endpoint) await removeSubscription({ variables: { endpoint } });
        } catch {
          setSaveError('Could not turn off reminders. Try again.');
        }
        return;
      }

      const permissionResult = await requestWebPushPermission();
      setPermission(permissionResult === 'granted' ? 'granted' : 'denied');
      if (permissionResult !== 'granted' || !publicKey) return;

      const subscription = await subscribeWebPush(publicKey);
      if (!subscription) {
        setSaveError('Could not turn on reminders. Try again.');
        return;
      }

      const nextPrefs = { ...prefs, enabled: true };
      await update(nextPrefs);
      try {
        await saveSubscription({
          variables: { subscription, settings: toNotificationSettings(nextPrefs) },
        });
      } catch {
        await update({ ...prefs, enabled: false });
        await unsubscribeWebPush();
        setSaveError('Could not turn on reminders. Try again.');
      }
      return;
    }

    if (next) {
      const granted = await ensurePermission();
      setPermission(granted ? 'granted' : 'denied');
    }
    await update({ ...prefs, enabled: next });
  }

  async function handleLeadSelect(value: string) {
    setLeadSheetVisible(false);
    setSaveError(null);
    try {
      await persistSettings({ ...prefs, leadDays: Number(value) as LeadDays });
    } catch {
      setSaveError('Could not save reminder settings. Try again.');
    }
  }

  async function handleTimeChange(value: string) {
    const [hh, mm] = value.split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return;
    setSaveError(null);
    try {
      await persistSettings({ ...prefs, hour: hh, minute: mm });
    } catch {
      setSaveError('Could not save reminder settings. Try again.');
    }
  }

  const timeValue = `${pad(prefs.hour)}:${pad(prefs.minute)}`;
  const showControls = prefs.enabled && !webBlocked;
  const showPermissionWarning = !webBlocked && permission === 'denied' && (isWeb || prefs.enabled);
  const switchDisabled =
    !loaded || webBlocked || (isWeb && (!webReady || pushKeyLoading || !publicKey));

  return (
    <View style={styles.screen}>
      <NavBar title="Notifications" leading={<BackButton onPress={() => navigation.goBack()} />} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={[styles.toggleRow, showControls ? styles.rowDivider : null]}>
            <View style={styles.toggleBody}>
              <Text style={styles.toggleTitle}>Reminders</Text>
              <Text style={styles.toggleSubtitle}>
                Birthdays, anniversaries, and upcoming events for your people.
              </Text>
            </View>
            <Switch
              value={prefs.enabled}
              onValueChange={handleToggle}
              disabled={switchDisabled}
              trackColor={{ true: colorsLight.primary, false: colorsLight.borderStrong }}
              thumbColor={colorsLight.surface}
            />
          </View>

          {showControls ? (
            <>
              <FieldRow
                label="Remind me"
                value={LEAD_LABELS[String(prefs.leadDays)] ?? '1 day before'}
                variant="select"
                onPress={() => setLeadSheetVisible(true)}
                style={styles.rowDivider}
              />
              <TimeInput label="Time of day" value={timeValue} onChange={handleTimeChange} />
            </>
          ) : null}
        </View>

        {showControls ? (
          <Text style={styles.hint}>
            {`Reminders arrive ${(LEAD_LABELS[String(prefs.leadDays)] ?? '1 day before').toLowerCase()} at ${formatHumanTime(timeValue)}.`}
          </Text>
        ) : null}

        {showPermissionWarning ? (
          <View style={styles.warning}>
            <Icon source="alert-circle-outline" size={20} color={colorsLight.danger} />
            <Text style={styles.warningText}>
              {isWeb
                ? 'Notifications are turned off for DoBetter. Enable them in your browser settings to receive reminders.'
                : 'Notifications are turned off for DoBetter. Enable them in your device settings to receive reminders.'}
            </Text>
          </View>
        ) : null}

        {webBlocked ? (
          <Text style={styles.hint}>
            Add DoBetter to your Home Screen, then open it from the icon to turn on reminders.
          </Text>
        ) : null}

        {isWeb && !webBlocked && !webPushSupported() ? (
          <Text style={styles.hint}>Reminders need a browser that supports notifications.</Text>
        ) : null}

        {webReady && !pushKeyLoading && !publicKey ? (
          <Text style={styles.hint}>Reminders are not available right now.</Text>
        ) : null}

        {saveError ? (
          <View style={styles.warning}>
            <Icon source="alert-circle-outline" size={20} color={colorsLight.danger} />
            <Text style={styles.warningText}>{saveError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <SortSheet
        visible={leadSheetVisible}
        value={String(prefs.leadDays)}
        options={LEAD_OPTIONS}
        title="Remind me"
        onSelect={handleLeadSelect}
        onDismiss={() => setLeadSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colorsLight.border,
  },
  toggleBody: {
    flex: 1,
    minWidth: 0,
  },
  toggleTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  toggleSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 12,
    marginHorizontal: 4,
    includeFontPadding: false,
  },
  warning: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colorsLight.primarySoft,
  },
  warningText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 19,
    color: colorsLight.text,
    includeFontPadding: false,
  },
});
