import * as React from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { colorsLight, fontFamily, shadows } from '../../theme/theme';

type Props = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
};

export default function PickerSheet({
  visible,
  title,
  onDismiss,
  onConfirm,
  confirmLabel = 'Done',
  cancelLabel = 'Cancel',
  children,
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
          <View style={styles.content}>{children}</View>
          <View style={styles.actions}>
            <Button onPress={onDismiss}>{cancelLabel}</Button>
            <Button
              mode="contained"
              buttonColor={colorsLight.primary}
              textColor={colorsLight.primaryFg}
              onPress={onConfirm}
            >
              {confirmLabel}
            </Button>
          </View>
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
  content: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
});
