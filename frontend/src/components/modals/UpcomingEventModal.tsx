import * as React from 'react';
import { TextInput } from 'react-native-paper';
import DateInput from '../inputs/DateInput';
import FormModal from './FormModal';
import type { UpcomingEventFormData } from '../../types';

export type UpcomingEventForm = UpcomingEventFormData;

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
    <FormModal
      visible={visible}
      title={titleText}
      onDismiss={onDismiss}
      onSave={() => onSave({ title, date, notes })}
      saveDisabled={!title.trim()}
    >
      <TextInput label="Title" value={title} onChangeText={setTitle} style={{ marginBottom: 8 }} />
      <DateInput label="Date" value={date} onChange={(v) => setDate(v)} style={{ marginBottom: 8 }} />
      <TextInput label="Notes" value={notes} onChangeText={setNotes} style={{ marginBottom: 8 }} />
    </FormModal>
  );
}
