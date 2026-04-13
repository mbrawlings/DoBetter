import * as React from 'react';
import { TextInput } from 'react-native-paper';
import SelectInput from '../inputs/SelectInput';
import FormModal from './FormModal';
import { GIFT_OCCASION_OPTIONS, GIFT_STATUS_OPTIONS, GIFT_PRIORITY_OPTIONS } from '../../constants/options';
import type { GiftIdeaFormData } from '../../types';

export type GiftIdeaForm = GiftIdeaFormData;

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
    <FormModal
      visible={visible}
      title={titleText}
      onDismiss={onDismiss}
      onSave={() => onSave({ title, notes, occasion, status, priority })}
      saveDisabled={!title.trim()}
    >
      <TextInput label="Title" value={title} onChangeText={setTitle} style={{ marginBottom: 8 }} />
      <TextInput label="Notes" value={notes} onChangeText={setNotes} style={{ marginBottom: 8 }} />
      <SelectInput label="Occasion" value={occasion} onChange={setOccasion} options={GIFT_OCCASION_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
      <SelectInput label="Status" value={status} onChange={setStatus} options={GIFT_STATUS_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
      <SelectInput label="Priority" value={priority} onChange={setPriority} options={GIFT_PRIORITY_OPTIONS as unknown as string[]} style={{ marginBottom: 8 }} />
    </FormModal>
  );
}
