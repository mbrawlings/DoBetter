import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import DateInput from '../components/inputs/DateInput';
import SelectInput from '../components/inputs/SelectInput';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import { BackButton, FieldGroup, FieldRow, NavBar, NavLink, SectionLabel } from '../components/ui';
import {
  CREATE_LOG_MUTATION,
  DELETE_LOG_MUTATION,
  LOG_QUERY,
  PROCEDURE_QUERY,
  UPDATE_LOG_MUTATION,
} from '../graphql/operations';
import { colorsLight, fontFamily, radius } from '../theme/theme';
import { formatDateYmd } from '../utils/date';
import { MeterUnit, isMeterUnit } from '../utils/log';

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

export default function LogFormScreen({ navigation }: any) {
  const route = useRoute() as any;
  const procedureId: string | undefined = route.params?.procedureId;
  const logId: string | undefined = route.params?.id;
  const isEdit = Boolean(logId);

  const { data, loading, error } = useQuery(LOG_QUERY, {
    variables: { id: logId! },
    skip: !isEdit,
    fetchPolicy: 'cache-and-network',
  });
  const log = data?.log as LogFields | null | undefined;

  const {
    data: procedureData,
    loading: procedureLoading,
    error: procedureError,
  } = useQuery(PROCEDURE_QUERY, {
    variables: { id: procedureId! },
    skip: isEdit || !procedureId,
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
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!log || hydrated) return;
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
  }, [log, hydrated]);

  const recorded = isEdit ? log : procedure;
  const meterChosen = reading !== 'None';
  const canSubmit =
    date.trim().length > 0 &&
    (!meterChosen || readingValue.trim().length > 0) &&
    !submitting &&
    (isEdit || Boolean(procedure));

  function onPickReading(value: string) {
    if (!isReadingChoice(value) || value === 'None') {
      setReading('None');
      setReadingValue('');
      return;
    }
    setReading(value);
  }

  async function onSave() {
    if (!canSubmit) return;
    if (!date.trim()) {
      setFormError('A date is required.');
      return;
    }
    const parsedCost = parseAmount(cost, 2);
    if (!parsedCost.ok) {
      setFormError('Cost must be a dollar amount.');
      return;
    }
    let meter: { unit: MeterUnit; value: number } | null = null;
    if (meterChosen) {
      const parsedReading = parseAmount(readingValue, 3);
      if (!parsedReading.ok || parsedReading.value == null) {
        setFormError(reading === 'Miles' ? 'Enter the miles.' : 'Enter the hours.');
        return;
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
    setSubmitting(true);
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
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
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
      navigation.goBack();
    } catch (e) {
      setConfirmVisible(false);
      setDeleteError(errorMessage(e, 'Failed to delete log'));
    } finally {
      setDeleting(false);
    }
  }

  if (!isEdit && !procedureId) {
    return (
      <View style={styles.screen}>
        <NavBar title="Log" leading={<BackButton onPress={() => navigation.goBack()} />} />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>This log needs a procedure.</Text>
        </View>
      </View>
    );
  }

  const loadError = isEdit ? error : procedureError;
  if (loadError) {
    return (
      <View style={styles.screen}>
        <NavBar title="Log" leading={<BackButton onPress={() => navigation.goBack()} />} />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>{isEdit ? 'Failed to load log' : 'Failed to load procedure'}</Text>
          <Text style={styles.muted}>{String((loadError as any).message)}</Text>
        </View>
      </View>
    );
  }

  const waiting = isEdit ? !hydrated : procedureLoading && !procedure;
  if (waiting) {
    return (
      <View style={styles.screen}>
        <NavBar
          title={isEdit ? 'Log' : 'New log'}
          leading={<BackButton onPress={() => navigation.goBack()} />}
          trailing={<NavLink label="Save" disabled />}
        />
        <View style={styles.center}>
          {isEdit && !loading && !log ? (
            <Text style={styles.errorTitle}>Log not found</Text>
          ) : !isEdit && !procedureLoading && !procedure ? (
            <Text style={styles.errorTitle}>Procedure not found</Text>
          ) : (
            <>
              <ActivityIndicator size="large" color={colorsLight.primary} />
              <Text style={styles.muted}>Loading…</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  if (!recorded) {
    return (
      <View style={styles.screen}>
        <NavBar title="Log" leading={<BackButton onPress={() => navigation.goBack()} />} />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>{isEdit ? 'Log not found' : 'Procedure not found'}</Text>
        </View>
      </View>
    );
  }

  const saveError =
    formError ?? (createError || updateError ? errorMessage(createError ?? updateError, 'Failed to save log') : null);

  return (
    <View style={styles.screen}>
      <NavBar
        title={isEdit ? 'Log' : 'New log'}
        leading={
          isEdit ? (
            <BackButton onPress={() => navigation.goBack()} />
          ) : (
            <NavLink label="Cancel" onPress={() => navigation.goBack()} />
          )
        }
        trailing={<NavLink label="Save" onPress={onSave} disabled={!canSubmit} loading={submitting} bold />}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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

        {isEdit ? (
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                setDeleteError(null);
                setConfirmVisible(true);
              }}
              hitSlop={6}
              style={styles.deleteWrap}
              disabled={submitting || deleting}
            >
              <Text style={styles.deleteText}>Delete log</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.tipText}>Saving copies the procedure onto this log. A later edit leaves this copy as it was.</Text>
        )}
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  scroll: {
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
    marginTop: 12,
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
  footer: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  deleteWrap: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deleteText: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 15,
    color: colorsLight.danger,
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
