import * as React from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colorsLight, fontFamily, shadows } from '../../theme/theme';

type Props = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
};

export default function FormModal({
  visible,
  title,
  onDismiss,
  onSave,
  saveDisabled,
  saveLabel = 'Save',
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
          <View style={styles.headerRow}>
            <Pressable hitSlop={8} onPress={onDismiss}>
              <Text style={styles.cancel}>{cancelLabel}</Text>
            </Pressable>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Pressable hitSlop={8} onPress={onSave} disabled={saveDisabled}>
              <Text style={[styles.save, saveDisabled ? styles.saveDisabled : null]}>{saveLabel}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
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
    maxHeight: '90%',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  cancel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.primary,
    minWidth: 60,
    includeFontPadding: false,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: -0.2,
    color: colorsLight.text,
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false,
  },
  save: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 14,
    color: colorsLight.primary,
    minWidth: 60,
    textAlign: 'right',
    includeFontPadding: false,
  },
  saveDisabled: {
    color: colorsLight.textFaint,
  },
  body: {
    paddingBottom: 16,
  },
});
