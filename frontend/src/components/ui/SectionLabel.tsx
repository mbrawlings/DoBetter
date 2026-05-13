import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colorsLight, fontFamily } from '../../theme/theme';

type Props = {
  children: React.ReactNode;
  action?: { label: string; onPress?: () => void };
};

export default function SectionLabel({ children, action }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{String(children).toUpperCase()}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text style={styles.action}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colorsLight.textMuted,
    includeFontPadding: false,
  },
  action: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
});
