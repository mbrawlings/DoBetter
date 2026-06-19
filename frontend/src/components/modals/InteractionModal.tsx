import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import FormModal from './FormModal';
import FieldGroup from '../ui/FieldGroup';
import FieldRow from '../ui/FieldRow';
import SectionLabel from '../ui/SectionLabel';
import ChipGroup from '../ui/ChipGroup';
import DateInput from '../inputs/DateInput';
import { INTERACTION_CHANNEL_OPTIONS } from '../../constants/options';
import type { InteractionFormData } from '../../types';

export type InteractionForm = InteractionFormData;

type Props = {
  visible: boolean;
  titleText: string;
  initial?: InteractionForm;
  onDismiss: () => void;
  onSave: (form: InteractionForm) => void | Promise<void>;
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
      <FieldGroup>
        <FieldRow
          label="Summary"
          value={summary}
          onChangeText={setSummary}
          placeholder="Required"
          required
          multiline
        />
        <DateInput label="Date" value={date} onChange={(v) => setDate(v)} />
        <FieldRow
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Optional"
        />
      </FieldGroup>

      <SectionLabel>Channel</SectionLabel>
      <View style={styles.chipsWrap}>
        <ChipGroup
          options={INTERACTION_CHANNEL_OPTIONS as unknown as string[]}
          value={channel}
          onSelect={(v) => setChannel(channel === v ? '' : v)}
        />
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  chipsWrap: {
    paddingHorizontal: 16,
  },
});
