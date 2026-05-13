import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius, shadows } from '../../theme/theme';

type Props = {
  label: string;
  onPress?: () => void;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function PrimaryButton({ label, onPress, full, loading, disabled, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }: { pressed: boolean }) => [
        styles.button,
        full ? styles.full : null,
        !isDisabled ? shadows.primaryButton : null,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colorsLight.primaryFg} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colorsLight.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    minHeight: 50,
  },
  full: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: colorsLight.primaryFg,
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
});
