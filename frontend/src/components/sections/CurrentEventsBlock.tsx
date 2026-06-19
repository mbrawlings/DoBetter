import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useMutation } from '@apollo/client';
import ItemCard from '../ui/ItemCard';
import SectionLabel from '../ui/SectionLabel';
import TextModal from '../modals/TextModal';
import ConfirmSheet from '../modals/ConfirmSheet';
import { UPDATE_PERSON_MUTATION } from '../../graphql/operations';
import { personToInput } from '../../utils/person';
import { colorsLight, fontFamily } from '../../theme/theme';

type Props = {
  personId: string;
  person: any;
  currentEvents: string[];
  onChanged: () => void;
};

export default function CurrentEventsBlock({ personId, person, currentEvents, onChanged }: Props) {
  const [updatePerson] = useMutation(UPDATE_PERSON_MUTATION);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initialValue, setInitialValue] = React.useState('');
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function persist(next: string[]) {
    await updatePerson({
      variables: { id: personId, input: { ...personToInput(person), currentEvents: next } },
    });
    onChanged();
  }

  function openAdd() {
    setEditIdx(null);
    setInitialValue('');
    setModalVisible(true);
  }

  function openEdit(idx: number) {
    setEditIdx(idx);
    setInitialValue(currentEvents[idx] ?? '');
    setModalVisible(true);
  }

  async function handleSave(value: string) {
    if (editIdx !== null) {
      const next = [...currentEvents];
      next[editIdx] = value;
      await persist(next);
    } else {
      await persist([...currentEvents, value]);
    }
    setModalVisible(false);
  }

  async function handleConfirmDelete() {
    if (editIdx === null) return;
    setDeleting(true);
    try {
      await persist(currentEvents.filter((_, i) => i !== editIdx));
      setConfirmVisible(false);
      setModalVisible(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View>
      <SectionLabel action={{ label: '+ Add', onPress: openAdd }}>What's going on</SectionLabel>
      <View style={styles.stack}>
        {currentEvents.map((ce, idx) => (
          <ItemCard
            key={`${ce}-${idx}`}
            leadingDot
            trailing="pencil"
            onPress={() => openEdit(idx)}
          >
            <Text style={styles.bodyText}>{ce}</Text>
          </ItemCard>
        ))}
      </View>

      <TextModal
        visible={modalVisible}
        title={editIdx !== null ? 'Edit current event' : 'New current event'}
        label="Event"
        initialValue={initialValue}
        onDismiss={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={editIdx !== null ? () => setConfirmVisible(true) : undefined}
        deleteLabel="Delete event"
      />

      <ConfirmSheet
        visible={confirmVisible}
        title="Delete event?"
        message={
          editIdx !== null && currentEvents[editIdx]
            ? `"${currentEvents[editIdx]}" will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginHorizontal: 16,
    gap: 8,
  },
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
});
