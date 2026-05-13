import * as React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius } from '../../theme/theme';

export type ChipOption = { value: string; label?: string };

type Props = {
  options: ReadonlyArray<string | ChipOption>;
  value?: string;
  values?: string[];
  onSelect?: (value: string) => void;
  onToggle?: (value: string) => void;
  onRemove?: (value: string) => void;
  addPlaceholder?: { label: string; onPress?: () => void };
  style?: ViewStyle;
};

function normalize(options: ReadonlyArray<string | ChipOption>): ChipOption[] {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value }));
}

export default function ChipGroup({
  options,
  value,
  values,
  onSelect,
  onToggle,
  onRemove,
  addPlaceholder,
  style,
}: Props) {
  const items = normalize(options);
  return (
    <View style={[styles.row, style]}>
      {items.map((opt) => {
        const selected = values ? values.includes(opt.value) : value === opt.value;
        const removable = Boolean(onRemove);
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (onSelect) onSelect(opt.value);
              if (onToggle) onToggle(opt.value);
            }}
            style={[
              styles.chip,
              selected ? styles.chipSelected : styles.chipDefault,
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colorsLight.primaryFg : colorsLight.text },
              ]}
            >
              {opt.label}
            </Text>
            {removable ? (
              <Pressable hitSlop={8} onPress={() => onRemove?.(opt.value)}>
                <Icon source="close" size={14} color={selected ? colorsLight.primaryFg : colorsLight.textMuted} />
              </Pressable>
            ) : null}
          </Pressable>
        );
      })}
      {addPlaceholder ? (
        <Pressable onPress={addPlaceholder.onPress} style={[styles.chip, styles.chipAdd]}>
          <Text style={[styles.label, { color: colorsLight.textFaint }]}>+ {addPlaceholder.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: colorsLight.surface,
    borderColor: colorsLight.border,
  },
  chipSelected: {
    backgroundColor: colorsLight.primary,
    borderColor: colorsLight.primary,
  },
  chipAdd: {
    backgroundColor: 'transparent',
    borderColor: colorsLight.borderStrong,
    borderStyle: 'dashed',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    includeFontPadding: false,
  },
});
