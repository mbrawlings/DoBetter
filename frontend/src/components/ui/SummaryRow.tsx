import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius, shadows } from '../../theme/theme';

type Props = {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  count?: number | string;
  preview?: string;
  trailing?: 'chevron' | 'plus';
  onPress?: () => void;
};

export default function SummaryRow({
  icon,
  iconBg,
  iconColor,
  title,
  count,
  preview,
  trailing = 'chevron',
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.iconBlock, { backgroundColor: iconBg }]}>
        <Icon source={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {count !== undefined && count !== '' ? (
            <Text style={styles.count}>{count}</Text>
          ) : null}
        </View>
        {preview ? (
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        ) : null}
      </View>
      <Icon
        source={trailing === 'plus' ? 'plus' : 'chevron-right'}
        size={trailing === 'plus' ? 18 : 18}
        color={trailing === 'plus' ? colorsLight.primary : colorsLight.textFaint}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  iconBlock: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  count: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 13,
    color: colorsLight.textFaint,
    includeFontPadding: false,
  },
  preview: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
});
