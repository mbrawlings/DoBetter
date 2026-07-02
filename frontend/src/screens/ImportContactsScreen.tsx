import * as React from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Icon, Text } from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import { useMutation, useQuery } from '@apollo/client';
import {
  Avatar,
  BackButton,
  NavBar,
  PrimaryButton,
  SectionLabel,
} from '../components/ui';
import { IMPORT_CONTACTS_MUTATION, PERSONS_QUERY } from '../graphql/operations';
import { colorsLight, fontFamily, radius } from '../theme/theme';

type ImportRow = {
  contactId: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  importable: boolean;
};

type PermissionState = 'checking' | 'granted' | 'denied';
type AccessPrivileges = 'all' | 'limited' | 'none' | undefined;

// presentAccessPickerAsync is iOS 18+ only and rejects on anything else.
const canPickAccess =
  Platform.OS === 'ios' && typeof Contacts.presentAccessPickerAsync === 'function';

// expo-contacts returns month adjusted for JS Date (0-indexed). Only build a
// YYYY-MM-DD when the OS gave us a full date including the year.
function toBirthDate(birthday?: Contacts.Date): string | undefined {
  if (!birthday || birthday.year == null || birthday.month == null || birthday.day == null) {
    return undefined;
  }
  const mm = String(birthday.month + 1).padStart(2, '0');
  const dd = String(birthday.day).padStart(2, '0');
  return `${birthday.year}-${mm}-${dd}`;
}

export default function ImportContactsScreen({ navigation }: any) {
  const { data: personsData, refetch } = useQuery(PERSONS_QUERY, {
    variables: { filter: null },
    fetchPolicy: 'cache-and-network',
  });
  const [importContacts, { loading: importing }] = useMutation(IMPORT_CONTACTS_MUTATION);

  const [permission, setPermission] = React.useState<PermissionState>('checking');
  const [accessPrivileges, setAccessPrivileges] = React.useState<AccessPrivileges>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<ImportRow[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const alreadyImported = React.useMemo(() => {
    const ids = new Set<string>();
    for (const p of personsData?.persons ?? []) {
      for (const cid of p.contactIds ?? []) ids.add(cid);
    }
    return ids;
  }, [personsData]);

  const loadContacts = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const perm = await Contacts.requestPermissionsAsync();
      setAccessPrivileges(perm.accessPrivileges);
      if (perm.status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.Birthday,
        ],
      });
      const mapped: ImportRow[] = data
        .filter((c) => c.id && (c.firstName || c.lastName))
        .map((c) => {
          const firstName = (c.firstName ?? '').trim();
          const lastName = (c.lastName ?? '').trim();
          return {
            contactId: c.id as string,
            firstName,
            lastName,
            birthDate: toBirthDate(c.birthday),
            // Person requires both names; contacts missing one can't be imported.
            importable: firstName.length > 0 && lastName.length > 0,
          };
        })
        .sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
        );
      setRows(mapped);
    } catch (e: any) {
      setErrorMsg(e?.message ? String(e.message) : 'Could not load contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      setLoading(false);
      return;
    }
    loadContacts();
  }, [loadContacts]);

  async function handleAddMore() {
    if (canPickAccess) {
      try {
        await Contacts.presentAccessPickerAsync();
      } catch {
        // Picker unavailable (e.g. iOS < 18); fall back to Settings below.
        await Linking.openSettings();
      }
    } else {
      await Linking.openSettings();
    }
    await loadContacts();
  }

  function toggle(contactId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) next.delete(contactId);
      else next.add(contactId);
      return next;
    });
  }

  const q = search.trim().toLowerCase();
  const visibleRows = React.useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q),
    );
  }, [rows, q]);

  async function onImport() {
    if (selected.size === 0 || importing) return;
    const contacts = rows
      .filter((r) => selected.has(r.contactId) && r.importable)
      .map((r) => ({
        contactId: r.contactId,
        firstName: r.firstName,
        lastName: r.lastName,
        birthDate: r.birthDate ?? null,
      }));
    if (contacts.length === 0) return;
    try {
      await importContacts({ variables: { contacts } });
      await refetch();
      navigation.goBack();
    } catch (e: any) {
      setErrorMsg(e?.message ? String(e.message) : 'Import failed.');
    }
  }

  const selectableCount = selected.size;

  function renderBody() {
    if (Platform.OS === 'web') {
      return (
        <Info
          icon="cellphone"
          title="Available on mobile"
          body="Importing from your contacts works in the iOS and Android app."
        />
      );
    }
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colorsLight.primary} />
          <Text style={styles.muted}>Loading contacts…</Text>
        </View>
      );
    }
    if (permission === 'denied') {
      return (
        <Info
          icon="lock-outline"
          title="Contacts access is off"
          body="Enable Contacts access for DoBetter in Settings, then try again."
          action={{ label: 'Open Settings', onPress: () => Linking.openSettings() }}
        />
      );
    }
    if (errorMsg) {
      return (
        <Info
          icon="alert-circle-outline"
          title="Something went wrong"
          body={errorMsg}
          action={{ label: 'Try again', onPress: loadContacts }}
        />
      );
    }
    if (rows.length === 0) {
      if (accessPrivileges === 'limited') {
        return (
          <Info
            icon="account-multiple-outline"
            title="No contacts to import"
            body="You're only sharing a limited set of contacts with DoBetter. Choose more from your address book to import them."
            action={{ label: 'Choose contacts to share', onPress: handleAddMore }}
          />
        );
      }
      return (
        <Info
          icon="account-multiple-outline"
          title="No contacts found"
          body="We couldn't find any contacts with a name to import."
        />
      );
    }
    return (
      <>
        {accessPrivileges === 'limited' ? <LimitedAccessBanner onPress={handleAddMore} /> : null}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Icon source="magnify" size={18} color={colorsLight.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search contacts"
              placeholderTextColor={colorsLight.textMuted}
              style={styles.searchInput}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel="Clear search">
                <Icon source="close-circle" size={18} color={colorsLight.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <SectionLabel>{`Contacts · ${visibleRows.length}`}</SectionLabel>
        <View style={styles.listGroup}>
          {visibleRows.map((row, index) => {
            const last = index === visibleRows.length - 1;
            const imported = alreadyImported.has(row.contactId);
            const disabled = imported || !row.importable;
            const checked = selected.has(row.contactId);
            const hint = imported
              ? 'Added'
              : !row.importable
                ? 'Needs first & last name'
                : undefined;
            return (
              <Pressable
                key={row.contactId}
                onPress={() => !disabled && toggle(row.contactId)}
                disabled={disabled}
                style={[styles.row, last ? null : styles.rowDivider, disabled ? styles.rowDisabled : null]}
              >
                <Avatar firstName={row.firstName} lastName={row.lastName} size={40} />
                <View style={styles.rowBody}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {`${row.firstName} ${row.lastName}`.trim()}
                  </Text>
                  {hint ? (
                    <Text style={styles.rowHint} numberOfLines={1}>
                      {hint}
                    </Text>
                  ) : row.birthDate ? (
                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                      Birthday included
                    </Text>
                  ) : null}
                </View>
                <Checkbox checked={checked} disabled={disabled} />
              </Pressable>
            );
          })}
        </View>
      </>
    );
  }

  const showFooter = Platform.OS !== 'web' && permission === 'granted' && rows.length > 0;

  return (
    <View style={styles.screen}>
      <NavBar
        title="Import contacts"
        leading={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {renderBody()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {showFooter ? (
        <View style={styles.footer}>
          <PrimaryButton
            label={selectableCount > 0 ? `Import ${selectableCount}` : 'Select contacts'}
            onPress={onImport}
            disabled={selectableCount === 0}
            loading={importing}
            full
          />
        </View>
      ) : null}
    </View>
  );
}

function LimitedAccessBanner({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.banner}>
      <Icon source="account-lock-outline" size={20} color={colorsLight.primary} />
      <View style={styles.bannerBody}>
        <Text style={styles.bannerTitle}>You're sharing only some contacts</Text>
        <Text style={styles.bannerText}>
          Add more from your address book to import them.
        </Text>
      </View>
      <Pressable onPress={onPress} hitSlop={6} style={styles.bannerAction}>
        <Text style={styles.bannerActionLabel}>Choose</Text>
      </Pressable>
    </View>
  );
}

function Checkbox({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  return (
    <View
      style={[
        styles.checkbox,
        checked ? styles.checkboxChecked : null,
        disabled ? styles.checkboxDisabled : null,
      ]}
    >
      {checked ? <Icon source="check" size={14} color={colorsLight.primaryFg} /> : null}
    </View>
  );
}

function Info({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.info}>
      <View style={styles.infoMedallion}>
        <Icon source={icon} size={40} color={colorsLight.primary} />
      </View>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={6} style={styles.infoAction}>
          <Text style={styles.infoActionLabel}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  scroll: {
    paddingBottom: 16,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  muted: {
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
    marginTop: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colorsLight.primarySoft,
    borderRadius: radius.lg,
  },
  bannerBody: {
    flex: 1,
    minWidth: 0,
  },
  bannerTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 14,
    color: colorsLight.text,
    includeFontPadding: false,
  },
  bannerText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 1,
    includeFontPadding: false,
  },
  bannerAction: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colorsLight.primary,
  },
  bannerActionLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 13,
    color: colorsLight.primaryFg,
    includeFontPadding: false,
  },
  searchWrap: {
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colorsLight.raised,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colorsLight.text,
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
  },
  listGroup: {
    marginHorizontal: 16,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colorsLight.border,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  rowSubtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 1,
    includeFontPadding: false,
  },
  rowHint: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textFaint,
    marginTop: 1,
    includeFontPadding: false,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorsLight.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colorsLight.primary,
    borderColor: colorsLight.primary,
  },
  checkboxDisabled: {
    borderColor: colorsLight.border,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: colorsLight.bg,
    borderTopWidth: 1,
    borderTopColor: colorsLight.border,
  },
  info: {
    alignItems: 'center',
    paddingTop: 90,
    paddingHorizontal: 32,
  },
  infoMedallion: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colorsLight.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: -0.4,
    color: colorsLight.text,
    marginBottom: 8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  infoBody: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.textMuted,
    lineHeight: 22,
    maxWidth: 300,
    textAlign: 'center',
  },
  infoAction: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    backgroundColor: colorsLight.primarySoft,
  },
  infoActionLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
});
