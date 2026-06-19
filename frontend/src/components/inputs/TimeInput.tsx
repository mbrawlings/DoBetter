import * as React from 'react';
import { Keyboard, Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FieldRow from '../ui/FieldRow';
import PickerSheet from '../modals/PickerSheet';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function timeToDate(value: string): Date {
  const d = new Date();
  const [hh, mm] = value.split(':').map(Number);
  if (Number.isFinite(hh) && Number.isFinite(mm)) {
    d.setHours(hh, mm, 0, 0);
  }
  return d;
}

export function dateToTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatHumanTime(value: string): string {
  if (!value) return '';
  const [hh, mm] = value.split(':').map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return value;
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${pad(mm)} ${period}`;
}

export default function TimeInput({ label, value, onChange, required, placeholder }: Props) {
  const [showPickerAndroid, setShowPickerAndroid] = React.useState(false);
  const [iosModalVisible, setIosModalVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(value ? timeToDate(value) : new Date());

  function openPicker() {
    Keyboard.dismiss();
    if (Platform.OS === 'ios') {
      setTempDate(value ? timeToDate(value) : new Date());
      setIosModalVisible(true);
    } else {
      setShowPickerAndroid(true);
    }
  }

  const display = formatHumanTime(value);

  const row = (
    <FieldRow
      label={label}
      value={display}
      placeholder={placeholder ?? 'Select time'}
      required={required}
      variant="date"
      onPress={Platform.OS === 'web' ? undefined : openPicker}
    />
  );

  if (Platform.OS === 'web') {
    return (
      <View style={{ position: 'relative' }}>
        {row}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            try {
              (e.currentTarget as HTMLInputElement).showPicker?.();
            } catch {
              // showPicker throws if unsupported or not user-activated; the genuine
              // tap still focuses the input as a fallback (e.g. mobile Safari).
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
          value={value ? timeToDate(value) : new Date()}
          mode="time"
          display="default"
          onChange={(event: any, date?: Date) => {
            setShowPickerAndroid(false);
            if (event?.type === 'set' && date) {
              onChange(dateToTime(date));
            }
          }}
        />
      )}
      {Platform.OS === 'ios' && (
        <PickerSheet
          visible={iosModalVisible}
          title="Select time"
          onDismiss={() => setIosModalVisible(false)}
          onConfirm={() => {
            onChange(dateToTime(tempDate));
            setIosModalVisible(false);
          }}
        >
          <DateTimePicker
            value={tempDate}
            mode="time"
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
