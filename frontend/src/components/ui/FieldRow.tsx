import * as React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily } from '../../theme/theme';

type Variant = 'text' | 'select' | 'date' | 'display';

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  variant?: Variant;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'placeholderTextColor' | 'style'>;
  rightSlot?: React.ReactNode;
  bodyBelow?: React.ReactNode;
  style?: ViewStyle;
};

export default function FieldRow({
  label,
  value,
  placeholder,
  required,
  multiline,
  variant = 'text',
  onChangeText,
  onPress,
  textInputProps,
  rightSlot,
  bodyBelow,
  style,
}: Props) {
  const [focused, setFocused] = React.useState(false);
  const isMultiline = multiline || Boolean(bodyBelow);

  const labelColor: string = focused || required ? colorsLight.primary : colorsLight.textMuted;
  const labelText = required ? `${label} *` : label;

  const containerStyles: ViewStyle[] = [
    styles.row,
    isMultiline ? styles.rowMulti : styles.rowInline,
    focused ? { backgroundColor: colorsLight.focusedFieldBg } : undefined,
    style,
  ].filter(Boolean) as ViewStyle[];

  const labelStyles: TextStyle[] = [
    styles.label,
    isMultiline ? styles.labelMulti : styles.labelInline,
    { color: labelColor, fontFamily: focused || required ? fontFamily.semibold : fontFamily.medium, fontWeight: focused || required ? '600' : '500' },
  ];

  const renderValue = () => {
    if (variant === 'text' && onChangeText) {
      return (
        <TextInput
          {...textInputProps}
          value={value ?? ''}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setFocused(true);
            textInputProps?.onFocus?.(e as never);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputProps?.onBlur?.(e as never);
          }}
          placeholder={placeholder}
          placeholderTextColor={colorsLight.textFaint}
          multiline={multiline}
          style={[styles.input, multiline ? styles.inputMulti : null]}
        />
      );
    }
    return (
      <Text
        style={[
          styles.value,
          { color: value ? colorsLight.text : colorsLight.textFaint },
        ]}
        numberOfLines={isMultiline ? undefined : 1}
      >
        {value || placeholder || ''}
      </Text>
    );
  };

  const right =
    rightSlot ??
    (variant === 'select' || variant === 'date' ? (
      <Icon source="chevron-down" size={16} color={colorsLight.textFaint} />
    ) : null);

  const Wrapper: React.ComponentType<any> = onPress ? Pressable : View;
  const wrapperProps = onPress ? { onPress } : {};

  return (
    <Wrapper {...wrapperProps} style={containerStyles}>
      <Text style={labelStyles}>{labelText}</Text>
      {bodyBelow ? (
        bodyBelow
      ) : (
        <View style={styles.valueWrap}>
          {renderValue()}
        </View>
      )}
      {right ? <View style={styles.right}>{right}</View> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowMulti: {
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    includeFontPadding: false,
  },
  labelInline: {
    width: 112,
  },
  labelMulti: {
    width: 'auto',
  },
  valueWrap: {
    flex: 1,
  },
  value: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    letterSpacing: -0.1,
    color: colorsLight.text,
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
  },
  inputMulti: {
    minHeight: 22,
    textAlignVertical: 'top',
  },
  right: {
    marginLeft: 8,
  },
});
