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
import InteractionModal, { InteractionForm } from '../components/modals/InteractionModal';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import SortSheet, { SortOption } from '../components/modals/SortSheet';
import {
  CREATE_INTERACTION_MUTATION,
  DELETE_INTERACTION_MUTATION,
  INTERACTIONS_QUERY,
  UPDATE_INTERACTION_MUTATION,
} from '../graphql/operations';
import { colorsLight, fontFamily, radius, shadows } from '../theme/theme';
import { formatRelativeShort } from '../utils/date';
import type { Interaction } from '../types';

type MomentSort = 'recent' | 'oldest';

const SORT_OPTIONS: SortOption<MomentSort>[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest first' },
];

const SORT_LABELS: Record<MomentSort, string> = {
  recent: 'Recent',
  oldest: 'Oldest',
};

const EMPTY_FORM: InteractionForm = { summary: '', date: '', channel: '', location: '' };

function toForm(item: Interaction): InteractionForm {
  return {
    summary: item.summary,
    date: item.date || '',
    channel: item.channel || '',
    location: item.location || '',
  };
}

function sortMoments(list: Interaction[], sort: MomentSort): Interaction[] {
  const arr = [...list];
  arr.sort((a, b) => {
    const diff = +new Date(b.date ?? 0) - +new Date(a.date ?? 0);
    return sort === 'recent' ? diff : -diff;
  });
  return arr;
}

export default function MomentsScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId: string = route.params?.id;

  const { data, loading, refetch } = useQuery(INTERACTIONS_QUERY, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  });
  const [createInteraction] = useMutation(CREATE_INTERACTION_MUTATION);
  const [updateInteraction] = useMutation(UPDATE_INTERACTION_MUTATION);
  const [deleteInteraction] = useMutation(DELETE_INTERACTION_MUTATION);

  const items: Interaction[] = (data?.interactions ?? []) as any;

  const [sort, setSort] = React.useState<MomentSort>('recent');
  const [sortVisible, setSortVisible] = React.useState(false);
  const sorted = React.useMemo(() => sortMoments(items, sort), [items, sort]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<InteractionForm>(EMPTY_FORM);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  function openAdd() {
    setEditIdx(null);
    setInitial(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(idx: number) {
    setEditIdx(idx);
    setInitial(toForm(sorted[idx]));
    setModalVisible(true);
  }

  async function handleSave(form: InteractionForm) {
    if (editIdx !== null) {
      const item = sorted[editIdx];
      if (item?.id) {
        await updateInteraction({
          variables: {
            id: item.id,
            input: {
              summary: form.summary || undefined,
              date: form.date || undefined,
              channel: form.channel || undefined,
              location: form.location || undefined,
            },
          },
        });
      }
    } else {
      await createInteraction({
        variables: {
          input: {
            personId,
            summary: form.summary,
            date: form.date || undefined,
            channel: form.channel || undefined,
            location: form.location || undefined,
          },
        },
      });
    }
    refetch();
    setModalVisible(false);
  }

  async function handleConfirmDelete() {
    if (editIdx === null) return;
    const item = sorted[editIdx];
    if (!item?.id) return;
    setDeleting(true);
    try {
      await deleteInteraction({ variables: { id: item.id } });
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
        title="Moments"
        leading={<BackButton onPress={() => navigation.goBack()} />}
        trailing={<NavIconAction icon="plus" onPress={openAdd} accessibilityLabel="New moment" />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && items.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colorsLight.primary} />
          </View>
        ) : (
          <>
            <SectionLabel
              action={{ label: SORT_LABELS[sort], onPress: () => setSortVisible(true) }}
            >
              {`${items.length} ${items.length === 1 ? 'moment' : 'moments'}`}
            </SectionLabel>
            {items.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No moments logged yet.</Text>
                <Pressable onPress={openAdd} hitSlop={6} style={styles.emptyAdd}>
                  <Icon source="plus" size={16} color={colorsLight.primary} />
                  <Text style={styles.emptyAddLabel}>Add a moment</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.stack}>
                {sorted.map((m, idx) => (
                  <MomentCard key={m.id ?? `${m.summary}-${idx}`} item={m} onPress={() => openEdit(idx)} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <InteractionModal
        visible={modalVisible}
        titleText={editIdx !== null ? 'Edit moment' : 'New moment'}
        initial={initial}
        onDismiss={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={editIdx !== null ? () => setConfirmVisible(true) : undefined}
      />

      <ConfirmSheet
        visible={confirmVisible}
        title="Delete moment?"
        message={
          editIdx !== null && sorted[editIdx]
            ? `"${sorted[editIdx].summary}" will be removed. This can't be undone.`
            : undefined
        }
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
        title="Sort moments"
        onSelect={(v) => {
          setSort(v);
          setSortVisible(false);
        }}
        onDismiss={() => setSortVisible(false)}
      />
    </View>
  );
}

function MomentCard({ item, onPress }: { item: Interaction; onPress: () => void }) {
  const rel = formatRelativeShort(item.date);
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.channel} numberOfLines={1}>
          {(item.channel || 'note').toUpperCase()}
        </Text>
        {rel ? <Text style={styles.relTime}>{rel}</Text> : null}
      </View>
      <Text style={styles.summary}>{item.summary}</Text>
      {item.location ? (
        <View style={styles.locationRow}>
          <Icon source="map-marker-outline" size={13} color={colorsLight.textMuted} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      ) : null}
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
  stack: {
    marginHorizontal: 16,
    gap: 8,
  },
  card: {
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  channel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.6,
    color: colorsLight.primary,
    flex: 1,
    marginRight: 8,
    includeFontPadding: false,
  },
  relTime: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textFaint,
    includeFontPadding: false,
  },
  summary: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
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
