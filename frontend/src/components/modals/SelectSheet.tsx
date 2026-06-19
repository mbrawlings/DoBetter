import * as React from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, shadows } from '../../theme/theme';

type Props = {
  visible: boolean;
  title: string;
  options: ReadonlyArray<string>;
  value: string;
  onSelect: (value: string) => void;
  onDismiss: () => void;
};

export default function SelectSheet({ visible, title, options, value, onSelect, onDismiss }: Props) {
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
          <ScrollView style={styles.scroll} contentContainerStyle={styles.options}>
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onSelect(opt)}
                  style={({ pressed }: { pressed: boolean }) => [styles.option, pressed ? styles.pressed : null]}
                >
                  <Text style={[styles.optionLabel, selected ? styles.optionLabelSelected : null]}>{opt}</Text>
                  {selected ? <Icon source="check" size={20} color={colorsLight.primary} /> : null}
                </Pressable>
              );
            })}
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
    paddingHorizontal: 20,
    maxHeight: '70%',
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
  scroll: {
    marginTop: 16,
  },
  options: {
    paddingBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colorsLight.border,
  },
  optionLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 16,
    color: colorsLight.text,
    includeFontPadding: false,
  },
  optionLabelSelected: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    color: colorsLight.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});
