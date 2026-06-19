import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import TextModal from '../modals/TextModal';
import UpcomingEventModal, { UpcomingEventForm } from '../modals/UpcomingEventModal';
import ItemCard from '../ui/ItemCard';
import SectionLabel from '../ui/SectionLabel';
import { colorsLight, fontFamily } from '../../theme/theme';
import { formatEventWhen } from '../../utils/date';

type CurrentEventsProps = {
  currentEvents: string[];
  onAddCurrent: (text: string) => void | Promise<void>;
  onEditCurrent?: (index: number, text: string) => void | Promise<void>;
  onDeleteCurrent?: (index: number) => void | Promise<void>;
};

type UpcomingEventsProps = {
  upcomingEvents: Array<{ title: string; date?: string; startsAt?: string; notes?: string }>;
  onAddUpcoming: (event: UpcomingEventForm) => void | Promise<void>;
  onEditUpcoming?: (index: number, event: UpcomingEventForm) => void | Promise<void>;
  onDeleteUpcoming?: (index: number) => void | Promise<void>;
};

type Props = CurrentEventsProps & UpcomingEventsProps;

export default function EventsSection({
  currentEvents,
  upcomingEvents,
  onAddCurrent,
  onEditCurrent,
  onDeleteCurrent,
  onAddUpcoming,
  onEditUpcoming,
  onDeleteUpcoming,
}: Props) {
  const [currentVisible, setCurrentVisible] = React.useState(false);
  const [editCurrentIdx, setEditCurrentIdx] = React.useState<number | null>(null);
  const [currentInitial, setCurrentInitial] = React.useState('');

  const [upcomingVisible, setUpcomingVisible] = React.useState(false);
  const [editUpcomingIdx, setEditUpcomingIdx] = React.useState<number | null>(null);
  const [upcomingInitial, setUpcomingInitial] = React.useState<UpcomingEventForm | undefined>(undefined);

  return (
    <View>
      <SectionLabel>What's going on</SectionLabel>
      <View style={styles.stack}>
        {currentEvents.map((ce, idx) => (
          <ItemCard
            key={`${ce}-${idx}`}
            leadingDot
            trailing="pencil"
            onPress={() => {
              if (!onEditCurrent) return;
              setEditCurrentIdx(idx);
              setCurrentInitial(ce);
              setCurrentVisible(true);
            }}
          >
            <Text style={styles.bodyText}>{ce}</Text>
          </ItemCard>
        ))}
        <AddLink
          label="Add current event"
          onPress={() => {
            setEditCurrentIdx(null);
            setCurrentInitial('');
            setCurrentVisible(true);
          }}
        />
      </View>

      <SectionLabel>Upcoming</SectionLabel>
      <View style={styles.stack}>
        {upcomingEvents.map((ue, idx) => {
          const subtitle = [formatEventWhen(ue), ue.notes].filter(Boolean).join(' · ');
          return (
            <ItemCard
              key={`${ue.title}-${idx}`}
              title={ue.title}
              subtitle={subtitle || undefined}
              iconBlock={{ icon: 'cake-variant-outline' }}
              trailing="chevron"
              onPress={() => {
                if (!onEditUpcoming) return;
                setEditUpcomingIdx(idx);
                setUpcomingInitial({ title: ue.title, date: ue.date, startsAt: ue.startsAt, notes: ue.notes });
                setUpcomingVisible(true);
              }}
            />
          );
        })}
        <AddLink
          label="Add upcoming event"
          onPress={() => {
            setEditUpcomingIdx(null);
            setUpcomingInitial({ title: '', date: '', notes: '' });
            setUpcomingVisible(true);
          }}
        />
      </View>

      <TextModal
        visible={currentVisible}
        title={editCurrentIdx !== null ? 'Edit current event' : 'New current event'}
        label="Event"
        initialValue={currentInitial}
        onDismiss={() => setCurrentVisible(false)}
        onSave={async (value) => {
          if (editCurrentIdx !== null && onEditCurrent) {
            await onEditCurrent(editCurrentIdx, value);
          } else {
            await onAddCurrent(value);
          }
          setCurrentVisible(false);
        }}
      />

      <UpcomingEventModal
        visible={upcomingVisible}
        titleText={editUpcomingIdx !== null ? 'Edit upcoming event' : 'New upcoming event'}
        initial={upcomingInitial}
        onDismiss={() => setUpcomingVisible(false)}
        onSave={async (form) => {
          if (editUpcomingIdx !== null && onEditUpcoming) {
            await onEditUpcoming(editUpcomingIdx, form);
          } else {
            await onAddUpcoming(form);
          }
          setUpcomingVisible(false);
        }}
      />
    </View>
  );
}

function AddLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={styles.addLink}>
      <Icon source="plus" size={16} color={colorsLight.primary} />
      <Text style={styles.addLinkLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginHorizontal: 16,
    gap: 8,
  },
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  addLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  addLinkLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
});
