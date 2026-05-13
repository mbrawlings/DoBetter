import * as React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius } from '../../theme/theme';

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export default function ChipInput({ label, values, onChange, placeholder }: Props) {
  const [text, setText] = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput | null>(null);

  function addChip(raw: string) {
    const trimmed = raw.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setText('');
  }

  function handleTextChange(input: string) {
    if (input.includes(',')) {
      const parts = input.split(',');
      parts.slice(0, -1).forEach((part) => addChip(part));
      setText(parts[parts.length - 1] ?? '');
    } else {
      setText(input);
    }
  }

  function removeChip(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function startEditing() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <View style={[styles.container, focused ? styles.containerFocused : null]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {values.map((val, i) => (
          <View key={`${val}-${i}`} style={styles.chip}>
            <Text style={styles.chipText}>{val}</Text>
            <Pressable hitSlop={8} onPress={() => removeChip(i)}>
              <Icon source="close" size={14} color={colorsLight.textMuted} />
            </Pressable>
          </View>
        ))}
        {editing ? (
          <View style={styles.inputChip}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={handleTextChange}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                if (text.trim()) addChip(text);
                if (!text) setEditing(false);
              }}
              onSubmitEditing={() => {
                if (text.trim()) {
                  addChip(text);
                } else {
                  setEditing(false);
                }
              }}
              blurOnSubmit={false}
              placeholder={placeholder ?? 'Type, then comma'}
              placeholderTextColor={colorsLight.textFaint}
              style={styles.input}
            />
          </View>
        ) : (
          <Pressable onPress={startEditing} style={styles.addChip}>
            <Text style={styles.addChipText}>+ add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  containerFocused: {
    backgroundColor: colorsLight.focusedFieldBg,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    marginBottom: 8,
    includeFontPadding: false,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: radius.pill,
    backgroundColor: colorsLight.raised,
    borderWidth: 1,
    borderColor: colorsLight.border,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.text,
    includeFontPadding: false,
  },
  addChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colorsLight.borderStrong,
  },
  addChipText: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textFaint,
    includeFontPadding: false,
  },
  inputChip: {
    minWidth: 100,
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorsLight.border,
    backgroundColor: colorsLight.surface,
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.text,
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
  },
});
