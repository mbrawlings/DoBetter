import * as React from 'react';
import { View } from 'react-native';
import { List, Card, IconButton, Button } from 'react-native-paper';
import GiftIdeaModal, { GiftIdeaForm } from '../modals/GiftIdeaModal';

type GiftIdea = { title: string; notes?: string; occasion?: string; status?: string; priority?: number };

type Props = {
  showHeader?: boolean;
  items: GiftIdea[];
  onAdd: (form: GiftIdeaForm) => void;
  onEdit?: (index: number, form: GiftIdeaForm) => void;
  onDelete?: (index: number) => void;
};

export default function GiftIdeasSection({ showHeader = true, items, onAdd, onEdit, onDelete }: Props) {
  const [visible, setVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<GiftIdeaForm | undefined>(undefined);

  return (
    <List.Section>
      {showHeader && <List.Subheader>Gift Ideas</List.Subheader>}
      {items.map((gi, idx) => (
        <Card key={`${gi.title}-${idx}`} style={{ marginBottom: 8 }}>
          <Card.Title
            title={gi.title}
            subtitle={[gi.notes, gi.occasion, gi.status, gi.priority ? `priority ${gi.priority}` : undefined].filter(Boolean).join(' • ')}
            right={() => (
              <View style={{ flexDirection: 'row' }}>
                {onEdit && (
                  <IconButton icon="pencil" onPress={() => { setEditIdx(idx); setInitial({ title: gi.title, notes: gi.notes || '', occasion: gi.occasion || '', status: gi.status || '', priority: gi.priority ? String(gi.priority) : '' }); setVisible(true); }} />
                )}
                {onDelete && (
                  <IconButton icon="delete" onPress={() => onDelete(idx)} />
                )}
              </View>
            )}
          />
        </Card>
      ))}
      <Button onPress={() => { setEditIdx(null); setInitial({ title: '', notes: '', occasion: '', status: '', priority: '' }); setVisible(true); }}>Add gift idea</Button>

      <GiftIdeaModal
        visible={visible}
        titleText={editIdx !== null ? 'Edit Gift Idea' : 'Add Gift Idea'}
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



