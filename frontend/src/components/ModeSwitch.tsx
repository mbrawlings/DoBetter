import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius } from '../theme/theme';

export const APP_MODES = ['people', 'maintenance'] as const;
export type AppMode = (typeof APP_MODES)[number];

const OPTIONS: { value: AppMode; label: string }[] = [
  { value: 'people', label: 'People' },
  { value: 'maintenance', label: 'Maintenance' },
];

type Props = {
  value: AppMode;
  onChange: (mode: AppMode) => void;
};

export default function ModeSwitch({ value, onChange }: Props) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected ? styles.segmentSelected : null]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colorsLight.raised,
    borderRadius: radius.pill,
    padding: 3,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  segmentSelected: {
    backgroundColor: colorsLight.surface,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.textMuted,
    includeFontPadding: false,
  },
  labelSelected: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    color: colorsLight.text,
  },
});
