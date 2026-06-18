import * as React from 'react';
import { Switch } from 'react-native-paper';
import FormModal from './FormModal';
import FieldGroup from '../ui/FieldGroup';
import FieldRow from '../ui/FieldRow';
import DateInput from '../inputs/DateInput';
import TimeInput from '../inputs/TimeInput';
import { combineDateAndTime, splitIso } from '../../utils/date';
import { colorsLight } from '../../theme/theme';
import type { UpcomingEventFormData } from '../../types';

export type UpcomingEventForm = UpcomingEventFormData;

type Props = {
  visible: boolean;
  titleText: string;
  initial?: UpcomingEventForm;
  onDismiss: () => void;
  onSave: (form: UpcomingEventForm) => void;
};

export default function UpcomingEventModal({ visible, titleText, initial, onDismiss, onSave }: Props) {
  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [allDay, setAllDay] = React.useState(true);
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    if (initial?.startsAt) {
      const { ymd, time: t } = splitIso(initial.startsAt);
      setAllDay(false);
      setDate(ymd);
      setTime(t);
    } else {
      setAllDay(true);
      setDate(initial?.date ?? '');
      setTime('');
    }
  }, [initial, visible]);

  function handleSave() {
    if (allDay) {
      onSave({ title, date: date || undefined, startsAt: undefined, notes });
    } else {
      const startsAt = date && time ? combineDateAndTime(date, time) : undefined;
      onSave({ title, date: date || undefined, startsAt, notes });
    }
  }

  function toggleAllDay(next: boolean) {
    setAllDay(next);
    if (!next && !time) setTime('09:00');
  }

  return (
    <FormModal
      visible={visible}
      title={titleText}
      onDismiss={onDismiss}
      onSave={handleSave}
      saveDisabled={!title.trim()}
    >
      <FieldGroup>
        <FieldRow
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Required"
          required
        />
        <FieldRow
          label="All day"
          variant="display"
          rightSlot={
            <Switch value={allDay} onValueChange={toggleAllDay} color={colorsLight.primary} />
          }
        />
        <DateInput label="Date" value={date} onChange={(v) => setDate(v)} />
        {!allDay ? <TimeInput label="Time" value={time} onChange={(v) => setTime(v)} /> : null}
        <FieldRow
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          multiline
        />
      </FieldGroup>
    </FormModal>
  );
}
