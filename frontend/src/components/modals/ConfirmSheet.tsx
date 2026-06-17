import * as React from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colorsLight, fontFamily, shadows } from '../../theme/theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

export default function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Sign out',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onDismiss,
}: Props) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translate = React.useRef(new Animated.Value(40)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translate.setValue(40);
    }
  }, [visible, opacity, translate]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: translate }] }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable
            onPress={onConfirm}
            style={({ pressed }: { pressed: boolean }) => [
              styles.confirm,
              destructive ? styles.confirmDestructive : styles.confirmDefault,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.confirmLabel}>{confirmLabel}</Text>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }: { pressed: boolean }) => [styles.cancel, pressed ? styles.pressed : null]}
          >
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colorsLight.backdrop,
  },
  sheet: {
    backgroundColor: colorsLight.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 14,
    paddingBottom: 32,
    paddingHorizontal: 20,
    ...shadows.modalSheet,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colorsLight.borderStrong,
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: -0.2,
    color: colorsLight.text,
    textAlign: 'center',
    includeFontPadding: false,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontWeight: '400',
    fontSize: 14,
    color: colorsLight.textMuted,
    textAlign: 'center',
    marginTop: 8,
    includeFontPadding: false,
  },
  confirm: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 24,
  },
  confirmDefault: {
    backgroundColor: colorsLight.primary,
  },
  confirmDestructive: {
    backgroundColor: colorsLight.danger,
  },
  confirmLabel: {
    color: colorsLight.primaryFg,
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  cancel: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 8,
  },
  cancelLabel: {
    color: colorsLight.text,
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.85,
  },
});
