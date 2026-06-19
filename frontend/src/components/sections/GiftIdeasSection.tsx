import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import GiftIdeaModal, { GiftIdeaForm } from '../modals/GiftIdeaModal';
import ItemCard from '../ui/ItemCard';
import SectionLabel from '../ui/SectionLabel';
import { colorsLight, fontFamily } from '../../theme/theme';
import type { GiftIdea } from '../../types';

export type { GiftIdeaForm };

type Props = {
  items: GiftIdea[];
  onAdd: (form: GiftIdeaForm) => void | Promise<void>;
  onEdit?: (index: number, form: GiftIdeaForm) => void | Promise<void>;
  onDelete?: (index: number) => void | Promise<void>;
};

const EMPTY_FORM: GiftIdeaForm = { title: '', notes: '', occasion: '', status: '', priority: '' };

function toForm(item: GiftIdea): GiftIdeaForm {
  return {
    title: item.title,
    notes: item.notes || '',
    occasion: item.occasion || '',
    status: item.status || '',
    priority: item.priority ? String(item.priority) : '',
  };
}

function buildSubtitle(item: GiftIdea): string {
  const bits = [item.occasion, item.status, item.priority ? `P${item.priority}` : undefined];
  return bits.filter(Boolean).join(' · ');
}

export default function GiftIdeasSection({ items, onAdd, onEdit, onDelete }: Props) {
  const [visible, setVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<GiftIdeaForm>(EMPTY_FORM);

  return (
    <View>
      <SectionLabel>{`Gift ideas · ${items.length}`}</SectionLabel>
      <View style={styles.stack}>
        {items.map((g, idx) => (
          <ItemCard
            key={`${g.title}-${idx}`}
            title={g.title}
            subtitle={buildSubtitle(g) || g.notes || undefined}
            iconBlock={{
              icon: 'gift-outline',
              bg: colorsLight.giftIconBg,
              color: colorsLight.giftIconFg,
            }}
            trailing="chevron"
            onPress={() => {
              if (!onEdit) return;
              setEditIdx(idx);
              setInitial(toForm(g));
              setVisible(true);
            }}
          />
        ))}
        <Pressable
          onPress={() => {
            setEditIdx(null);
            setInitial(EMPTY_FORM);
            setVisible(true);
          }}
          hitSlop={6}
          style={styles.addLink}
        >
          <Icon source="plus" size={16} color={colorsLight.primary} />
          <Text style={styles.addLinkLabel}>Add gift idea</Text>
        </Pressable>
      </View>

      <GiftIdeaModal
        visible={visible}
        titleText={editIdx !== null ? 'Edit gift idea' : 'New gift idea'}
        initial={initial}
        onDismiss={() => setVisible(false)}
        onSave={async (form) => {
          if (editIdx !== null && onEdit) {
            await onEdit(editIdx, form);
          } else {
            await onAdd(form);
          }
          setVisible(false);
        }}
      />
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
