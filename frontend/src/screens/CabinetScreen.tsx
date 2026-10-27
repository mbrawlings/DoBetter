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
import { useMutation, useQuery } from '@apollo/client';
import { Icon, Text } from 'react-native-paper';
import ModeSwitch, { AppMode } from '../components/ModeSwitch';
import { ActionFab, NavBar, NavIconAction, PrimaryButton, SectionLabel } from '../components/ui';
import { ASSETS_QUERY, UPDATE_ASSET_MUTATION } from '../graphql/operations';
import { usePersistedState } from '../hooks/usePersistedState';
import { colorsLight, fontFamily, radius } from '../theme/theme';
import {
  Asset,
  DisplayRow,
  groupAssets,
  isRealm,
  realmLabel,
} from '../utils/asset';

const REALM_FILTERS = ['all', 'home', 'vehicle', 'trailer'] as const;
type RealmFilter = (typeof REALM_FILTERS)[number];
const FAVORITE_FILTERS = ['no', 'yes'] as const;
type FavoriteFilter = (typeof FAVORITE_FILTERS)[number];

type AssetFields = {
  id: string;
  name: string;
  realm: string;
  parentId?: string | null;
  note?: string | null;
  favorite?: boolean | null;
};

function toAsset(raw: AssetFields): Asset | null {
  if (!isRealm(raw.realm)) return null;
  return {
    id: raw.id,
    name: raw.name,
    realm: raw.realm,
    parentId: raw.parentId,
    note: raw.note,
    favorite: Boolean(raw.favorite),
  };
}

function filterLabel(filter: RealmFilter, count: number): string {
  switch (filter) {
    case 'all':
      return `All ${count}`;
    case 'home':
      return 'Home';
    case 'vehicle':
      return 'Vehicle';
    case 'trailer':
      return 'Trailer';
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

function matchesAsset(asset: Asset, realm: RealmFilter, favoritesOnly: boolean, query: string): boolean {
  if (realm !== 'all' && asset.realm !== realm) return false;
  if (favoritesOnly && !asset.favorite) return false;
  if (!query) return true;
  const haystack = `${asset.name} ${asset.note ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

function searchRows(assets: Asset[], visibleIds: Set<string>): DisplayRow[] {
  const byId = new Map(assets.map((asset) => [asset.id, asset]));
  return assets
    .filter((asset) => visibleIds.has(asset.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((asset) => ({
      asset,
      depth: 0,
      parentName: asset.parentId ? (byId.get(asset.parentId)?.name ?? '') : '',
    }));
}

function rowSubtitle(row: DisplayRow): string {
  if (row.parentName) return row.parentName;
  if (row.depth === 0) return realmLabel(row.asset.realm);
  return '';
}

export default function CabinetScreen({ onModeChange }: { onModeChange: (mode: AppMode) => void }) {
  const navigation = useNavigation();
  const { data, loading, error, refetch } = useQuery(ASSETS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const [updateAsset] = useMutation(UPDATE_ASSET_MUTATION);
  const pendingIds = React.useRef(new Set<string>());

  const assets = React.useMemo(() => {
    const raw: AssetFields[] = data?.assets ?? [];
    return raw.map(toAsset).filter((asset): asset is Asset => asset !== null);
  }, [data]);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const [searchQuery, setSearchQuery] = React.useState('');
  const [realmFilter, setRealmFilter] = usePersistedState<RealmFilter>(
    'dobetter.pref.cabinet.realm',
    'all',
    REALM_FILTERS,
  );
  const [favoriteFilter, setFavoriteFilter] = usePersistedState<FavoriteFilter>(
    'dobetter.pref.cabinet.favorites',
    'no',
    FAVORITE_FILTERS,
  );

  const favoritesOnly = favoriteFilter === 'yes';
  const q = searchQuery.trim().toLowerCase();
  const visibleIds = new Set(
    assets.filter((asset) => matchesAsset(asset, realmFilter, favoritesOnly, q)).map((asset) => asset.id),
  );
  const rows = q ? searchRows(assets, visibleIds) : groupAssets(assets, visibleIds);

  function gotoNew() {
    (navigation as any).navigate('Asset' as never);
  }
  function gotoAsset(id: string) {
    (navigation as any).navigate('AssetHub' as never, { id } as never);
  }
  function gotoAccount() {
    (navigation as any).navigate('Account' as never);
  }

  async function toggleFavorite(asset: Asset) {
    if (pendingIds.current.has(asset.id)) return;
    pendingIds.current.add(asset.id);
    try {
      await updateAsset({
        variables: { id: asset.id, input: { favorite: !asset.favorite } },
        refetchQueries: ['Assets'],
      });
    } finally {
      pendingIds.current.delete(asset.id);
    }
  }

  const Header = (
    <NavBar
      title="Cabinet"
      large
      trailing={
        <NavIconAction icon="account-circle-outline" onPress={gotoAccount} accessibilityLabel="Account" />
      }
    />
  );

  if (error) {
    return (
      <View style={styles.screen}>
        {Header}
        <ModeSwitch value="maintenance" onChange={onModeChange} />
        <View style={[styles.center, { padding: 16 }]}>
          <Icon source="alert-circle-outline" size={48} color={colorsLight.danger} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorBody}>{String((error as any).message)}</Text>
        </View>
      </View>
    );
  }

  const showInitialLoading = loading && assets.length === 0;
  const showEmpty = !loading && assets.length === 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => refetch()} tintColor={colorsLight.primary} />
        }
      >
        {Header}
        <ModeSwitch value="maintenance" onChange={onModeChange} />

        {!showEmpty ? (
          <>
            <View style={styles.searchWrap}>
              <View style={styles.searchBar}>
                <Icon source="magnify" size={18} color={colorsLight.textMuted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search assets and notes"
                  placeholderTextColor={colorsLight.textMuted}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                    <Icon source="close-circle" size={18} color={colorsLight.textMuted} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {REALM_FILTERS.map((filter) => {
                const selected = realmFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    onPress={() => setRealmFilter(filter)}
                    style={[styles.filterChip, selected ? styles.filterChipSelected : styles.filterChipDefault]}
                  >
                    <Text style={[styles.filterChipLabel, { color: selected ? colorsLight.surface : colorsLight.text }]}>
                      {filterLabel(filter, assets.length)}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setFavoriteFilter(favoritesOnly ? 'no' : 'yes')}
                style={[styles.filterChip, favoritesOnly ? styles.filterChipSelected : styles.filterChipDefault]}
                accessibilityLabel="Favorites"
                accessibilityState={{ selected: favoritesOnly }}
              >
                <Text style={[styles.filterChipLabel, { color: favoritesOnly ? colorsLight.surface : colorsLight.text }]}>
                  Favorites
                </Text>
              </Pressable>
            </ScrollView>
          </>
        ) : null}

        {showInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colorsLight.primary} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : showEmpty ? (
          <EmptyState onAdd={gotoNew} />
        ) : (
          <>
            <SectionLabel>{`Assets · ${rows.length}`}</SectionLabel>
            {rows.length === 0 ? (
              <View style={styles.emptyFiltered}>
                <Text style={styles.emptyFilteredText}>
                  {q
                    ? `No results for "${searchQuery.trim()}"`
                    : favoritesOnly
                      ? 'No favorite assets in this view.'
                      : 'No assets in this realm.'}
                </Text>
              </View>
            ) : (
              <View style={styles.listGroup}>
                {rows.map((row, index) => {
                  const last = index === rows.length - 1;
                  const subtitle = rowSubtitle(row);
                  return (
                    <View
                      key={row.asset.id}
                      style={[styles.row, { paddingLeft: 16 + row.depth * 18 }, last ? null : styles.rowDivider]}
                    >
                      <Pressable
                        onPress={() => gotoAsset(row.asset.id)}
                        style={styles.rowMain}
                        accessibilityRole="button"
                        accessibilityLabel={row.asset.name}
                      >
                        <View style={styles.rowBody}>
                          <Text style={styles.rowName}>{row.asset.name}</Text>
                          {subtitle ? (
                            <Text style={styles.rowSubtitle} numberOfLines={1}>
                              {subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleFavorite(row.asset)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={row.asset.favorite ? 'Remove favorite' : 'Favorite'}
                      >
                        <Icon
                          source={row.asset.favorite ? 'star' : 'star-outline'}
                          size={20}
                          color={row.asset.favorite ? colorsLight.primary : colorsLight.textFaint}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <ActionFab
        accessibilityLabel="Add asset"
        actions={[{ key: 'add', label: 'Add asset', icon: 'plus', onPress: gotoNew }]}
      />
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyMedallion}>
        <Icon source="archive-outline" size={56} color={colorsLight.primary} />
      </View>
      <Text style={styles.emptyTitle}>Your cabinet</Text>
      <Text style={styles.emptySubtitle}>
        Add a home, vehicle, or trailer. A component is just another asset under a parent, and it keeps that realm.
      </Text>
      <PrimaryButton label="Add an asset" onPress={onAdd} style={{ alignSelf: 'center' }} />
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
    gap: 8,
    paddingVertical: 12,
    paddingRight: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colorsLight.border,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
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
  emptyFiltered: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyFilteredText: {
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
  },
});
