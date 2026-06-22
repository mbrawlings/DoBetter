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
import CurrentEventsBlock from '../components/sections/CurrentEventsBlock';
import UpcomingEventModal, { UpcomingEventForm } from '../components/modals/UpcomingEventModal';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import SortSheet, { SortOption } from '../components/modals/SortSheet';
import { GET_PERSON_QUERY, UPDATE_PERSON_MUTATION } from '../graphql/operations';
import { personToInput } from '../utils/person';
import { formatEventCountdown, formatEventWhen } from '../utils/date';
import { colorsLight, fontFamily, radius, shadows } from '../theme/theme';
import { usePersistedState } from '../hooks/usePersistedState';
import type { UpcomingEvent } from '../types';

type EventSort = 'soonest' | 'latest';

const SORT_OPTIONS: SortOption<EventSort>[] = [
  { value: 'soonest', label: 'Soonest first' },
  { value: 'latest', label: 'Latest first' },
];

const SORT_LABELS: Record<EventSort, string> = {
  soonest: 'By date',
  latest: 'By date',
};

function eventTime(e: UpcomingEvent): number {
  const iso = e.startsAt || e.date;
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

export default function EventsScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId: string = route.params?.id;

  const { data, loading, refetch } = useQuery(GET_PERSON_QUERY, {
    variables: { id: personId },
    fetchPolicy: 'cache-and-network',
  });
  const [updatePerson] = useMutation(UPDATE_PERSON_MUTATION);

  const person = data?.person;
  const currentEvents: string[] = person?.currentEvents ?? [];
  const upcoming: UpcomingEvent[] = person?.upcomingEvents ?? [];

  const [sort, setSort] = usePersistedState<EventSort>('dobetter.pref.events.sort', 'soonest', ['soonest', 'latest']);
  const [sortVisible, setSortVisible] = React.useState(false);

  const sortedUpcoming = React.useMemo(() => {
    const indexed = upcoming.map((event, originalIndex) => ({ event, originalIndex }));
    indexed.sort((a, b) => {
      const diff = eventTime(a.event) - eventTime(b.event);
      return sort === 'soonest' ? diff : -diff;
    });
    return indexed;
  }, [upcoming, sort]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<UpcomingEventForm | undefined>(undefined);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function persistUpcoming(next: UpcomingEvent[]) {
    await updatePerson({
      variables: { id: personId, input: { ...personToInput(person), upcomingEvents: next } },
    });
    refetch();
  }

  function openAdd() {
    setEditIdx(null);
    setInitial({ title: '', date: '', notes: '' });
    setModalVisible(true);
  }

  function openEdit(originalIndex: number) {
    const e = upcoming[originalIndex];
    setEditIdx(originalIndex);
    setInitial({ title: e.title, date: e.date, startsAt: e.startsAt, notes: e.notes });
    setModalVisible(true);
  }

  async function handleSave(form: UpcomingEventForm) {
    const payload: UpcomingEvent = {
      title: form.title,
      date: form.date || undefined,
      startsAt: form.startsAt || undefined,
      notes: form.notes || undefined,
    };
    if (editIdx !== null) {
      const next = [...upcoming];
      next[editIdx] = payload;
      await persistUpcoming(next);
    } else {
      await persistUpcoming([...upcoming, payload]);
    }
    setModalVisible(false);
  }

  async function handleConfirmDelete() {
    if (editIdx === null) return;
    setDeleting(true);
    try {
      await persistUpcoming(upcoming.filter((_, i) => i !== editIdx));
      setConfirmVisible(false);
      setModalVisible(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <NavBar
        title="Events"
        leading={<BackButton onPress={() => navigation.goBack()} />}
        trailing={<NavIconAction icon="plus" onPress={openAdd} accessibilityLabel="New event" />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && !person ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colorsLight.primary} />
          </View>
        ) : (
          <>
            {person ? (
              <CurrentEventsBlock
                personId={personId}
                person={person}
                currentEvents={currentEvents}
                onChanged={refetch}
              />
            ) : null}

            <SectionLabel
              action={{ label: SORT_LABELS[sort], onPress: () => setSortVisible(true) }}
            >
              {`Upcoming · ${upcoming.length}`}
            </SectionLabel>
            {upcoming.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No upcoming events yet.</Text>
                <Pressable onPress={openAdd} hitSlop={6} style={styles.emptyAdd}>
                  <Icon source="plus" size={16} color={colorsLight.primary} />
                  <Text style={styles.emptyAddLabel}>Add an event</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.stack}>
                {sortedUpcoming.map(({ event, originalIndex }) => (
                  <EventCard
                    key={`${event.title}-${originalIndex}`}
                    event={event}
                    onPress={() => openEdit(originalIndex)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <UpcomingEventModal
        visible={modalVisible}
        titleText={editIdx !== null ? 'Edit event' : 'New event'}
        initial={initial}
        onDismiss={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={editIdx !== null ? () => setConfirmVisible(true) : undefined}
      />

      <ConfirmSheet
        visible={confirmVisible}
        title="Delete event?"
        message={
          editIdx !== null && upcoming[editIdx]
            ? `"${upcoming[editIdx].title}" will be removed. This can't be undone.`
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
        title="Sort events"
        onSelect={(v) => {
          setSort(v);
          setSortVisible(false);
        }}
        onDismiss={() => setSortVisible(false)}
      />
    </View>
  );
}

function EventCard({ event, onPress }: { event: UpcomingEvent; onPress: () => void }) {
  const countdown = formatEventCountdown(event);
  const subtitle = [formatEventWhen(event), event.notes].filter(Boolean).join(' · ');
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View
        style={[
          styles.iconBlock,
          { backgroundColor: countdown.soon ? colorsLight.primarySoft : colorsLight.raised },
        ]}
      >
        <Icon
          source="cake-variant-outline"
          size={20}
          color={countdown.soon ? colorsLight.primary : colorsLight.textMuted}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{event.title}</Text>
          {countdown.soon && countdown.label ? (
            <View style={styles.soonPill}>
              <Text style={styles.soonLabel}>{countdown.label}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
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
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  soonPill: {
    backgroundColor: colorsLight.primarySoft,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
  },
  soonLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 11,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
  empty: {
    paddingTop: 40,
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
