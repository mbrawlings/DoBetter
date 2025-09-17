import * as React from 'react';
import { View } from 'react-native';
import { List, Card, IconButton, Button, Text } from 'react-native-paper';
import TextModal from '../modals/TextModal';
import UpcomingEventModal, { UpcomingEventForm } from '../modals/UpcomingEventModal';

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

type Props = {
  showHeader?: boolean;
} & CurrentEventsProps & UpcomingEventsProps;

export default function EventsSection({ showHeader = true, currentEvents, upcomingEvents, onAddCurrent, onEditCurrent, onDeleteCurrent, onAddUpcoming, onEditUpcoming, onDeleteUpcoming }: Props) {
  const [currentVisible, setCurrentVisible] = React.useState(false);
  const [editCurrentIdx, setEditCurrentIdx] = React.useState<number | null>(null);
  const [currentInitial, setCurrentInitial] = React.useState('');

  const [upcomingVisible, setUpcomingVisible] = React.useState(false);
  const [editUpcomingIdx, setEditUpcomingIdx] = React.useState<number | null>(null);
  const [upcomingInitial, setUpcomingInitial] = React.useState<UpcomingEventForm | undefined>(undefined);

  return (
    <List.Section>
      {showHeader && <List.Subheader>Events</List.Subheader>}

      {/* Current Events */}
      <Button onPress={() => { setEditCurrentIdx(null); setCurrentInitial(''); setCurrentVisible(true); }}>Add current event</Button>
      {currentEvents.map((ce, idx) => (
        <Card key={`${ce}-${idx}`} style={{ marginBottom: 8 }}>
          <Card.Title title={ce} right={() => (
            <View style={{ flexDirection: 'row' }}>
              {onEditCurrent && (
                <IconButton icon="pencil" onPress={() => { setEditCurrentIdx(idx); setCurrentInitial(ce); setCurrentVisible(true); }} />
              )}
              {onDeleteCurrent && (
                <IconButton icon="delete" onPress={() => onDeleteCurrent(idx)} />
              )}
            </View>
          )} />
        </Card>
      ))}

      {/* Upcoming Events */}
      <Button onPress={() => { setEditUpcomingIdx(null); setUpcomingInitial({ title: '', date: '', notes: '' }); setUpcomingVisible(true); }}>Add upcoming event</Button>
      {upcomingEvents.map((ue, idx) => (
        <Card key={`${ue.title}-${idx}`} style={{ marginBottom: 8 }}>
          <Card.Title title={ue.title} subtitle={[ue.date, ue.notes].filter(Boolean).join(' • ')} right={() => (
            <View style={{ flexDirection: 'row' }}>
              {onEditUpcoming && (
                <IconButton icon="pencil" onPress={() => { setEditUpcomingIdx(idx); setUpcomingInitial({ title: ue.title, date: ue.date, notes: ue.notes }); setUpcomingVisible(true); }} />
              )}
              {onDeleteUpcoming && (
                <IconButton icon="delete" onPress={() => onDeleteUpcoming(idx)} />
              )}
            </View>
          )} />
        </Card>
      ))}

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
    </List.Section>
  );
}



