import * as React from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Portal, Modal, Text, Button, TextInput } from 'react-native-paper';

type Props = {
  label: string;
  value: string; // YYYY-MM-DD or empty
  onChange: (value: string, date?: Date) => void;
  style?: any;
};

function formatDateYmd(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function DateInput({ label, value, onChange, style }: Props) {
  const [dateObj, setDateObj] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
  const [showPickerAndroid, setShowPickerAndroid] = React.useState(false);
  const [iosModalVisible, setIosModalVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(dateObj ?? new Date());

  React.useEffect(() => {
    setDateObj(value ? new Date(value) : undefined);
  }, [value]);

  function openPicker() {
    if (Platform.OS === 'ios') {
      setTempDate(dateObj ?? new Date());
      setIosModalVisible(true);
    } else {
      setShowPickerAndroid(true);
    }
  }

  return (
    <>
      <TextInput
        label={label}
        value={value}
        editable={false}
        right={<TextInput.Icon icon="calendar" onPress={openPicker} />}
        onPressIn={openPicker}
        style={style}
      />
      {Platform.OS === 'android' && showPickerAndroid && (
        <DateTimePicker
          value={dateObj ?? new Date()}
          mode="date"
          display="default"
          onChange={(event: any, date?: Date) => {
            setShowPickerAndroid(false);
            if (event?.type === 'set' && date) {
              setDateObj(date);
              onChange(formatDateYmd(date), date);
            }
          }}
        />
      )}
      {Platform.OS === 'ios' && (
        <Portal>
          <Modal visible={iosModalVisible} onDismiss={() => setIosModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 12, padding: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Date</Text>
            <DateTimePicker value={tempDate} mode="date" display="spinner" onChange={(_, date) => { if (date) setTempDate(date); }} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button onPress={() => setIosModalVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={() => { setDateObj(tempDate); onChange(formatDateYmd(tempDate), tempDate); setIosModalVisible(false); }}>Done</Button>
            </View>
          </Modal>
        </Portal>
      )}
    </>
  );
}


