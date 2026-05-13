import * as React from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Modal, Portal, Text } from 'react-native-paper';
import FieldRow from '../ui/FieldRow';
import { colorsLight, fontFamily } from '../../theme/theme';
import { formatDateYmd } from '../../utils/date';

type Props = {
  label: string;
  value: string;
  onChange: (value: string, date?: Date) => void;
  required?: boolean;
  placeholder?: string;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatHumanDate(value: string): string {
  if (!value) return '';
  const [yyyy, mm, dd] = value.split('-').map(Number);
  if (!yyyy || !mm || !dd) return value;
  return `${MONTHS[mm - 1]} ${dd}, ${yyyy}`;
}

export default function DateInput({ label, value, onChange, required, placeholder }: Props) {
  const [dateObj, setDateObj] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
  const [showPickerAndroid, setShowPickerAndroid] = React.useState(false);
  const [iosModalVisible, setIosModalVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(dateObj ?? new Date());
  const webInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setDateObj(value ? new Date(value) : undefined);
  }, [value]);

  function openPicker() {
    if (Platform.OS === 'web') {
      webInputRef.current?.showPicker?.();
      webInputRef.current?.click();
    } else if (Platform.OS === 'ios') {
      setTempDate(dateObj ?? new Date());
      setIosModalVisible(true);
    } else {
      setShowPickerAndroid(true);
    }
  }

  const display = formatHumanDate(value);

  const row = (
    <FieldRow
      label={label}
      value={display}
      placeholder={placeholder ?? 'Select date'}
      required={required}
      variant="date"
      onPress={openPicker}
    />
  );

  if (Platform.OS === 'web') {
    return (
      <View>
        {row}
        <input
          ref={webInputRef}
          type="date"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (v) {
              const d = new Date(v + 'T00:00:00');
              setDateObj(d);
              onChange(v, d);
            } else {
              setDateObj(undefined);
              onChange('');
            }
          }}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 1,
            height: 1,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        />
      </View>
    );
  }

  return (
    <>
      {row}
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
          <Modal
            visible={iosModalVisible}
            onDismiss={() => setIosModalVisible(false)}
            contentContainerStyle={{
              backgroundColor: colorsLight.surface,
              marginHorizontal: 16,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: 16, marginBottom: 8, color: colorsLight.text }}>
              Select date
            </Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_event: unknown, date?: Date) => {
                if (date) setTempDate(date);
              }}
              style={{ marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <Button onPress={() => setIosModalVisible(false)}>Cancel</Button>
              <Button
                mode="contained"
                buttonColor={colorsLight.primary}
                textColor={colorsLight.primaryFg}
                onPress={() => {
                  setDateObj(tempDate);
                  onChange(formatDateYmd(tempDate), tempDate);
                  setIosModalVisible(false);
                }}
              >
                Done
              </Button>
            </View>
          </Modal>
        </Portal>
      )}
    </>
  );
}
