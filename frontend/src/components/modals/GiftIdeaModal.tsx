import * as React from 'react';
import { View } from 'react-native';
import { Portal, Modal, Text, Button, TextInput } from 'react-native-paper';
import SelectInput from '../inputs/SelectInput';
import { GIFT_OCCASION_OPTIONS, GIFT_STATUS_OPTIONS, GIFT_PRIORITY_OPTIONS } from '../../constants/options';

export type GiftIdeaForm = {
  title: string;
  notes?: string;
  occasion?: string;
  status?: string;
  priority?: string; // keep as string in form; parent can Number()
};

type Props = {
  visible: boolean;
  titleText: string;
  initial?: GiftIdeaForm;
  onDismiss: () => void;
  onSave: (form: GiftIdeaForm) => void;
};

export default function GiftIdeaModal({ visible, titleText, initial, onDismiss, onSave }: Props) {
  const [title, setTitle] = React.useState(initial?.title ?? '');
  const [notes, setNotes] = React.useState(initial?.notes ?? '');
  const [occasion, setOccasion] = React.useState(initial?.occasion ?? '');
  const [status, setStatus] = React.useState(initial?.status ?? '');
  const [priority, setPriority] = React.useState(initial?.priority ?? '');

  React.useEffect(() => {
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    setOccasion(initial?.occasion ?? '');
    setStatus(initial?.status ?? '');
    setPriority(initial?.priority ?? '');
  }, [initial, visible]);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>{titleText}</Text>
        <TextInput label="Title" value={title} onChangeText={setTitle} style={{ marginBottom: 8 }} />
        <TextInput label="Notes" value={notes} onChangeText={setNotes} style={{ marginBottom: 8 }} />
        <SelectInput label="Occasion" value={occasion} onChange={setOccasion} options={GIFT_OCCASION_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
        <SelectInput label="Status" value={status} onChange={setStatus} options={GIFT_STATUS_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
        <SelectInput label="Priority" value={priority} onChange={setPriority} options={GIFT_PRIORITY_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button onPress={onDismiss} style={{ marginRight: 8 }}>Cancel</Button>
          <Button mode="contained" onPress={() => onSave({ title, notes, occasion, status, priority })} disabled={!title.trim()}>Save</Button>
        </View>
      </Modal>
    </Portal>
  );
}


