import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import InteractionModal, { InteractionForm } from '../modals/InteractionModal';
import SectionLabel from '../ui/SectionLabel';
import { colorsLight, fontFamily, radius, shadows } from '../../theme/theme';
import { formatHumanDate } from '../inputs/DateInput';
import type { Interaction } from '../../types';

export type { InteractionForm };

type Props = {
  items: Interaction[];
  onAdd: (form: InteractionForm) => void | Promise<void>;
  onEdit?: (index: number, form: InteractionForm) => void | Promise<void>;
  onDelete?: (index: number) => void | Promise<void>;
};

const EMPTY_FORM: InteractionForm = { summary: '', date: '', channel: '', location: '' };

function toForm(item: Interaction): InteractionForm {
  return {
    summary: item.summary,
    date: item.date || '',
    channel: item.channel || '',
    location: item.location || '',
  };
}

export default function InteractionsSection({ items, onAdd, onEdit }: Props) {
  const [visible, setVisible] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [initial, setInitial] = React.useState<InteractionForm>(EMPTY_FORM);

  return (
    <View>
      <SectionLabel>{`Recent moments · ${items.length}`}</SectionLabel>
      <View style={styles.stack}>
        {items.map((it, idx) => {
          const headLeft = [it.channel, formatHumanDate(it.date ?? '')]
            .filter(Boolean)
            .join(' · ');
          const editable = Boolean(onEdit);
          return (
            <Pressable
              key={`${it.summary}-${idx}`}
              onPress={() => {
                if (!editable) return;
                setEditIdx(idx);
                setInitial(toForm(it));
                setVisible(true);
              }}
              style={styles.card}
            >
              <View style={styles.headRow}>
                <Text style={styles.headText} numberOfLines={1}>
                  {headLeft || ' '}
                </Text>
                {editable ? (
                  <Icon source="pencil-outline" size={14} color={colorsLight.textFaint} />
                ) : null}
              </View>
              <Text style={styles.body}>{it.summary}</Text>
              {it.location ? (
                <Text style={styles.location}>{it.location}</Text>
              ) : null}
            </Pressable>
          );
        })}
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
          <Text style={styles.addLinkLabel}>Add moment</Text>
        </Pressable>
      </View>

      <InteractionModal
        visible={visible}
        titleText={editIdx !== null ? 'Edit moment' : 'New moment'}
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
  card: {
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headText: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    textTransform: 'capitalize',
    flex: 1,
    marginRight: 8,
    includeFontPadding: false,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  location: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 4,
    includeFontPadding: false,
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
