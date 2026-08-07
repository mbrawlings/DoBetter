import * as React from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colorsLight, fontFamily, radius, shadows } from '../../theme/theme';

export type ActionFabItem = {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
};

type Props = {
  actions: ActionFabItem[];
  accessibilityLabel?: string;
};

export default function ActionFab({
  actions,
  accessibilityLabel = 'Add',
}: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = React.useState(false);
  const progress = React.useRef(new Animated.Value(0)).current;

  const expandable = actions.length > 1;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 200 : 160,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  const close = React.useCallback(() => setOpen(false), []);

  const onMainPress = () => {
    if (!expandable) {
      actions[0]?.onPress();
      return;
    }
    setOpen((prev) => !prev);
  };

  const onActionPress = (action: ActionFabItem) => {
    close();
    action.onPress();
  };

  const rotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const menuOpacity = progress;
  const menuTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const edge = 20;
  const bottom = Math.max(insets.bottom, edge);
  const right = Math.max(insets.right, edge);

  return (
    <View style={styles.root} pointerEvents="box-none">
      {expandable ? (
        <Animated.View
          pointerEvents={open ? 'auto' : 'none'}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Dismiss" />
        </Animated.View>
      ) : null}

      <View style={[styles.anchor, { bottom, right }]} pointerEvents="box-none">
        {expandable ? (
          <Animated.View
            pointerEvents={open ? 'auto' : 'none'}
            style={[
              styles.menu,
              {
                opacity: menuOpacity,
                transform: [{ translateY: menuTranslate }],
              },
            ]}
          >
            {actions.map((action, index) => (
              <Pressable
                key={action.key}
                onPress={() => onActionPress(action)}
                style={({ pressed }) => [
                  styles.menuItem,
                  index < actions.length - 1 ? styles.menuItemDivider : null,
                  pressed ? styles.pressed : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <View style={styles.menuIcon}>
                  <Icon source={action.icon} size={20} color={colorsLight.primary} />
                </View>
                <Text style={styles.menuLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}

        <Pressable
          onPress={onMainPress}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Close' : accessibilityLabel}
          accessibilityState={{ expanded: expandable ? open : undefined }}
          style={({ pressed }) => [
            styles.fab,
            shadows.primaryButton,
            pressed ? styles.fabPressed : null,
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Icon source="plus" size={28} color={colorsLight.primaryFg} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colorsLight.backdrop,
  },
  anchor: {
    position: 'absolute',
    alignItems: 'flex-end',
  },
  menu: {
    marginBottom: 12,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    overflow: 'hidden',
    minWidth: 220,
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorsLight.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colorsLight.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.1,
    color: colorsLight.text,
    includeFontPadding: false,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colorsLight.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    opacity: 0.9,
  },
  pressed: {
    backgroundColor: colorsLight.raised,
  },
});
