import * as React from 'react';
import { TextInput } from 'react-native-paper';
import FormModal from './FormModal';

type Props = {
  visible: boolean;
  title: string;
  label: string;
  initialValue?: string;
  onDismiss: () => void;
  onSave: (value: string) => void;
};

export default function TextModal({ visible, title, label, initialValue, onDismiss, onSave }: Props) {
  const [value, setValue] = React.useState(initialValue ?? '');

  React.useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue, visible]);

  return (
    <FormModal
      visible={visible}
      title={title}
      onDismiss={onDismiss}
      onSave={() => onSave(value)}
      saveDisabled={!value.trim()}
    >
      <TextInput label={label} value={value} onChangeText={setValue} style={{ marginBottom: 8 }} />
    </FormModal>
  );
}
