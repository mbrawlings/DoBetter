import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from '@apollo/client';
import {
  BackButton,
  NavBar,
  NavIconAction,
  SectionLabel,
} from '../components/ui';
import GiftIdeaModal, { GiftIdeaForm } from '../components/modals/GiftIdeaModal';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import SortSheet, { SortOption } from '../components/modals/SortSheet';
import {
  CREATE_GIFT_IDEA_MUTATION,
  DELETE_GIFT_IDEA_MUTATION,
  GIFT_IDEAS_QUERY,
  UPDATE_GIFT_IDEA_MUTATION,
} from '../graphql/operations';
import { GIFT_STATUS_OPTIONS } from '../constants/options';
import { usePersistedState } from '../hooks/usePersistedState';
import { colorsLight, fontFamily, giftStatusColorsLight, radius, shadows } from '../theme/theme';
import type { GiftIdea } from '../types';

type GiftSort = 'priority' | 'status' | 'recent';

const SORT_OPTIONS: SortOption<GiftSort>[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'recent', label: 'Recently added' },
];

const SORT_LABELS: Record<GiftSort, string> = {
  priority: 'Priority',
  status: 'Status',
  recent: 'Recent',
};

const FILTERS = ['All', 'Shortlist', 'Idea', 'Purchased', 'Gifted'] as const;
type GiftFilter = (typeof FILTERS)[number];

const STATUS_ORDER: Record<string, number> = GIFT_STATUS_OPTIONS.reduce(
  (acc, status, i) => ({ ...acc, [status]: i }),
  {} as Record<string, number>,
);

const EMPTY_FORM: GiftIdeaForm = { title: '', notes: '', occasion: '', status: '', priority: '' };

function toForm(item: GiftIdea): GiftIdeaForm {
  return {
    title: item.title,
    notes: item.notes || '',
    occasion: item.occasion || '',
    status: item.status || '',
    priority: item.priority ? String(item.priority) : '',
  };
}

function sortGifts(list: GiftIdea[], sort: GiftSort): GiftIdea[] {
  const arr = [...list];
  switch (sort) {
    case 'priority':
      return arr.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
    case 'status':
      return arr.sort(
        (a, b) => (STATUS_ORDER[a.status ?? ''] ?? 99) - (STATUS_ORDER[b.status ?? ''] ?? 99),
      );
    case 'recent':
      return arr.sort((a, b) => +new Date((b as any).createdAt ?? 0) - +new Date((a as any).createdAt ?? 0));
    default: {
      const _exhaustive: never = sort;
      return arr;
    }
  }
}

export default function GiftsScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId: string = route.params?.id;

  const { data, loading, refetch } = useQuery(GIFT_IDEAS_QUERY, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  });
  const [createGiftIdea] = useMutation(CREATE_GIFT_IDEA_MUTATION);
  const [updateGiftIdea] = useMutation(UPDATE_GIFT_IDEA_MUTATION);
  const [deleteGiftIdea] = useMutation(DELETE_GIFT_IDEA_MUTATION);

  const items: GiftIdea[] = (data?.giftIdeas ?? []) as any;

  const [filter, setFilter] = usePersistedState<GiftFilter>('dobetter.pref.gifts.filter', 'All', FILTERS);
  const [sort, setSort] = usePersistedState<GiftSort>('dobetter.pref.gifts.sort', 'recent', ['priority', 'status', 'recent']);
  const [sortVisible, setSortVisible] = React.useState(false);

  const counts = React.useMemo(() => {
    const c: Record<GiftFilter, number> = { All: items.length, Shortlist: 0, Idea: 0, Purchased: 0, Gifted: 0 };
    for (const g of items) {
      if (g.status === 'shortlist') c.Shortlist += 1;
      else if (g.status === 'idea') c.Idea += 1;
      else if (g.status === 'purchased') c.Purchased += 1;
      else if (g.status === 'gifted') c.Gifted += 1;
    }
    return c;
  }, [items]);

  const visible = React.useMemo(() => {
    const filtered = filter === 'All' ? items : items.filter((g) => g.status === filter.toLowerCase());
    return sortGifts(filtered, sort);
  }, [items, filter, sort]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [initial, setInitial] = React.useState<GiftIdeaForm>(EMPTY_FORM);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const editItem = editId ? items.find((g) => g.id === editId) : undefined;

  function openAdd() {
    setEditId(null);
    setInitial(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(item: GiftIdea) {
    setEditId(item.id ?? null);
    setInitial(toForm(item));
    setModalVisible(true);
  }

  async function handleSave(form: GiftIdeaForm) {
    if (editId) {
      await updateGiftIdea({
        variables: {
          id: editId,
          input: {
            title: form.title || undefined,
            notes: form.notes || undefined,
            occasion: form.occasion || undefined,
            status: form.status || undefined,
            priority: form.priority ? Number(form.priority) : undefined,
          },
        },
      });
    } else {
      await createGiftIdea({
        variables: {
          input: {
            personId,
            title: form.title,
            notes: form.notes || undefined,
            occasion: form.occasion || undefined,
            status: form.status || undefined,
            priority: form.priority ? Number(form.priority) : undefined,
          },
        },
      });
    }
    refetch();
    setModalVisible(false);
  }

  async function handleConfirmDelete() {
    if (!editId) return;
    setDeleting(true);
    try {
      await deleteGiftIdea({ variables: { id: editId } });
      refetch();
      setConfirmVisible(false);
      setModalVisible(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <NavBar
        title="Gift ideas"
        leading={<BackButton onPress={() => navigation.goBack()} />}
        trailing={<NavIconAction icon="plus" onPress={openAdd} accessibilityLabel="New gift idea" />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && items.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colorsLight.primary} />
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {FILTERS.map((f) => {
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
                        { color: selected ? colorsLight.bg : colorsLight.text },
                      ]}
                    >
                      {`${f} ${counts[f]}`}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <SectionLabel
              action={{ label: SORT_LABELS[sort], onPress: () => setSortVisible(true) }}
            >
              {filter === 'All' ? 'All ideas' : filter}
            </SectionLabel>

            {visible.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No gift ideas here yet.</Text>
                <Pressable onPress={openAdd} hitSlop={6} style={styles.emptyAdd}>
                  <Icon source="plus" size={16} color={colorsLight.primary} />
                  <Text style={styles.emptyAddLabel}>Add a gift idea</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.stack}>
                {visible.map((g, idx) => (
                  <GiftCard key={g.id ?? `${g.title}-${idx}`} item={g} onPress={() => openEdit(g)} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <GiftIdeaModal
        visible={modalVisible}
        titleText={editId ? 'Edit gift idea' : 'New gift idea'}
        initial={initial}
        onDismiss={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={editId ? () => setConfirmVisible(true) : undefined}
      />

      <ConfirmSheet
        visible={confirmVisible}
        title="Delete gift idea?"
        message={editItem ? `"${editItem.title}" will be removed. This can't be undone.` : undefined}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setConfirmVisible(false)}
      />

      <SortSheet
        visible={sortVisible}
        value={sort}
        options={SORT_OPTIONS}
        title="Sort gift ideas"
        onSelect={(v) => {
          setSort(v);
          setSortVisible(false);
        }}
        onDismiss={() => setSortVisible(false)}
      />
    </View>
  );
}

function GiftCard({ item, onPress }: { item: GiftIdea; onPress: () => void }) {
  const statusColor = item.status ? giftStatusColorsLight[item.status] : undefined;
  const meta = [item.occasion, item.priority ? `P${item.priority}` : undefined]
    .filter(Boolean)
    .join(' · ');
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.iconBlock}>
        <Icon source="gift-outline" size={20} color={colorsLight.giftIconFg} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          {item.status && statusColor ? (
            <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusLabel, { color: statusColor.fg }]}>{item.status}</Text>
            </View>
          ) : null}
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        </View>
      </View>
      <Icon source="chevron-right" size={16} color={colorsLight.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  scroll: {
    paddingBottom: 60,
  },
  center: {
    paddingTop: 80,
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
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
  stack: {
    marginHorizontal: 16,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  iconBlock: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsLight.giftIconBg,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  statusLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'capitalize',
    includeFontPadding: false,
  },
  meta: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    includeFontPadding: false,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.textMuted,
  },
  emptyAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  emptyAddLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
});
