import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, getAvatarColor, getInitials } from '../../theme/theme';

type Props = {
  firstName?: string;
  lastName?: string;
  size?: number;
  color?: string;
  placeholder?: boolean;
};

export default function Avatar({ firstName = '', lastName = '', size = 40, color, placeholder }: Props) {
  if (placeholder) {
    return (
      <View
        style={[
          styles.base,
          styles.placeholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colorsLight.raised,
            borderColor: colorsLight.borderStrong,
          },
        ]}
      >
        <Icon source="account-outline" size={Math.round(size * 0.42)} color={colorsLight.textFaint} />
      </View>
    );
  }
  const bg = color ?? getAvatarColor(`${firstName}${lastName}`);
  const initials = getInitials(firstName, lastName);
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontFamily: fontFamily.semibold,
          fontWeight: '600',
          fontSize: Math.round(size * 0.38),
          letterSpacing: -0.2,
          includeFontPadding: false,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
