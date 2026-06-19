import * as React from 'react';
import { Keyboard, Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FieldRow from '../ui/FieldRow';
import PickerSheet from '../modals/PickerSheet';
import { formatDateYmd } from '../../utils/date';

type Props = {
  label: string;
  value: string;
  onChange: (value: string, date?: Date) => void;
  required?: boolean;
  placeholder?: string;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toYmd(value: string): string {
  if (!value) return '';
  return value.split('T')[0];
}

export function formatHumanDate(value: string): string {
  if (!value) return '';
  const [yyyy, mm, dd] = toYmd(value).split('-').map(Number);
  if (!yyyy || !mm || !dd) return value;
  return `${MONTHS[mm - 1]} ${dd}, ${yyyy}`;
}

export default function DateInput({ label, value, onChange, required, placeholder }: Props) {
  const [dateObj, setDateObj] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
  const [showPickerAndroid, setShowPickerAndroid] = React.useState(false);
  const [iosModalVisible, setIosModalVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(dateObj ?? new Date());

  React.useEffect(() => {
    setDateObj(value ? new Date(value) : undefined);
  }, [value]);

  function openPicker() {
    Keyboard.dismiss();
    if (Platform.OS === 'ios') {
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
      onPress={Platform.OS === 'web' ? undefined : openPicker}
    />
  );

  if (Platform.OS === 'web') {
    // Overlay a real, full-size, transparent date input so the user's tap lands
    // directly on it. iOS Safari only opens the native picker from a genuine tap
    // on the input itself (programmatic .click()/showPicker() do not work there).
    return (
      <View style={{ position: 'relative' }}>
        {row}
        <input
          type="date"
          value={toYmd(value)}
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            border: 'none',
            opacity: 0,
            cursor: 'pointer',
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
        <PickerSheet
          visible={iosModalVisible}
          title="Select date"
          onDismiss={() => setIosModalVisible(false)}
          onConfirm={() => {
            setDateObj(tempDate);
            onChange(formatDateYmd(tempDate), tempDate);
            setIosModalVisible(false);
          }}
        >
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={(_event: unknown, date?: Date) => {
              if (date) setTempDate(date);
            }}
          />
        </PickerSheet>
      )}
    </>
  );
}
