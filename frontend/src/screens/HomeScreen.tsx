import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { Icon, Text } from 'react-native-paper';
import { PERSONS_QUERY } from '../graphql/operations';
import { colorsLight, fontFamily, radius } from '../theme/theme';
import {
  Avatar,
  NavBar,
  NavIconAction,
  PrimaryButton,
  SectionLabel,
} from '../components/ui';
import SortSheet, { SortBy } from '../components/modals/SortSheet';

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  city?: string | null;
  relationship?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const SORT_LABELS: Record<SortBy, string> = {
  recent: 'Recent',
  az: 'A–Z',
  za: 'Z–A',
};

function fullName(p: Person): string {
  return `${p.firstName} ${p.lastName}`;
}

function sortPersons(list: Person[], sortBy: SortBy): Person[] {
  const arr = [...list];
  switch (sortBy) {
    case 'recent':
      return arr.sort(
        (a, b) => +new Date(b.updatedAt ?? 0) - +new Date(a.updatedAt ?? 0),
      );
    case 'az':
      return arr.sort((a, b) => fullName(a).localeCompare(fullName(b)));
    case 'za':
      return arr.sort((a, b) => fullName(b).localeCompare(fullName(a)));
    default: {
      const _exhaustive: never = sortBy;
      return arr;
    }
  }
}

const FILTERS = ['All', 'Family', 'Friends', 'Work', 'Need to reach out'] as const;
type Filter = (typeof FILTERS)[number];

const FAMILY = new Set(['spouse', 'sibling', 'parent', 'child']);
const FRIENDS = new Set(['friend']);
const WORK = new Set(['colleague']);

function passesFilter(p: Person, filter: Filter): boolean {
  const rel = (p.relationship ?? '').toLowerCase();
  switch (filter) {
    case 'All':
      return true;
    case 'Family':
      return FAMILY.has(rel);
    case 'Friends':
      return FRIENDS.has(rel);
    case 'Work':
      return WORK.has(rel);
    case 'Need to reach out':
      return false;
  }
}

export default function HomeScreen() {
  const { data, loading, error, refetch } = useQuery(PERSONS_QUERY, {
    variables: { filter: null },
    fetchPolicy: 'cache-and-network',
  });
  const navigation = useNavigation();
  const persons: Person[] = data?.persons ?? [];

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState<Filter>('All');
  const [sortBy, setSortBy] = React.useState<SortBy>('recent');
  const [sortSheetVisible, setSortSheetVisible] = React.useState(false);

  function gotoNew() {
    (navigation as any).navigate('Person' as never);
  }
  function gotoPerson(id: string) {
    (navigation as any).navigate('Person' as never, { id } as never);
  }
  function gotoAccount() {
    (navigation as any).navigate('Account' as never);
  }

  const filtered = persons.filter((p) => passesFilter(p, filter));
  const sorted = React.useMemo(() => sortPersons(filtered, sortBy), [filtered, sortBy]);

  const Header = (
    <NavBar
      title="People"
      large
      trailing={
        <View style={styles.headerActions}>
          <NavIconAction icon="account-circle-outline" onPress={gotoAccount} accessibilityLabel="Account" />
          <NavIconAction icon="plus" onPress={gotoNew} accessibilityLabel="Add person" />
        </View>
      }
    />
  );

  if (error) {
    return (
      <View style={styles.screen}>
        {Header}
        <View style={[styles.center, { padding: 16 }]}>
          <Icon source="alert-circle-outline" size={48} color={colorsLight.danger} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorBody}>{String((error as any).message)}</Text>
        </View>
      </View>
    );
  }

  const showInitialLoading = loading && persons.length === 0;
  const showEmpty = !loading && persons.length === 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => refetch()}
            tintColor={colorsLight.primary}
          />
        }
      >
        {Header}

        {!showEmpty ? (
          <>
            <View style={styles.searchWrap}>
              <View style={styles.searchBar}>
                <Icon source="magnify" size={18} color={colorsLight.textMuted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search people, interests, places"
                  placeholderTextColor={colorsLight.textMuted}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={() =>
                    refetch({ filter: searchQuery ? { search: searchQuery } : null })
                  }
                />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {FILTERS.map((f) => {
                const isAll = f === 'All';
                const label = isAll ? `All ${persons.length}` : f;
                const selected = filter === f;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[
                      styles.filterChip,
                      selected ? styles.filterChipSelected : styles.filterChipDefault,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipLabel,
                        { color: selected ? colorsLight.surface : colorsLight.text },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {showInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colorsLight.primary} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : showEmpty ? (
          <EmptyState onAddFirst={gotoNew} />
        ) : (
          <>
            <SectionLabel
              action={{
                label: `Sort: ${SORT_LABELS[sortBy]}`,
                onPress: () => setSortSheetVisible(true),
              }}
            >
              {`All people · ${sorted.length}`}
            </SectionLabel>
            {sorted.length === 0 ? (
              <View style={styles.emptyFiltered}>
                <Text style={styles.emptyFilteredText}>No people match this filter.</Text>
              </View>
            ) : (
              <View style={styles.listGroup}>
                {sorted.map((item, index) => {
                  const last = index === sorted.length - 1;
                  const subtitle = [item.relationship, item.city]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => gotoPerson(item.id)}
                      style={[styles.row, last ? null : styles.rowDivider]}
                    >
                      <Avatar firstName={item.firstName} lastName={item.lastName} size={40} />
                      <View style={styles.rowBody}>
                        <Text style={styles.rowName}>
                          {`${item.firstName} ${item.lastName}`}
                        </Text>
                        {subtitle ? (
                          <Text style={styles.rowSubtitle} numberOfLines={1}>
                            {subtitle}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <SortSheet
        visible={sortSheetVisible}
        value={sortBy}
        onSelect={(value) => {
          setSortBy(value);
          setSortSheetVisible(false);
        }}
        onDismiss={() => setSortSheetVisible(false)}
      />
    </View>
  );
}

function EmptyState({ onAddFirst }: { onAddFirst: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyMedallion}>
        <Icon source="account-group-outline" size={56} color={colorsLight.primary} />
      </View>
      <Text style={styles.emptyTitle}>Your people, in one place</Text>
      <Text style={styles.emptySubtitle}>
        Add someone you care about. Track birthdays, gift ideas, and the moments worth remembering.
      </Text>
      <PrimaryButton label="Add your first person" onPress={onAddFirst} />
      <Pressable hitSlop={6} style={{ marginTop: 16 }}>
        <Text style={styles.emptySecondary}>Import from Contacts</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scroll: {
    paddingBottom: 16,
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
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterChipDefault: {
    backgroundColor: colorsLight.surface,
    borderColor: colorsLight.border,
  },
  filterChipSelected: {
    backgroundColor: colorsLight.text,
    borderColor: colorsLight.text,
  },
  filterChipLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  errorTitle: {
    marginTop: 12,
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
  },
  errorBody: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyMedallion: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colorsLight.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.5,
    color: colorsLight.text,
    marginBottom: 8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.textMuted,
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 28,
    textAlign: 'center',
  },
  emptySecondary: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.textMuted,
  },
  emptyFiltered: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyFilteredText: {
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
  },
});
