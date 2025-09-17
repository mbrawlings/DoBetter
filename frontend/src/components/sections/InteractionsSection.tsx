import * as React from 'react';
import { View } from 'react-native';
import { List, Card, IconButton, Button } from 'react-native-paper';
import InteractionModal, { InteractionForm } from '../modals/InteractionModal';

type Interaction = { summary: string; date?: string; channel?: string; location?: string };

type Props = {
  showHeader?: boolean;
  items: Interaction[];
  onAdd: (form: InteractionForm) => void;
  onEdit?: (index: number, form: InteractionForm) => void;
  onDelete?: (index: number) => void;
};

export default function InteractionsSection({ showHeader = true, items, onAdd, onEdit, onDelete }: Props) {
  const [visible, setVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<InteractionForm | undefined>(undefined);

  return (
    <List.Section>
      {showHeader && <List.Subheader>Interactions</List.Subheader>}
      {items.map((ix, idx) => (
        <Card key={`${ix.summary}-${idx}`} style={{ marginBottom: 8 }}>
          <Card.Title
            title={ix.summary}
            subtitle={[ix.date, ix.channel, ix.location].filter(Boolean).join(' • ')}
            right={() => (
              <View style={{ flexDirection: 'row' }}>
                {onEdit && (
                  <IconButton icon="pencil" onPress={() => { setEditIdx(idx); setInitial({ summary: ix.summary, date: ix.date || '', channel: ix.channel || '', location: ix.location || '' }); setVisible(true); }} />
                )}
                {onDelete && (
                  <IconButton icon="delete" onPress={() => onDelete(idx)} />
                )}
              </View>
            )}
          />
        </Card>
      ))}
      <Button onPress={() => { setEditIdx(null); setInitial({ summary: '', date: '', channel: '', location: '' }); setVisible(true); }}>Add interaction</Button>

      <InteractionModal
        visible={visible}
        titleText={editIdx !== null ? 'Edit Interaction' : 'Add Interaction'}
        initial={initial}
        onDismiss={() => setVisible(false)}
        onSave={(form) => {
          if (editIdx !== null && onEdit) {
            onEdit(editIdx, form);
          } else {
            onAdd(form);
          }
          setVisible(false);
        }}
      />
    </List.Section>
  );
}



