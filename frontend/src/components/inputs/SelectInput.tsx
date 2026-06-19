import * as React from 'react';
import { Keyboard, View } from 'react-native';
import FieldRow from '../ui/FieldRow';
import SelectSheet from '../modals/SelectSheet';

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
