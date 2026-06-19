import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import FormModal from './FormModal';
import FieldGroup from '../ui/FieldGroup';
import FieldRow from '../ui/FieldRow';
import SectionLabel from '../ui/SectionLabel';
import ChipGroup from '../ui/ChipGroup';
import {
  GIFT_OCCASION_OPTIONS,
  GIFT_PRIORITY_OPTIONS,
  GIFT_STATUS_OPTIONS,
} from '../../constants/options';
import { colorsLight, fontFamily, radius } from '../../theme/theme';
import type { GiftIdeaFormData } from '../../types';

export type GiftIdeaForm = GiftIdeaFormData;

type Props = {
  visible: boolean;
  titleText: string;
  initial?: GiftIdeaForm;
  onDismiss: () => void;
  onSave: (form: GiftIdeaForm) => void | Promise<void>;
  onDelete?: () => void;
};

export default function GiftIdeaModal({ visible, titleText, initial, onDismiss, onSave, onDelete }: Props) {
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
      onDelete={onDelete}
      deleteLabel="Delete gift idea"
    >
      <FieldGroup>
        <FieldRow
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Required"
          required
        />
        <FieldRow
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          multiline
        />
      </FieldGroup>

      <SectionLabel>Occasion</SectionLabel>
      <View style={styles.chipsWrap}>
        <ChipGroup
          options={GIFT_OCCASION_OPTIONS as unknown as string[]}
          value={occasion}
          onSelect={(v) => setOccasion(occasion === v ? '' : v)}
        />
      </View>

      <SectionLabel>Status</SectionLabel>
      <View style={styles.chipsWrap}>
        <ChipGroup
          options={GIFT_STATUS_OPTIONS as unknown as string[]}
          value={status}
          onSelect={(v) => setStatus(status === v ? '' : v)}
        />
      </View>

      <SectionLabel>Priority</SectionLabel>
      <View style={styles.priorityRow}>
        {(GIFT_PRIORITY_OPTIONS as unknown as string[]).map((p) => {
          const selected = priority === p;
          return (
            <Pressable
              key={p}
              onPress={() => setPriority(selected ? '' : p)}
              style={[
                styles.priorityCell,
                selected ? styles.priorityCellSelected : styles.priorityCellDefault,
              ]}
            >
              <Text
                style={[
                  styles.priorityLabel,
                  { color: selected ? colorsLight.primaryFg : colorsLight.text },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  chipsWrap: {
    paddingHorizontal: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  priorityCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  priorityCellDefault: {
    backgroundColor: colorsLight.surface,
    borderColor: colorsLight.border,
  },
  priorityCellSelected: {
    backgroundColor: colorsLight.primary,
    borderColor: colorsLight.primary,
  },
  priorityLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    includeFontPadding: false,
  },
});
