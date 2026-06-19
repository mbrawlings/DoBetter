import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius } from '../../theme/theme';

type Props = {
  icon: string;
  label: string;
  tinted?: boolean;
};

export default function KeyFactChip({ icon, label, tinted = false }: Props) {
  const fg = tinted ? colorsLight.primary : colorsLight.text;
  return (
    <View
      style={[
        styles.chip,
        tinted ? styles.chipTinted : styles.chipDefault,
      ]}
    >
      <Icon source={icon} size={14} color={fg} />
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: colorsLight.surface,
    borderColor: colorsLight.border,
  },
  chipTinted: {
    backgroundColor: colorsLight.primarySoft,
    borderColor: colorsLight.primarySoft,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    includeFontPadding: false,
  },
});
