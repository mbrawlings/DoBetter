import * as React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily } from '../../theme/theme';

type Props = {
  title: string;
  large?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: ViewStyle;
};

export function NavBar({ title, large = false, leading, trailing, style }: Props) {
  return (
    <View
      style={[
        styles.container,
        large ? styles.containerLarge : styles.containerStandard,
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.side}>{leading}</View>
        {!large ? (
          <Text style={styles.standardTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.flexFiller} />
        )}
        <View style={[styles.side, styles.sideRight]}>{trailing}</View>
      </View>
      {large ? <Text style={styles.largeTitle}>{title}</Text> : null}
    </View>
  );
}

type BackButtonProps = { label?: string; onPress?: () => void };

export function BackButton({ label = 'Back', onPress }: BackButtonProps) {
  return (
    <Pressable hitSlop={8} onPress={onPress} style={styles.backRow}>
      <Icon source="chevron-left" size={24} color={colorsLight.primary} />
      <Text style={styles.backLabel}>{label}</Text>
    </Pressable>
  );
}

type NavLinkProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  bold?: boolean;
};

export function NavLink({ label, onPress, disabled, bold }: NavLinkProps) {
  return (
    <Pressable hitSlop={8} onPress={onPress} disabled={disabled}>
      <Text
        style={[
          styles.navLink,
          bold ? styles.navLinkBold : null,
          { color: disabled ? colorsLight.textFaint : colorsLight.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type IconActionProps = { icon: string; onPress?: () => void; accessibilityLabel?: string };

export function NavIconAction({ icon, onPress, accessibilityLabel }: IconActionProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={accessibilityLabel}
      style={styles.iconAction}
    >
      <Icon source={icon} size={20} color={colorsLight.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  containerLarge: {
    paddingTop: 52,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  containerStandard: {
    paddingTop: 52,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  side: {
    minWidth: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  flexFiller: {
    flex: 1,
  },
  standardTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.2,
    color: colorsLight.text,
    includeFontPadding: false,
  },
  largeTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 34,
    letterSpacing: -0.8,
    color: colorsLight.text,
    marginTop: 6,
    includeFontPadding: false,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 15,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
  navLink: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 15,
    includeFontPadding: false,
  },
  navLinkBold: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colorsLight.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NavBar;
