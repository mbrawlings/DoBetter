import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from '@apollo/client';
import { formatHumanDate } from '../components/inputs/DateInput';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import { BackButton, NavBar, NavLink, SectionLabel } from '../components/ui';
import {
  CREATE_PROCEDURE_MUTATION,
  DELETE_PROCEDURE_MUTATION,
  PROCEDURE_LOGS_QUERY,
  PROCEDURE_QUERY,
  UPDATE_PROCEDURE_MUTATION,
} from '../graphql/operations';
import { colorsLight, fontFamily, radius } from '../theme/theme';
import { formatCost, formatMeter } from '../utils/log';
import { MoveDirection, moveItem } from '../utils/procedure';

const TITLE_MAX = 200;
const LINE_MAX = 500;

type TextLine = { key: string; text: string };
type PartLine = { key: string; name: string; quantity: string };
type SpecLine = { key: string; label: string; value: string };

type ProcedureFields = {
  id: string;
  title: string;
  steps?: string[] | null;
  parts?: { name: string; quantity?: string | null }[] | null;
  tools?: string[] | null;
  specs?: { label: string; value: string }[] | null;
};

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function RowActions({
  index,
  count,
  label,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  label: string;
  onMove: (index: number, direction: MoveDirection) => void;
  onRemove: (index: number) => void;
}) {
  const upDisabled = index === 0;
  const downDisabled = index >= count - 1;
  return (
    <View style={styles.actions}>
      <Pressable
        onPress={() => onMove(index, 'up')}
        disabled={upDisabled}
        hitSlop={6}
        accessibilityLabel={`Move ${label} up`}
      >
        <Icon source="chevron-up" size={18} color={upDisabled ? colorsLight.textFaint : colorsLight.text} />
      </Pressable>
      <Pressable
        onPress={() => onMove(index, 'down')}
        disabled={downDisabled}
        hitSlop={6}
        accessibilityLabel={`Move ${label} down`}
      >
        <Icon source="chevron-down" size={18} color={downDisabled ? colorsLight.textFaint : colorsLight.text} />
      </Pressable>
      <Pressable onPress={() => onRemove(index)} hitSlop={6} accessibilityLabel={`Remove ${label}`}>
        <Icon source="close" size={16} color={colorsLight.textMuted} />
      </Pressable>
    </View>
  );
}

export default function ProcedureFormScreen({ navigation }: any) {
  const route = useRoute() as any;
  const assetId: string | undefined = route.params?.assetId;
  const procedureId: string | undefined = route.params?.id;
  const isEdit = Boolean(procedureId);
  const keyRef = React.useRef(0);

  function nextKey() {
    keyRef.current += 1;
    return `line-${keyRef.current}`;
  }

  const { data, loading, error } = useQuery(PROCEDURE_QUERY, {
    variables: { id: procedureId! },
    skip: !isEdit,
    fetchPolicy: 'cache-and-network',
  });
  const procedure = data?.procedure as ProcedureFields | null | undefined;

  const { data: logsData, refetch: refetchLogs } = useQuery(PROCEDURE_LOGS_QUERY, {
    variables: { procedureId: procedureId! },
    skip: !isEdit || !procedureId,
    fetchPolicy: 'cache-and-network',
  });
  const procedureLogs: {
    id: string;
    date?: string | null;
    cost?: number | null;
    meter?: { unit: string; value: number } | null;
  }[] = logsData?.logs ?? [];

  useFocusEffect(
    React.useCallback(() => {
      if (!isEdit || !procedureId) return;
      refetchLogs();
    }, [isEdit, procedureId, refetchLogs]),
  );

  const [createProcedure, { error: createError }] = useMutation(CREATE_PROCEDURE_MUTATION);
  const [updateProcedure, { error: updateError }] = useMutation(UPDATE_PROCEDURE_MUTATION);
  const [deleteProcedure] = useMutation(DELETE_PROCEDURE_MUTATION);

  const [title, setTitle] = React.useState('');
  const [steps, setSteps] = React.useState<TextLine[]>([]);
  const [parts, setParts] = React.useState<PartLine[]>([]);
  const [tools, setTools] = React.useState<TextLine[]>([]);
  const [specs, setSpecs] = React.useState<SpecLine[]>([]);
  const [hydrated, setHydrated] = React.useState(!isEdit);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!procedure || hydrated) return;
    setTitle(procedure.title ?? '');
    setSteps((procedure.steps ?? []).map((text) => ({ key: nextKey(), text })));
    setParts(
      (procedure.parts ?? []).map((part) => ({
        key: nextKey(),
        name: part.name ?? '',
        quantity: part.quantity ?? '',
      })),
    );
    setTools((procedure.tools ?? []).map((text) => ({ key: nextKey(), text })));
    setSpecs(
      (procedure.specs ?? []).map((spec) => ({
        key: nextKey(),
        label: spec.label ?? '',
        value: spec.value ?? '',
      })),
    );
    setHydrated(true);
  }, [procedure, hydrated]);

  const canSubmit = title.trim().length > 0 && Boolean(assetId) && !submitting;

  function buildDocument() {
    const nextSpecs: { label: string; value: string }[] = [];
    for (const spec of specs) {
      const label = spec.label.trim();
      const value = spec.value.trim();
      if (!label && !value) continue;
      if (!label || !value) {
        return { error: 'Each spec needs a label and a value.' as const };
      }
      nextSpecs.push({ label, value });
    }
    return {
      document: {
        title: title.trim(),
        steps: steps.map((step) => step.text.trim()).filter((step) => step.length > 0),
        parts: parts
          .map((part) => ({
            name: part.name.trim(),
            quantity: part.quantity.trim() ? part.quantity.trim() : null,
          }))
          .filter((part) => part.name.length > 0),
        tools: tools.map((tool) => tool.text.trim()).filter((tool) => tool.length > 0),
        specs: nextSpecs,
      },
    };
  }

  async function onSave() {
    if (!canSubmit || !assetId) return;
    const built = buildDocument();
    if (!('document' in built)) {
      setFormError(built.error);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateProcedure({
          variables: { id: procedureId, input: built.document },
          refetchQueries: ['Procedures'],
        });
      } else {
        await createProcedure({
          variables: { input: { assetId, ...built.document } },
          refetchQueries: ['Procedures'],
        });
      }
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  }

  async function onConfirmDelete() {
    if (!procedureId || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data: result } = await deleteProcedure({
        variables: { id: procedureId },
        refetchQueries: ['Procedures'],
      });
      if (!result?.deleteProcedure) throw new Error('Failed to delete procedure');
      setConfirmVisible(false);
      navigation.goBack();
    } catch (e) {
      setConfirmVisible(false);
      setDeleteError(errorMessage(e, 'Failed to delete procedure'));
    } finally {
      setDeleting(false);
    }
  }

  if (!assetId) {
    return (
      <View style={styles.screen}>
        <NavBar title="Procedure" leading={<BackButton onPress={() => navigation.goBack()} />} />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>This procedure needs an asset.</Text>
        </View>
      </View>
    );
  }

  if (isEdit && error) {
    return (
      <View style={styles.screen}>
        <NavBar title="Procedure" leading={<BackButton onPress={() => navigation.goBack()} />} />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>Failed to load procedure</Text>
          <Text style={styles.muted}>{String((error as any).message)}</Text>
        </View>
      </View>
    );
  }

  if (isEdit && !hydrated) {
    return (
      <View style={styles.screen}>
        <NavBar
          title="Procedure"
          leading={<BackButton onPress={() => navigation.goBack()} />}
          trailing={<NavLink label="Save" disabled />}
        />
        <View style={styles.center}>
          {loading || procedure ? (
            <>
              <ActivityIndicator size="large" color={colorsLight.primary} />
              <Text style={styles.muted}>Loading…</Text>
            </>
          ) : (
            <Text style={styles.errorTitle}>Procedure not found</Text>
          )}
        </View>
      </View>
    );
  }

  const saveError = formError ?? (createError || updateError ? errorMessage(createError ?? updateError, 'Failed to save procedure') : null);

  return (
    <View style={styles.screen}>
      <NavBar
        title={isEdit ? 'Procedure' : 'New procedure'}
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
        <SectionLabel>Job</SectionLabel>
        <View style={styles.group}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Anode"
            placeholderTextColor={colorsLight.textFaint}
            style={styles.titleInput}
            maxLength={TITLE_MAX}
            autoCapitalize="sentences"
          />
        </View>

        <SectionLabel action={{ label: 'Add', onPress: () => setSteps((rows) => [...rows, { key: nextKey(), text: '' }]) }}>
          Steps
        </SectionLabel>
        {steps.length > 0 ? (
          <View style={styles.group}>
            {steps.map((step, index) => (
              <View key={step.key} style={[styles.line, index < steps.length - 1 ? styles.divider : null]}>
                <Text style={styles.order}>{index + 1}</Text>
                <TextInput
                  value={step.text}
                  onChangeText={(text) =>
                    setSteps((rows) => rows.map((row) => (row.key === step.key ? { ...row, text } : row)))
                  }
                  placeholder="What to do"
                  placeholderTextColor={colorsLight.textFaint}
                  style={styles.lineInput}
                  maxLength={LINE_MAX}
                />
                <RowActions
                  index={index}
                  count={steps.length}
                  label="step"
                  onMove={(rowIndex, direction) => setSteps((rows) => moveItem(rows, rowIndex, direction))}
                  onRemove={(rowIndex) => setSteps((rows) => rows.filter((_, i) => i !== rowIndex))}
                />
              </View>
            ))}
          </View>
        ) : null}

        <SectionLabel
          action={{
            label: 'Add',
            onPress: () => setParts((rows) => [...rows, { key: nextKey(), name: '', quantity: '' }]),
          }}
        >
          Parts
        </SectionLabel>
        {parts.length > 0 ? (
          <View style={styles.group}>
            {parts.map((part, index) => (
              <View key={part.key} style={[styles.line, index < parts.length - 1 ? styles.divider : null]}>
                <TextInput
                  value={part.name}
                  onChangeText={(name) =>
                    setParts((rows) => rows.map((row) => (row.key === part.key ? { ...row, name } : row)))
                  }
                  placeholder="Part"
                  placeholderTextColor={colorsLight.textFaint}
                  style={[styles.lineInput, styles.partName]}
                  maxLength={LINE_MAX}
                />
                <TextInput
                  value={part.quantity}
                  onChangeText={(quantity) =>
                    setParts((rows) => rows.map((row) => (row.key === part.key ? { ...row, quantity } : row)))
                  }
                  placeholder="Qty"
                  placeholderTextColor={colorsLight.textFaint}
                  style={styles.quantityInput}
                  maxLength={LINE_MAX}
                />
                <RowActions
                  index={index}
                  count={parts.length}
                  label="part"
                  onMove={(rowIndex, direction) => setParts((rows) => moveItem(rows, rowIndex, direction))}
                  onRemove={(rowIndex) => setParts((rows) => rows.filter((_, i) => i !== rowIndex))}
                />
              </View>
            ))}
          </View>
        ) : null}

        <SectionLabel action={{ label: 'Add', onPress: () => setTools((rows) => [...rows, { key: nextKey(), text: '' }]) }}>
          Tools
        </SectionLabel>
        {tools.length > 0 ? (
          <View style={styles.group}>
            {tools.map((tool, index) => (
              <View key={tool.key} style={[styles.line, index < tools.length - 1 ? styles.divider : null]}>
                <TextInput
                  value={tool.text}
                  onChangeText={(text) =>
                    setTools((rows) => rows.map((row) => (row.key === tool.key ? { ...row, text } : row)))
                  }
                  placeholder="Tool"
                  placeholderTextColor={colorsLight.textFaint}
                  style={styles.lineInput}
                  maxLength={LINE_MAX}
                />
                <RowActions
                  index={index}
                  count={tools.length}
                  label="tool"
                  onMove={(rowIndex, direction) => setTools((rows) => moveItem(rows, rowIndex, direction))}
                  onRemove={(rowIndex) => setTools((rows) => rows.filter((_, i) => i !== rowIndex))}
                />
              </View>
            ))}
          </View>
        ) : null}

        <SectionLabel
          action={{
            label: 'Add',
            onPress: () => setSpecs((rows) => [...rows, { key: nextKey(), label: '', value: '' }]),
          }}
        >
          Specs
        </SectionLabel>
        {specs.length > 0 ? (
          <View style={styles.group}>
            {specs.map((spec, index) => (
              <View key={spec.key} style={[styles.line, index < specs.length - 1 ? styles.divider : null]}>
                <TextInput
                  value={spec.label}
                  onChangeText={(label) =>
                    setSpecs((rows) => rows.map((row) => (row.key === spec.key ? { ...row, label } : row)))
                  }
                  placeholder="Label"
                  placeholderTextColor={colorsLight.textFaint}
                  style={[styles.lineInput, styles.specLabel]}
                  maxLength={LINE_MAX}
                />
                <TextInput
                  value={spec.value}
                  onChangeText={(value) =>
                    setSpecs((rows) => rows.map((row) => (row.key === spec.key ? { ...row, value } : row)))
                  }
                  placeholder="Value"
                  placeholderTextColor={colorsLight.textFaint}
                  style={styles.lineInput}
                  maxLength={LINE_MAX}
                />
                <RowActions
                  index={index}
                  count={specs.length}
                  label="spec"
                  onMove={(rowIndex, direction) => setSpecs((rows) => moveItem(rows, rowIndex, direction))}
                  onRemove={(rowIndex) => setSpecs((rows) => rows.filter((_, i) => i !== rowIndex))}
                />
              </View>
            ))}
          </View>
        ) : null}

        {isEdit && procedureId ? (
          <>
            <SectionLabel
              action={{ label: 'Add', onPress: () => navigation.push('Log', { procedureId }) }}
            >
              Last done
            </SectionLabel>
            {procedureLogs[0] ? (
              <View style={styles.group}>
                <Pressable
                  onPress={() => navigation.push('Log', { procedureId, id: procedureLogs[0].id })}
                  style={styles.logRow}
                >
                  <Text style={styles.logLabel}>
                    {[
                      formatHumanDate(procedureLogs[0].date ?? ''),
                      formatCost(procedureLogs[0].cost),
                      formatMeter(procedureLogs[0].meter),
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Log'}
                  </Text>
                  <Icon source="chevron-right" size={18} color={colorsLight.textFaint} />
                </Pressable>
              </View>
            ) : (
              <Text style={styles.emptyLogs}>Not logged yet.</Text>
            )}
          </>
        ) : null}

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
              <Text style={styles.deleteText}>Delete procedure</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.tipText}>This is the how-to for one job. Saving replaces this document.</Text>
        )}
      </ScrollView>

      <ConfirmSheet
        visible={confirmVisible}
        title="Delete procedure?"
        message={
          title.trim()
            ? `Delete ${title.trim()} and its logs? This can't be undone.`
            : "Delete this procedure and its logs? This can't be undone."
        }
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
  },
  titleInput: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colorsLight.text,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colorsLight.border,
  },
  order: {
    width: 18,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    textAlign: 'right',
  },
  lineInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colorsLight.text,
    paddingVertical: 6,
    minWidth: 0,
  },
  partName: {
    flex: 2,
  },
  quantityInput: {
    width: 72,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colorsLight.text,
    paddingVertical: 6,
  },
  specLabel: {
    flex: 1,
  },
  emptyLogs: {
    marginHorizontal: 24,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colorsLight.textMuted,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logLabel: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
