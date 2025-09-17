import * as React from 'react';
import { View } from 'react-native';
import { Portal, Modal, Text, Button, TextInput } from 'react-native-paper';
import DateInput from '../inputs/DateInput';

export type UpcomingEventForm = {
  title: string;
  date?: string;
  notes?: string;
};

type Props = {
  visible: boolean;
  titleText: string;
  initial?: UpcomingEventForm;
  onDismiss: () => void;
  onSave: (form: UpcomingEventForm) => void;
};

export default function UpcomingEventModal({ visible, titleText, initial, onDismiss, onSave }: Props) {
  const [title, setTitle] = React.useState(initial?.title ?? '');
  const [date, setDate] = React.useState(initial?.date ?? '');
  const [notes, setNotes] = React.useState(initial?.notes ?? '');

  React.useEffect(() => {
    setTitle(initial?.title ?? '');
    setDate(initial?.date ?? '');
    setNotes(initial?.notes ?? '');
  }, [initial, visible]);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>{titleText}</Text>
        <TextInput label="Title" value={title} onChangeText={setTitle} style={{ marginBottom: 8 }} />
        <DateInput label="Date" value={date} onChange={(v) => setDate(v)} style={{ marginBottom: 8 }} />
        <TextInput label="Notes" value={notes} onChangeText={setNotes} style={{ marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button onPress={onDismiss} style={{ marginRight: 8 }}>Cancel</Button>
          <Button mode="contained" onPress={() => onSave({ title, date, notes })} disabled={!title.trim()}>Save</Button>
        </View>
      </Modal>
    </Portal>
  );
}


