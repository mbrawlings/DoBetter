import * as React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius, shadows } from '../../theme/theme';

type IconBlock = {
  icon: string;
  bg?: string;
  color?: string;
  size?: number;
};

type Props = {
  title?: string;
  subtitle?: string;
  iconBlock?: IconBlock;
  leadingDot?: boolean;
  trailing?: 'chevron' | 'pencil' | 'none';
  onPress?: () => void;
  onTrailingPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export default function ItemCard({
  title,
  subtitle,
  iconBlock,
  leadingDot,
  trailing = 'chevron',
  onPress,
  onTrailingPress,
  children,
  style,
}: Props) {
  const Wrapper: React.ComponentType<any> = onPress ? Pressable : View;
  const wrapperProps = onPress ? { onPress } : {};

  return (
    <Wrapper {...wrapperProps} style={[styles.card, style]}>
      {leadingDot ? <View style={styles.dot} /> : null}
      {iconBlock ? (
        <View
          style={[
            styles.iconBlock,
            { backgroundColor: iconBlock.bg ?? colorsLight.primarySoft },
          ]}
        >
          <Icon
            source={iconBlock.icon}
            size={iconBlock.size ?? 20}
            color={iconBlock.color ?? colorsLight.primary}
          />
        </View>
      ) : null}
      <View style={styles.body}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
      {trailing === 'chevron' ? (
        <Icon source="chevron-right" size={16} color={colorsLight.textFaint} />
      ) : trailing === 'pencil' ? (
        <Pressable hitSlop={10} onPress={onTrailingPress ?? onPress} style={styles.trailing}>
          <Icon source="pencil-outline" size={16} color={colorsLight.textFaint} />
        </Pressable>
      ) : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colorsLight.success,
  },
  iconBlock: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
  trailing: {
    padding: 4,
  },
});
