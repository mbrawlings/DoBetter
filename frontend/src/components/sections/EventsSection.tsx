import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, IconButton, Button, Text, useTheme } from 'react-native-paper';
import TextModal from '../modals/TextModal';
import UpcomingEventModal, { UpcomingEventForm } from '../modals/UpcomingEventModal';
import { spacing } from '../../theme/theme';

type CurrentEventsProps = {
  currentEvents: string[];
  onAddCurrent: (text: string) => void;
  onEditCurrent?: (index: number, text: string) => void;
  onDeleteCurrent?: (index: number) => void;
};

type UpcomingEventsProps = {
  upcomingEvents: Array<{ title: string; date?: string; notes?: string }>;
  onAddUpcoming: (event: UpcomingEventForm) => void;
  onEditUpcoming?: (index: number, event: UpcomingEventForm) => void;
  onDeleteUpcoming?: (index: number) => void;
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

  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Current Events */}
      <Text style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
        Current Events
      </Text>
      {currentEvents.map((ce, idx) => (
        <Card
          key={`${ce}-${idx}`}
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Title
            title={ce}
            titleStyle={styles.cardTitle}
            right={() => (
              <View style={styles.actions}>
                {onEditCurrent && (
                  <IconButton
                    icon="pencil-outline"
                    size={20}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => { setEditCurrentIdx(idx); setCurrentInitial(ce); setCurrentVisible(true); }}
                  />
                )}
                {onDeleteCurrent && (
                  <IconButton
                    icon="trash-can-outline"
                    size={20}
                    iconColor={theme.colors.outline}
                    onPress={() => onDeleteCurrent(idx)}
                  />
                )}
              </View>
            )}
          />
        </Card>
      ))}
      <Button
        icon="plus"
        mode="text"
        textColor={theme.colors.primary}
        onPress={() => { setEditCurrentIdx(null); setCurrentInitial(''); setCurrentVisible(true); }}
        style={styles.addButton}
        compact
      >
        Add current event
      </Button>

      {/* Upcoming Events */}
      <Text style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant, marginTop: spacing.lg }]}>
        Upcoming Events
      </Text>
      {upcomingEvents.map((ue, idx) => (
        <Card
          key={`${ue.title}-${idx}`}
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Title
            title={ue.title}
            titleStyle={styles.cardTitle}
            subtitle={[ue.date, ue.notes].filter(Boolean).join(' \u2022 ')}
            subtitleStyle={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}
            right={() => (
              <View style={styles.actions}>
                {onEditUpcoming && (
                  <IconButton
                    icon="pencil-outline"
                    size={20}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => { setEditUpcomingIdx(idx); setUpcomingInitial({ title: ue.title, date: ue.date, notes: ue.notes }); setUpcomingVisible(true); }}
                  />
                )}
                {onDeleteUpcoming && (
                  <IconButton
                    icon="trash-can-outline"
                    size={20}
                    iconColor={theme.colors.outline}
                    onPress={() => onDeleteUpcoming(idx)}
                  />
                )}
              </View>
            )}
          />
        </Card>
      ))}
      <Button
        icon="plus"
        mode="text"
        textColor={theme.colors.primary}
        onPress={() => { setEditUpcomingIdx(null); setUpcomingInitial({ title: '', date: '', notes: '' }); setUpcomingVisible(true); }}
        style={styles.addButton}
        compact
      >
        Add upcoming event
      </Button>

      {/* Modals */}
      <TextModal
        visible={currentVisible}
        title={editCurrentIdx !== null ? 'Edit Current Event' : 'Add Current Event'}
        label="Event"
        initialValue={currentInitial}
        onDismiss={() => setCurrentVisible(false)}
        onSave={(value) => {
          if (editCurrentIdx !== null && onEditCurrent) {
            onEditCurrent(editCurrentIdx, value);
          } else {
            onAddCurrent(value);
          }
          setCurrentVisible(false);
        }}
      />

      <UpcomingEventModal
        visible={upcomingVisible}
        titleText={editUpcomingIdx !== null ? 'Edit Upcoming Event' : 'Add Upcoming Event'}
        initial={upcomingInitial}
        onDismiss={() => setUpcomingVisible(false)}
        onSave={(form) => {
          if (editUpcomingIdx !== null && onEditUpcoming) {
            onEditUpcoming(editUpcomingIdx, form);
          } else {
            onAddUpcoming(form);
          }
          setUpcomingVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: 12,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
});
