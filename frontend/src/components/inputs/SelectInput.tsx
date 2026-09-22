import * as React from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { Icon } from 'react-native-paper';
import FieldRow from '../ui/FieldRow';
import SelectSheet from '../modals/SelectSheet';
import { colorsLight } from '../../theme/theme';

type Props = {
  label: string;
  value: string;
  options: ReadonlyArray<string>;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export default function SelectInput({ label, value, options, onChange, required, placeholder }: Props) {
  const [visible, setVisible] = React.useState(false);
  const canClear = Boolean(value) && !required;

  return (
    <View>
      <FieldRow
        label={label}
        value={value}
        placeholder={placeholder ?? 'Select…'}
        required={required}
        variant="select"
        onPress={() => {
          Keyboard.dismiss();
          setVisible(true);
        }}
        rightSlot={
          canClear ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Pressable
                onPress={() => onChange('')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Clear ${label}`}
              >
                <Icon source="close-circle" size={18} color={colorsLight.textFaint} />
              </Pressable>
              <Icon source="chevron-down" size={16} color={colorsLight.textFaint} />
            </View>
          ) : undefined
        }
      />
      <SelectSheet
        visible={visible}
        title={label}
        options={options}
        value={value}
        onSelect={(opt) => {
          onChange(opt);
          setVisible(false);
        }}
        onDismiss={() => setVisible(false)}
      />
    </View>
  );
}
