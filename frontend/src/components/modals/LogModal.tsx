import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import DateInput from '../inputs/DateInput';
import SelectInput from '../inputs/SelectInput';
import ConfirmSheet from './ConfirmSheet';
import FormModal from './FormModal';
import FieldGroup from '../ui/FieldGroup';
import FieldRow from '../ui/FieldRow';
import SectionLabel from '../ui/SectionLabel';
import {
  CREATE_LOG_MUTATION,
  DELETE_LOG_MUTATION,
  LOG_QUERY,
  PROCEDURE_QUERY,
  UPDATE_LOG_MUTATION,
} from '../../graphql/operations';
import { colorsLight, fontFamily, radius } from '../../theme/theme';
import { formatDateYmd } from '../../utils/date';
import { MeterUnit, isMeterUnit } from '../../utils/log';

const READING_CHOICES = ['None', 'Miles', 'Hours'] as const;
type ReadingChoice = (typeof READING_CHOICES)[number];

const NOTE_MAX = 4000;

type PartLine = { name: string; quantity?: string | null };
type SpecLine = { label: string; value: string };

type RecordedSource = {
  title: string;
  steps?: string[] | null;
  parts?: PartLine[] | null;
  tools?: string[] | null;
  specs?: SpecLine[] | null;
};

type LogFields = RecordedSource & {
  id: string;
  date?: string | null;
  cost?: number | null;
  note?: string | null;
  meter?: { unit: string; value: number } | null;
};

type Props = {
  visible: boolean;
  procedureId: string;
  logId?: string;
  onDismiss: () => void;
};

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function isReadingChoice(value: string): value is ReadingChoice {
  switch (value) {
    case 'None':
    case 'Miles':
    case 'Hours':
      return true;
    default:
      return false;
  }
}

function choiceForUnit(unit: MeterUnit): ReadingChoice {
  switch (unit) {
    case 'miles':
      return 'Miles';
    case 'hours':
      return 'Hours';
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

function parseAmount(raw: string, decimals: 2 | 3): { ok: true; value: number | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  const pattern = decimals === 2 ? /^\d+(\.\d{1,2})?$/ : /^\d+(\.\d{1,3})?$/;
  if (!pattern.test(trimmed)) return { ok: false };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { ok: false };
  return { ok: true, value };
}

function emptyDraft() {
  return {
    date: formatDateYmd(new Date()),
    cost: '',
    note: '',
    reading: 'None' as ReadingChoice,
    readingValue: '',
  };
}

function Recorded({ source }: { source: RecordedSource }) {
  const steps = source.steps ?? [];
  const parts = (source.parts ?? []).filter((part) => part.name);
  const tools = (source.tools ?? []).filter((tool) => tool);
  const specs = (source.specs ?? []).filter((spec) => spec.label && spec.value);
  const hasBody = steps.length > 0 || parts.length > 0 || tools.length > 0 || specs.length > 0;

  return (
    <>
      <SectionLabel>Recorded</SectionLabel>
      <View style={styles.group}>
        <Text style={styles.recordedTitle}>{source.title}</Text>
        {hasBody ? <View style={styles.divider} /> : null}
        {steps.map((step, index) => (
          <View key={`step-${index}`} style={styles.line}>
            <Text style={styles.order}>{index + 1}</Text>
            <Text style={styles.lineText}>{step}</Text>
          </View>
        ))}
        {parts.length > 0 ? <Text style={styles.recordedLabel}>Parts</Text> : null}
        {parts.map((part, index) => (
          <Text key={`part-${index}`} style={styles.recordedLine}>
            {part.quantity ? `${part.name} · ${part.quantity}` : part.name}
          </Text>
        ))}
        {tools.length > 0 ? <Text style={styles.recordedLabel}>Tools</Text> : null}
        {tools.map((tool, index) => (
          <Text key={`tool-${index}`} style={styles.recordedLine}>
            {tool}
          </Text>
        ))}
        {specs.length > 0 ? <Text style={styles.recordedLabel}>Specs</Text> : null}
        {specs.map((spec, index) => (
          <Text key={`spec-${index}`} style={styles.recordedLine}>
            {spec.label} · {spec.value}
          </Text>
        ))}
      </View>
    </>
  );
}

export default function LogModal({ visible, procedureId, logId, onDismiss }: Props) {
  const isEdit = Boolean(logId);
  const openedKey = visible ? `${logId ?? ''}:${procedureId}` : '';

  const { data, loading, error } = useQuery(LOG_QUERY, {
    variables: { id: logId! },
    skip: !visible || !isEdit,
    fetchPolicy: 'cache-and-network',
  });
  const log = data?.log as LogFields | null | undefined;

  const {
    data: procedureData,
    loading: procedureLoading,
    error: procedureError,
  } = useQuery(PROCEDURE_QUERY, {
    variables: { id: procedureId },
    skip: !visible || isEdit || !procedureId,
    fetchPolicy: 'cache-and-network',
  });
  const procedure = procedureData?.procedure as RecordedSource | null | undefined;

  const client = useApolloClient();
  const [createLog, { error: createError }] = useMutation(CREATE_LOG_MUTATION);
  const [updateLog, { error: updateError }] = useMutation(UPDATE_LOG_MUTATION);
  const [deleteLog] = useMutation(DELETE_LOG_MUTATION);

  const [date, setDate] = React.useState(() => formatDateYmd(new Date()));
  const [cost, setCost] = React.useState('');
  const [note, setNote] = React.useState('');
  const [reading, setReading] = React.useState<ReadingChoice>('None');
  const [readingValue, setReadingValue] = React.useState('');
  const [hydrated, setHydrated] = React.useState(!isEdit);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [openedKeySeen, setOpenedKeySeen] = React.useState(openedKey);

  if (openedKeySeen !== openedKey) {
    const draft = emptyDraft();
    setOpenedKeySeen(openedKey);
    setFormError(null);
    setDeleteError(null);
    setConfirmVisible(false);
    if (logId) {
      setHydrated(false);
    } else {
      setHydrated(true);
      setDate(draft.date);
      setCost(draft.cost);
      setNote(draft.note);
      setReading(draft.reading);
      setReadingValue(draft.readingValue);
    }
  }

  React.useEffect(() => {
    if (!visible || !logId || hydrated || !log || log.id !== logId) return;
    setDate(log.date || formatDateYmd(new Date()));
    setCost(log.cost == null ? '' : String(log.cost));
    setNote(log.note ?? '');
    if (log.meter && isMeterUnit(log.meter.unit)) {
      setReading(choiceForUnit(log.meter.unit));
      setReadingValue(String(log.meter.value));
    } else {
      setReading('None');
      setReadingValue('');
    }
    setHydrated(true);
  }, [visible, logId, hydrated, log]);

  const recorded = isEdit ? (hydrated ? log : undefined) : procedure;
  const meterChosen = reading !== 'None';
  const canSubmit =
    date.trim().length > 0 &&
    (!meterChosen || readingValue.trim().length > 0) &&
    (isEdit ? Boolean(log) && hydrated : Boolean(procedure));

  function onPickReading(value: string) {
    if (!isReadingChoice(value) || value === 'None') {
      setReading('None');
      setReadingValue('');
      return;
    }
    setReading(value);
  }

  async function onSave() {
    if (!canSubmit) throw new Error('Log is not ready to save.');
    if (!date.trim()) {
      const message = 'A date is required.';
      setFormError(message);
      throw new Error(message);
    }
    const parsedCost = parseAmount(cost, 2);
    if (!parsedCost.ok) {
      const message = 'Cost must be a dollar amount.';
      setFormError(message);
      throw new Error(message);
    }
    let meter: { unit: MeterUnit; value: number } | null = null;
    if (meterChosen) {
      const parsedReading = parseAmount(readingValue, 3);
      if (!parsedReading.ok || parsedReading.value == null) {
        const message = reading === 'Miles' ? 'Enter the miles.' : 'Enter the hours.';
        setFormError(message);
        throw new Error(message);
      }
      meter = { unit: reading === 'Miles' ? 'miles' : 'hours', value: parsedReading.value };
    }
    const input = {
      date: date.trim(),
      cost: parsedCost.value,
      note: note.trim() ? note.trim() : null,
      meter,
    };
    setFormError(null);
    try {
      if (isEdit) {
        await updateLog({
          variables: { id: logId, input },
          refetchQueries: ['ProcedureLogs', 'AssetLogs'],
        });
      } else {
        await createLog({
          variables: { input: { procedureId, ...input } },
          refetchQueries: ['ProcedureLogs', 'AssetLogs'],
        });
      }
    } catch (e) {
      setFormError(errorMessage(e, 'Failed to save log'));
      throw e;
    }
    onDismiss();
  }

  async function onConfirmDelete() {
    if (!logId || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data: result } = await deleteLog({
        variables: { id: logId },
        refetchQueries: ['ProcedureLogs', 'AssetLogs'],
      });
      if (!result?.deleteLog) throw new Error('Failed to delete log');
      client.cache.evict({ id: client.cache.identify({ __typename: 'Log', id: logId }) });
      client.cache.gc();
      setConfirmVisible(false);
      onDismiss();
    } catch (e) {
      setConfirmVisible(false);
      setDeleteError(errorMessage(e, 'Failed to delete log'));
    } finally {
      setDeleting(false);
    }
  }

  const loadError = isEdit ? error : procedureError;
  const waiting = isEdit ? !hydrated : procedureLoading && !procedure;
  const missing = isEdit ? !loading && !log : !procedureLoading && !procedure;
  const saveError =
    formError ?? (createError || updateError ? errorMessage(createError ?? updateError, 'Failed to save log') : null);

  let body: React.ReactNode;
  if (!isEdit && !procedureId) {
    body = <Status title="This log needs a procedure." />;
  } else if (loadError) {
    body = (
      <Status
        title={isEdit ? 'Failed to load log' : 'Failed to load procedure'}
        detail={errorMessage(loadError, 'Something went wrong.')}
      />
    );
  } else if (waiting && !missing) {
    body = (
      <View style={styles.status}>
        <ActivityIndicator size="large" color={colorsLight.primary} />
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  } else if (!recorded) {
    body = <Status title={isEdit ? 'Log not found' : 'Procedure not found'} />;
  } else {
    body = (
      <>
        <SectionLabel>Log</SectionLabel>
        <FieldGroup>
          <DateInput label="Date" value={date} onChange={(value) => setDate(value)} required />
          <FieldRow
            label="Cost"
            value={cost}
            onChangeText={setCost}
            placeholder="Optional"
            textInputProps={{ keyboardType: 'decimal-pad', inputMode: 'decimal' }}
          />
          <FieldRow
            label="Note"
            value={note}
            onChangeText={setNote}
            multiline
            minLines={3}
            placeholder="What changed, what you bought…"
            textInputProps={{ autoCapitalize: 'sentences', maxLength: NOTE_MAX }}
          />
          <SelectInput label="Reading" value={reading} options={READING_CHOICES} onChange={onPickReading} />
          {meterChosen ? (
            <FieldRow
              label={reading}
              value={readingValue}
              onChangeText={setReadingValue}
              placeholder="0"
              required
              textInputProps={{ keyboardType: 'decimal-pad', inputMode: 'decimal' }}
            />
          ) : null}
        </FieldGroup>

        <Recorded source={recorded} />

        {saveError ? <Text style={styles.errorBody}>{saveError}</Text> : null}
        {deleteError ? <Text style={styles.errorBody}>{deleteError}</Text> : null}
        {isEdit ? null : (
          <Text style={styles.tipText}>
            Saving copies the procedure onto this log. A later edit leaves this copy as it was.
          </Text>
        )}
      </>
    );
  }

  return (
    <>
      <FormModal
        visible={visible}
        title={isEdit ? 'Log' : 'New log'}
        onDismiss={onDismiss}
        onSave={onSave}
        saveDisabled={!canSubmit}
        onDelete={
          isEdit && recorded
            ? () => {
                setDeleteError(null);
                setConfirmVisible(true);
              }
            : undefined
        }
        deleteLabel="Delete log"
      >
        {body}
      </FormModal>
      <ConfirmSheet
        visible={confirmVisible}
        title="Delete log?"
        message="Delete this log? This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={onConfirmDelete}
        onDismiss={() => setConfirmVisible(false)}
      />
    </>
  );
}

function Status({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.status}>
      <Text style={styles.errorTitle}>{title}</Text>
      {detail ? <Text style={styles.muted}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 28,
  },
  muted: {
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
    textAlign: 'center',
  },
  errorBody: {
    marginTop: 12,
    marginHorizontal: 16,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    color: colorsLight.danger,
  },
  group: {
    marginHorizontal: 16,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  recordedTitle: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: colorsLight.text,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colorsLight.border,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 16,
    paddingTop: 10,
  },
  order: {
    width: 18,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
    color: colorsLight.textMuted,
    textAlign: 'right',
  },
  lineText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colorsLight.text,
  },
  recordedLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colorsLight.textMuted,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  recordedLine: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colorsLight.text,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  tipText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.textMuted,
    textAlign: 'center',
    paddingTop: 28,
    paddingHorizontal: 32,
  },
});
