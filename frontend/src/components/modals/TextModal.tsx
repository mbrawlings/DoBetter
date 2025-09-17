import * as React from 'react';
import { View } from 'react-native';
import { Portal, Modal, Text, Button, TextInput } from 'react-native-paper';

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
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>{title}</Text>
        <TextInput label={label} value={value} onChangeText={setValue} style={{ marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button onPress={onDismiss} style={{ marginRight: 8 }}>Cancel</Button>
          <Button mode="contained" onPress={() => onSave(value)} disabled={!value.trim()}>Save</Button>
        </View>
      </Modal>
    </Portal>
  );
}



