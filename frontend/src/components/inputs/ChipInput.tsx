import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, TextInput, useTheme } from 'react-native-paper';
import { spacing } from '../../theme/theme';

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  style?: any;
};

export default function ChipInput({ label, values, onChange, style }: Props) {
  const [text, setText] = React.useState('');
  const theme = useTheme();

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
      setText(parts[parts.length - 1]);
    } else {
      setText(input);
    }
  }

  function removeChip(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <View style={style}>
      {values.length > 0 && (
        <View style={styles.chipRow}>
          {values.map((val, i) => (
            <Chip
              key={`${val}-${i}`}
              mode="outlined"
              onClose={() => removeChip(i)}
              style={[styles.chip, { borderColor: theme.colors.outline }]}
              textStyle={styles.chipText}
              compact
            >
              {val}
            </Chip>
          ))}
        </View>
      )}
      <TextInput
        label={values.length > 0 ? '' : label}
        placeholder={values.length > 0 ? 'Add more...' : undefined}
        value={text}
        onChangeText={handleTextChange}
        onSubmitEditing={() => addChip(text)}
        mode="flat"
        style={styles.input}
        blurOnSubmit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  chip: {
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
  },
  input: {
    backgroundColor: 'transparent',
  },
});
