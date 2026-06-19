import * as React from 'react';
import { ActivityIndicator, Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colorsLight, fontFamily, shadows } from '../../theme/theme';

type Props = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSave: () => void | Promise<void>;
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
  const [saving, setSaving] = React.useState(false);

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

  const handleSave = React.useCallback(async () => {
    if (saving) return;
    try {
      setSaving(true);
      await onSave();
    } catch {
      // Keep the modal open so the user can retry; failures are surfaced by the caller.
    } finally {
      setSaving(false);
    }
  }, [saving, onSave]);

  const handleDismiss = React.useCallback(() => {
    if (saving) return;
    onDismiss();
  }, [saving, onDismiss]);

  const saveDimmed = saveDisabled || saving;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleDismiss} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: translate }] }]}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Pressable hitSlop={8} onPress={handleDismiss} disabled={saving}>
              <Text style={[styles.cancel, saving ? styles.saveDisabled : null]}>{cancelLabel}</Text>
            </Pressable>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {saving ? (
              <View style={styles.saveSlot}>
                <ActivityIndicator size="small" color={colorsLight.primary} />
              </View>
            ) : (
              <Pressable hitSlop={8} onPress={handleSave} disabled={saveDimmed}>
                <Text style={[styles.save, saveDimmed ? styles.saveDisabled : null]}>{saveLabel}</Text>
              </Pressable>
            )}
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
  saveSlot: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  saveDisabled: {
    color: colorsLight.textFaint,
  },
  body: {
    paddingBottom: 16,
  },
});
