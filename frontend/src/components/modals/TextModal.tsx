import * as React from 'react';
import FormModal from './FormModal';
import FieldGroup from '../ui/FieldGroup';
import FieldRow from '../ui/FieldRow';

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
      <FieldGroup>
        <FieldRow
          label={label}
          value={value}
          onChangeText={setValue}
          placeholder="Required"
          required
          multiline
        />
      </FieldGroup>
    </FormModal>
  );
}
