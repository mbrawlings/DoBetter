import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import DateInput from '../components/inputs/DateInput';
import SelectInput from '../components/inputs/SelectInput';
import EventsSection from '../components/sections/EventsSection';
import GiftIdeasSection from '../components/sections/GiftIdeasSection';
import InteractionsSection from '../components/sections/InteractionsSection';
import { RELATIONSHIP_OPTIONS } from '../constants/options';
import { formatDateYmd } from '../utils/date';
import { spacing } from '../theme/theme';
import type { GiftIdeaForm } from '../components/modals/GiftIdeaModal';
import type { InteractionForm } from '../components/modals/InteractionModal';
import type { GiftIdea, Interaction } from '../types';
import {
  GET_PERSON_QUERY,
  GIFT_IDEAS_QUERY,
  INTERACTIONS_QUERY,
  CREATE_PERSON_MUTATION,
  UPDATE_PERSON_MUTATION,
  CREATE_GIFT_IDEA_MUTATION,
  UPDATE_GIFT_IDEA_MUTATION,
  DELETE_GIFT_IDEA_MUTATION,
  CREATE_INTERACTION_MUTATION,
  UPDATE_INTERACTION_MUTATION,
  DELETE_INTERACTION_MUTATION,
} from '../graphql/operations';

function buildPersonInput(fields: {
  firstName: string;
  lastName: string;
  city: string;
  employer: string;
  workRole: string;
  relationship: string;
  birthDate: string;
  interestsCsv: string;
}) {
  const interests = fields.interestsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const input: any = {
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
  };
  if (fields.city) input.city = fields.city;
  if (fields.employer) input.employer = fields.employer;
  if (fields.workRole) input.workRole = fields.workRole;
  if (fields.relationship) input.relationship = fields.relationship;
  if (fields.birthDate) input.birthDate = fields.birthDate;
  if (interests.length) input.interests = interests;
  return input;
}

function SectionLabel({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
      {children}
    </Text>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
      {children}
    </View>
  );
}

export default function PersonFormScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId: string | undefined = route.params?.id;
  const isEdit = Boolean(personId);
  const theme = useTheme();

  const { data, loading, error, refetch } = useQuery(GET_PERSON_QUERY, {
    variables: { id: personId! },
    skip: !isEdit,
  });
  const { data: giftData, refetch: refetchGifts } = useQuery(GIFT_IDEAS_QUERY, {
    variables: { personId: personId! },
    skip: !isEdit,
  });
  const { data: interData, refetch: refetchInter } = useQuery(INTERACTIONS_QUERY, {
    variables: { personId: personId! },
    skip: !isEdit,
  });

  const [createPerson, { loading: creating, error: createError }] = useMutation(CREATE_PERSON_MUTATION);
  const [updatePerson, { loading: updating }] = useMutation(UPDATE_PERSON_MUTATION);
  const [createGiftIdea] = useMutation(CREATE_GIFT_IDEA_MUTATION);
  const [updateGiftIdea] = useMutation(UPDATE_GIFT_IDEA_MUTATION);
  const [deleteGiftIdea] = useMutation(DELETE_GIFT_IDEA_MUTATION);
  const [createInteraction] = useMutation(CREATE_INTERACTION_MUTATION);
  const [updateInteraction] = useMutation(UPDATE_INTERACTION_MUTATION);
  const [deleteInteraction] = useMutation(DELETE_INTERACTION_MUTATION);

  const person = data?.person;
  const saving = creating || updating;

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [employer, setEmployer] = React.useState('');
  const [workRole, setWorkRole] = React.useState('');
  const [relationship, setRelationship] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [interestsCsv, setInterestsCsv] = React.useState('');

  const [localCurrentEvents, setLocalCurrentEvents] = React.useState<string[]>([]);
  const [localUpcomingEvents, setLocalUpcomingEvents] = React.useState<
    Array<{ title: string; date?: string; notes?: string }>
  >([]);
  const [localGiftIdeas, setLocalGiftIdeas] = React.useState<GiftIdea[]>([]);
  const [localInteractions, setLocalInteractions] = React.useState<Interaction[]>([]);

  React.useEffect(() => {
    if (person) {
      setFirstName(person.firstName ?? '');
      setLastName(person.lastName ?? '');
      setCity(person.city ?? '');
      setEmployer(person.employer ?? '');
      setWorkRole(person.workRole ?? '');
      setRelationship(person.relationship ?? '');
      setBirthDate(person.birthDate ? formatDateYmd(new Date(person.birthDate)) : '');
      setInterestsCsv(Array.isArray(person.interests) ? person.interests.join(', ') : '');
    }
  }, [person]);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  function currentPersonInput() {
    return buildPersonInput({ firstName, lastName, city, employer, workRole, relationship, birthDate, interestsCsv });
  }

  async function onSave() {
    if (!canSubmit) return;
    const input = buildPersonInput({ firstName, lastName, city, employer, workRole, relationship, birthDate, interestsCsv });

    if (isEdit) {
      await updatePerson({ variables: { id: personId, input } });
    } else {
      if (localCurrentEvents.length) input.currentEvents = localCurrentEvents;
      if (localUpcomingEvents.length) input.upcomingEvents = localUpcomingEvents;

      const res = await createPerson({ variables: { input } });
      const newId = res?.data?.createPerson?.id as string | undefined;

      if (newId) {
        if (localGiftIdeas.length) {
          await Promise.all(
            localGiftIdeas.map((gi) =>
              createGiftIdea({
                variables: {
                  input: {
                    personId: newId,
                    title: gi.title,
                    notes: gi.notes,
                    occasion: gi.occasion || undefined,
                    status: gi.status || undefined,
                    priority: gi.priority || undefined,
                  },
                },
              }),
            ),
          );
        }
        if (localInteractions.length) {
          await Promise.all(
            localInteractions.map((itx) =>
              createInteraction({
                variables: {
                  input: {
                    personId: newId,
                    summary: itx.summary,
                    date: itx.date,
                    channel: itx.channel,
                    location: itx.location,
                  },
                },
              }),
            ),
          );
        }
      }
    }
    navigation.goBack();
  }

  if (isEdit && loading && !person) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: spacing.md, color: theme.colors.onSurfaceVariant }}>
          Loading\u2026
        </Text>
      </View>
    );
  }
  if (isEdit && error) {
    return (
      <View style={[styles.center, { padding: spacing.lg, backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">Failed to load person</Text>
        <Text style={{ marginTop: spacing.sm, color: theme.colors.onSurfaceVariant }}>
          {String((error as any).message)}
        </Text>
      </View>
    );
  }

  const currentEvents = isEdit ? (person?.currentEvents ?? []) : localCurrentEvents;
  const upcomingEvents = isEdit ? (person?.upcomingEvents ?? []) : localUpcomingEvents;
  const giftIdeas: GiftIdea[] = isEdit ? ((giftData?.giftIdeas ?? []) as any) : localGiftIdeas;
  const interactions: Interaction[] = isEdit ? ((interData?.interactions ?? []) as any) : localInteractions;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Name */}
      <SectionLabel>Name</SectionLabel>
      <FieldGroup>
        <TextInput
          label={isEdit ? 'First Name' : 'First Name *'}
          value={firstName}
          onChangeText={setFirstName}
          mode="flat"
          style={styles.input}
        />
        <View style={[styles.fieldDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
        <TextInput
          label={isEdit ? 'Last Name' : 'Last Name *'}
          value={lastName}
          onChangeText={setLastName}
          mode="flat"
          style={styles.input}
        />
      </FieldGroup>

      {/* Details */}
      <SectionLabel>Details</SectionLabel>
      <FieldGroup>
        <TextInput label="City" value={city} onChangeText={setCity} mode="flat" style={styles.input} />
        <View style={[styles.fieldDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
        <TextInput label="Employer" value={employer} onChangeText={setEmployer} mode="flat" style={styles.input} />
        <View style={[styles.fieldDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
        <TextInput label="Work Role" value={workRole} onChangeText={setWorkRole} mode="flat" style={styles.input} />
        <View style={[styles.fieldDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
        <SelectInput
          label="Relationship"
          value={relationship}
          onChange={setRelationship}
          options={RELATIONSHIP_OPTIONS as unknown as string[]}
          mode="flat"
          style={styles.input}
        />
      </FieldGroup>

      {/* Personal */}
      <SectionLabel>Personal</SectionLabel>
      <FieldGroup>
        <DateInput label="Birth Date" value={birthDate} onChange={(v) => setBirthDate(v)} mode="flat" style={styles.input} />
        <View style={[styles.fieldDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
        <TextInput
          label="Interests (comma-separated)"
          value={interestsCsv}
          onChangeText={setInterestsCsv}
          mode="flat"
          style={styles.input}
        />
      </FieldGroup>

      {/* Events */}
      <EventsSection
        currentEvents={currentEvents}
        upcomingEvents={upcomingEvents}
        onAddCurrent={isEdit
          ? async (text) => {
              const next = [...(person?.currentEvents ?? []), text];
              await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), currentEvents: next } } });
              refetch();
            }
          : (text) => setLocalCurrentEvents((arr) => [...arr, text])
        }
        onEditCurrent={isEdit
          ? async (index, text) => {
              const base = [...(person?.currentEvents ?? [])];
              base[index] = text;
              await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), currentEvents: base } } });
              refetch();
            }
          : (index, text) => setLocalCurrentEvents((arr) => { const next = [...arr]; next[index] = text; return next; })
        }
        onDeleteCurrent={isEdit
          ? async (index) => {
              const base = [...(person?.currentEvents ?? [])].filter((_, i) => i !== index);
              await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), currentEvents: base } } });
              refetch();
            }
          : (index) => setLocalCurrentEvents((arr) => arr.filter((_, i) => i !== index))
        }
        onAddUpcoming={isEdit
          ? async (form) => {
              const payload: any = { title: form.title, date: form.date || undefined, notes: form.notes || undefined };
              const next = [...(person?.upcomingEvents ?? []), payload];
              await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), upcomingEvents: next } } });
              refetch();
            }
          : (form) => setLocalUpcomingEvents((arr) => [...arr, { title: form.title, date: form.date || undefined, notes: form.notes || undefined }])
        }
        onEditUpcoming={isEdit
          ? async (index, form) => {
              const base: any[] = [...(person?.upcomingEvents ?? [])];
              base[index] = { title: form.title, date: form.date || undefined, notes: form.notes || undefined };
              await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), upcomingEvents: base } } });
              refetch();
            }
          : (index, form) => setLocalUpcomingEvents((arr) => { const next = [...arr]; next[index] = { title: form.title, date: form.date || undefined, notes: form.notes || undefined }; return next; })
        }
        onDeleteUpcoming={isEdit
          ? async (index) => {
              const base = [...(person?.upcomingEvents ?? [])].filter((_, i) => i !== index);
              await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), upcomingEvents: base } } });
              refetch();
            }
          : (index) => setLocalUpcomingEvents((arr) => arr.filter((_, i) => i !== index))
        }
      />

      <GiftIdeasSection
        items={giftIdeas}
        onAdd={isEdit
          ? async (form: GiftIdeaForm) => {
              await createGiftIdea({ variables: { input: { personId, title: form.title, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined } } });
              refetchGifts();
            }
          : (form) => setLocalGiftIdeas((arr) => [...arr, { title: form.title, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined }])
        }
        onEdit={isEdit
          ? async (index, form) => {
              const item = (giftData?.giftIdeas ?? [])[index] as any;
              if (!item?.id) return;
              await updateGiftIdea({ variables: { id: item.id, input: { title: form.title || undefined, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined } } });
              refetchGifts();
            }
          : (index, form) => setLocalGiftIdeas((arr) => { const next = [...arr]; next[index] = { title: form.title, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined }; return next; })
        }
        onDelete={isEdit
          ? async (index) => {
              const item = (giftData?.giftIdeas ?? [])[index] as any;
              if (!item?.id) return;
              await deleteGiftIdea({ variables: { id: item.id } });
              refetchGifts();
            }
          : (index) => setLocalGiftIdeas((arr) => arr.filter((_, i) => i !== index))
        }
      />

      <InteractionsSection
        items={interactions}
        onAdd={isEdit
          ? async (form: InteractionForm) => {
              await createInteraction({ variables: { input: { personId, summary: form.summary, date: form.date || undefined, channel: form.channel || undefined, location: form.location || undefined } } });
              refetchInter();
            }
          : (form) => setLocalInteractions((arr) => [...arr, { ...form }])
        }
        onEdit={isEdit
          ? async (index, form) => {
              const item = (interData?.interactions ?? [])[index] as any;
              if (!item?.id) return;
              await updateInteraction({ variables: { id: item.id, input: { summary: form.summary || undefined, date: form.date || undefined, channel: form.channel || undefined, location: form.location || undefined } } });
              refetchInter();
            }
          : (index, form) => setLocalInteractions((arr) => { const next = [...arr]; next[index] = { ...form }; return next; })
        }
        onDelete={isEdit
          ? async (index) => {
              const item = (interData?.interactions ?? [])[index] as any;
              if (!item?.id) return;
              await deleteInteraction({ variables: { id: item.id } });
              refetchInter();
            }
          : (index) => setLocalInteractions((arr) => arr.filter((_, i) => i !== index))
        }
      />

      {createError ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {String((createError as any).message)}
        </Text>
      ) : null}

      <Button
        mode="contained"
        onPress={onSave}
        loading={saving}
        disabled={!canSubmit || saving}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        labelStyle={styles.saveButtonLabel}
      >
        Save
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  fieldGroup: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorText: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: spacing.xxl,
    borderRadius: 14,
  },
  saveButtonContent: {
    paddingVertical: spacing.sm,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
