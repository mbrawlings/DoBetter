import * as React from 'react';
import { View } from 'react-native';
import { List, Card, IconButton, Button } from 'react-native-paper';

type ModalProps<F> = {
  visible: boolean;
  titleText: string;
  initial?: F;
  onDismiss: () => void;
  onSave: (form: F) => void;
};

type Props<T, F> = {
  sectionTitle: string;
  addLabel: string;
  items: T[];
  getTitle: (item: T) => string;
  getSubtitle: (item: T) => string;
  toForm: (item: T) => F;
  emptyForm: F;
  renderModal: (props: ModalProps<F>) => React.ReactNode;
  onAdd: (form: F) => void;
  onEdit?: (index: number, form: F) => void;
  onDelete?: (index: number) => void;
};

export default function ItemListSection<T, F>({
  sectionTitle,
  addLabel,
  items,
  getTitle,
  getSubtitle,
  toForm,
  emptyForm,
  renderModal,
  onAdd,
  onEdit,
  onDelete,
}: Props<T, F>) {
  const [visible, setVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<F>(emptyForm);

  return (
    <List.Section>
      <List.Subheader>{sectionTitle}</List.Subheader>
      {items.map((item, idx) => (
        <Card key={`${getTitle(item)}-${idx}`} style={{ marginBottom: 8 }}>
          <Card.Title
            title={getTitle(item)}
            subtitle={getSubtitle(item)}
            right={() => (
              <View style={{ flexDirection: 'row' }}>
                {onEdit && (
                  <IconButton
                    icon="pencil"
                    onPress={() => { setEditIdx(idx); setInitial(toForm(item)); setVisible(true); }}
                  />
                )}
                {onDelete && (
                  <IconButton icon="delete" onPress={() => onDelete(idx)} />
                )}
              </View>
            )}
          />
        </Card>
      ))}
      <Button onPress={() => { setEditIdx(null); setInitial(emptyForm); setVisible(true); }}>
        {addLabel}
      </Button>

      {renderModal({
        visible,
        titleText: editIdx !== null ? `Edit ${sectionTitle.replace(/s$/, '')}` : `Add ${sectionTitle.replace(/s$/, '')}`,
        initial,
        onDismiss: () => setVisible(false),
        onSave: (form: F) => {
          if (editIdx !== null && onEdit) {
            onEdit(editIdx, form);
          } else {
            onAdd(form);
          }
          setVisible(false);
        },
      })}
    </List.Section>
  );
}
