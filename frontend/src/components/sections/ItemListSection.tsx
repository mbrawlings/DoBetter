import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, IconButton, Button, Text, useTheme } from 'react-native-paper';
import { spacing } from '../../theme/theme';

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
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
        {sectionTitle}
      </Text>
      {items.map((item, idx) => (
        <Card
          key={`${getTitle(item)}-${idx}`}
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Title
            title={getTitle(item)}
            titleStyle={styles.cardTitle}
            subtitle={getSubtitle(item)}
            subtitleStyle={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}
            right={() => (
              <View style={styles.actions}>
                {onEdit && (
                  <IconButton
                    icon="pencil-outline"
                    size={20}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => { setEditIdx(idx); setInitial(toForm(item)); setVisible(true); }}
                  />
                )}
                {onDelete && (
                  <IconButton
                    icon="trash-can-outline"
                    size={20}
                    iconColor={theme.colors.outline}
                    onPress={() => onDelete(idx)}
                  />
                )}
              </View>
            )}
          />
        </Card>
      ))}
      <Button
        icon="plus"
        mode="text"
        textColor={theme.colors.primary}
        onPress={() => { setEditIdx(null); setInitial(emptyForm); setVisible(true); }}
        style={styles.addButton}
        compact
      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: 12,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
});
