import * as React from 'react';
import { Menu, TextInput } from 'react-native-paper';

type Props = {
  label: string;
  value: string;
  options: ReadonlyArray<string>;
  onChange: (value: string) => void;
  mode?: 'flat' | 'outlined';
  style?: any;
};

export default function SelectInput({ label, value, options, onChange, mode, style }: Props) {
  const [visible, setVisible] = React.useState(false);
  return (
    <Menu visible={visible} onDismiss={() => setVisible(false)} anchor={
      <TextInput
        label={label}
        value={value}
        mode={mode}
        right={<TextInput.Icon icon="menu-down" onPress={() => setVisible(true)} />}
        onPressIn={() => setVisible(true)}
        editable={false}
        style={style}
      />
    }>
      {options.map((opt) => (
        <Menu.Item key={opt} onPress={() => { onChange(opt); setVisible(false); }} title={opt} />
      ))}
    </Menu>
  );
}
