import * as React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colorsLight, fontFamily, radius } from '../../theme/theme';

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  normalize?: (raw: string) => string | null;
  suggestions?: string[];
  helperText?: string;
};

const MAX_SUGGESTIONS = 6;

export default function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  normalize,
  suggestions,
  helperText,
}: Props) {
  const [text, setText] = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput | null>(null);
  const suppressBlurAdd = React.useRef(false);

  function resolve(raw: string): string | null {
    if (normalize) return normalize(raw);
    const trimmed = raw.trim();
    return trimmed || null;
  }

  function addChip(raw: string) {
    const value = resolve(raw);
    if (value && !values.includes(value)) {
      onChange([...values, value]);
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

  const query = text.trim().toLowerCase();
  const matchedSuggestions =
    focused && suggestions && suggestions.length > 0
      ? suggestions
          .filter((s) => !values.includes(s))
          .filter((s) => (query ? s.includes(query) : true))
          .slice(0, MAX_SUGGESTIONS)
      : [];

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
                if (suppressBlurAdd.current) {
                  suppressBlurAdd.current = false;
                  if (!text) setEditing(false);
                  return;
                }
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
              autoCapitalize={normalize ? 'none' : 'sentences'}
              autoCorrect={!normalize}
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
      {matchedSuggestions.length > 0 ? (
        <View style={styles.suggestionRow}>
          {matchedSuggestions.map((s) => (
            <Pressable
              key={s}
              onPressIn={() => {
                suppressBlurAdd.current = true;
              }}
              onPress={() => addChip(s)}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
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
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  suggestionChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colorsLight.primarySoft,
  },
  suggestionText: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 12,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
  helper: {
    marginTop: 8,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colorsLight.textFaint,
    includeFontPadding: false,
  },
});
