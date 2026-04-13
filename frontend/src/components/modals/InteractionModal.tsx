import * as React from 'react';
import { TextInput } from 'react-native-paper';
import SelectInput from '../inputs/SelectInput';
import DateInput from '../inputs/DateInput';
import FormModal from './FormModal';
import { INTERACTION_CHANNEL_OPTIONS } from '../../constants/options';
import type { InteractionFormData } from '../../types';

export type InteractionForm = InteractionFormData;

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
    <FormModal
      visible={visible}
      title={titleText}
      onDismiss={onDismiss}
      onSave={() => onSave({ summary, date, channel, location })}
      saveDisabled={!summary.trim()}
    >
      <TextInput label="Summary" value={summary} onChangeText={setSummary} style={{ marginBottom: 8 }} />
      <DateInput label="Date" value={date} onChange={(v) => setDate(v)} style={{ marginBottom: 8 }} />
      <SelectInput label="Channel" value={channel} onChange={setChannel} options={INTERACTION_CHANNEL_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
      <TextInput label="Location" value={location} onChangeText={setLocation} style={{ marginBottom: 8 }} />
    </FormModal>
  );
}
