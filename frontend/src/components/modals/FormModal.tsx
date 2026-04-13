import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, Text, Button, useTheme } from 'react-native-paper';
import { spacing } from '../../theme/theme';

type Props = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  children: React.ReactNode;
};

export default function FormModal({ visible, title, onDismiss, onSave, saveDisabled, children }: Props) {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        {children}
        <View style={styles.buttonRow}>
          <Button
            onPress={onDismiss}
            textColor={theme.colors.onSurfaceVariant}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={onSave}
            disabled={saveDisabled}
            style={styles.saveButton}
          >
            Save
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: spacing.lg,
    borderRadius: 20,
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  cancelButton: {
    borderRadius: 10,
  },
  saveButton: {
    borderRadius: 10,
  },
});
