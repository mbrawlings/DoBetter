import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import ItemCard from '../ui/ItemCard';
import SectionLabel from '../ui/SectionLabel';
import { colorsLight, fontFamily } from '../../theme/theme';

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
}: Props<T, F>) {
  const [visible, setVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<F>(emptyForm);

  return (
    <View>
      <SectionLabel>{`${sectionTitle} · ${items.length}`}</SectionLabel>
      <View style={styles.stack}>
        {items.map((item, idx) => (
          <ItemCard
            key={`${getTitle(item)}-${idx}`}
            title={getTitle(item)}
            subtitle={getSubtitle(item) || undefined}
            trailing="chevron"
            onPress={() => {
              if (!onEdit) return;
              setEditIdx(idx);
              setInitial(toForm(item));
              setVisible(true);
            }}
          />
        ))}
        <Pressable
          onPress={() => {
            setEditIdx(null);
            setInitial(emptyForm);
            setVisible(true);
          }}
          hitSlop={6}
          style={styles.addLink}
        >
          <Icon source="plus" size={16} color={colorsLight.primary} />
          <Text style={styles.addLinkLabel}>{addLabel}</Text>
        </Pressable>
      </View>

      {renderModal({
        visible,
        titleText:
          editIdx !== null
            ? `Edit ${sectionTitle.replace(/s$/, '')}`
            : `New ${sectionTitle.replace(/s$/, '')}`,
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
  stack: {
    marginHorizontal: 16,
    gap: 8,
  },
  addLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  addLinkLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
});
