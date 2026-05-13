import * as React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colorsLight, radius } from '../../theme/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function FieldGroup({ children, style }: Props) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, style]}>
      {items.map((child, idx) => (
        <View key={idx}>
          {child}
          {idx < items.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginHorizontal: 16,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colorsLight.border,
  },
});
