import * as React from 'react';
import { View } from 'react-native';
import { Portal, Modal, Text, Button } from 'react-native-paper';

type Props = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  children: React.ReactNode;
};

export default function FormModal({ visible, title, onDismiss, onSave, saveDisabled, children }: Props) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}
      >
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>{title}</Text>
        {children}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button onPress={onDismiss} style={{ marginRight: 8 }}>Cancel</Button>
          <Button mode="contained" onPress={onSave} disabled={saveDisabled}>Save</Button>
        </View>
      </Modal>
    </Portal>
  );
}
