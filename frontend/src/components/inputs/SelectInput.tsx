import * as React from 'react';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import FieldRow from '../ui/FieldRow';

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
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <FieldRow
            label={label}
            value={value}
            placeholder={placeholder ?? 'Select…'}
            required={required}
            variant="select"
            onPress={() => setVisible(true)}
          />
        }
      >
        {options.map((opt) => (
          <Menu.Item
            key={opt}
            onPress={() => {
              onChange(opt);
              setVisible(false);
            }}
            title={opt}
          />
        ))}
      </Menu>
    </View>
  );
}
