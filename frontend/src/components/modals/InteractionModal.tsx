import * as React from 'react';
import { View } from 'react-native';
import { Portal, Modal, Text, Button, TextInput } from 'react-native-paper';
import SelectInput from '../inputs/SelectInput';
import DateInput from '../inputs/DateInput';
import { INTERACTION_CHANNEL_OPTIONS } from '../../constants/options';

export type InteractionForm = {
  summary: string;
  date?: string;
  channel?: string;
  location?: string;
};

type Props = {
  visible: boolean;
  titleText: string;
  initial?: InteractionForm;
  onDismiss: () => void;
  onSave: (form: InteractionForm) => void;
};

export default function InteractionModal({ visible, titleText, initial, onDismiss, onSave }: Props) {
  const [summary, setSummary] = React.useState(initial?.summary ?? '');
  const [date, setDate] = React.useState(initial?.date ?? '');
  const [channel, setChannel] = React.useState(initial?.channel ?? '');
  const [location, setLocation] = React.useState(initial?.location ?? '');

  React.useEffect(() => {
    setSummary(initial?.summary ?? '');
    setDate(initial?.date ?? '');
    setChannel(initial?.channel ?? '');
    setLocation(initial?.location ?? '');
  }, [initial, visible]);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>{titleText}</Text>
        <TextInput label="Summary" value={summary} onChangeText={setSummary} style={{ marginBottom: 8 }} />
        <DateInput label="Date" value={date} onChange={(v) => setDate(v)} style={{ marginBottom: 8 }} />
        <SelectInput label="Channel" value={channel} onChange={setChannel} options={INTERACTION_CHANNEL_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
        <TextInput label="Location" value={location} onChangeText={setLocation} style={{ marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button onPress={onDismiss} style={{ marginRight: 8 }}>Cancel</Button>
          <Button mode="contained" onPress={() => onSave({ summary, date, channel, location })} disabled={!summary.trim()}>Save</Button>
        </View>
      </Modal>
    </Portal>
  );
}


