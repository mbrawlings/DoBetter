import * as React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from '@apollo/client';
import ChipInput from '../components/inputs/ChipInput';
import DateInput from '../components/inputs/DateInput';
import SelectInput from '../components/inputs/SelectInput';
import EventsSection from '../components/sections/EventsSection';
import GiftIdeasSection from '../components/sections/GiftIdeasSection';
import InteractionsSection from '../components/sections/InteractionsSection';
import {
  Avatar,
  BackButton,
  FieldGroup,
  FieldRow,
  NavBar,
  NavLink,
  PrimaryButton,
  SectionLabel,
} from '../components/ui';
import { RELATIONSHIP_OPTIONS } from '../constants/options';
import { formatDateYmd } from '../utils/date';
import { colorsLight, fontFamily } from '../theme/theme';
import type { GiftIdeaForm } from '../components/modals/GiftIdeaModal';
import type { InteractionForm } from '../components/modals/InteractionModal';
import type { GiftIdea, Interaction } from '../types';
import {
  CREATE_GIFT_IDEA_MUTATION,
  CREATE_INTERACTION_MUTATION,
  CREATE_PERSON_MUTATION,
  DELETE_GIFT_IDEA_MUTATION,
  DELETE_INTERACTION_MUTATION,
  GET_PERSON_QUERY,
  GIFT_IDEAS_QUERY,
  INTERACTIONS_QUERY,
  UPDATE_GIFT_IDEA_MUTATION,
  UPDATE_INTERACTION_MUTATION,
  UPDATE_PERSON_MUTATION,
} from '../graphql/operations';

function buildPersonInput(fields: {
  firstName: string;
  lastName: string;
  city: string;
  employer: string;
  workRole: string;
  relationship: string;
  birthDate: string;
  interests: string[];
}) {
  const input: any = {
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
  };
  if (fields.city) input.city = fields.city;
  if (fields.employer) input.employer = fields.employer;
  if (fields.workRole) input.workRole = fields.workRole;
  if (fields.relationship) input.relationship = fields.relationship;
  if (fields.birthDate) input.birthDate = fields.birthDate;
  if (fields.interests.length) input.interests = fields.interests;
  return input;
}

export default function PersonFormScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId: string | undefined = route.params?.id;
  const isEdit = Boolean(personId);

  const { data, loading, error, refetch } = useQuery(GET_PERSON_QUERY, {
    variables: { id: personId! },
    skip: !isEdit,
    fetchPolicy: 'cache-and-network',
  });
  const { data: giftData, refetch: refetchGifts } = useQuery(GIFT_IDEAS_QUERY, {
    variables: { personId: personId! },
    skip: !isEdit,
    fetchPolicy: 'cache-and-network',
  });
  const { data: interData, refetch: refetchInter } = useQuery(INTERACTIONS_QUERY, {
    variables: { personId: personId! },
    skip: !isEdit,
    fetchPolicy: 'cache-and-network',
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
  const [interests, setInterests] = React.useState<string[]>([]);

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
      setInterests(Array.isArray(person.interests) ? person.interests : []);
    }
  }, [person]);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  function currentPersonInput() {
    return buildPersonInput({
      firstName,
      lastName,
      city,
      employer,
      workRole,
      relationship,
      birthDate,
      interests,
    });
  }

  async function onSave() {
    if (!canSubmit) return;
    const input = buildPersonInput({
      firstName,
      lastName,
      city,
      employer,
      workRole,
      relationship,
      birthDate,
      interests,
    });

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

  function onDeletePerson() {
    // Backend currently has no deletePerson mutation; the destructive UI is wired per the design spec
    // and falls back to navigating away. Wire to a mutation once the API exposes one.
    Alert.alert(
      'Delete person',
      `Are you sure you want to delete ${firstName} ${lastName}? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }

  if (isEdit && loading && !person) {
    return (
      <View style={styles.screen}>
        <NavBar
          title="Edit"
          leading={<BackButton onPress={() => navigation.goBack()} />}
          trailing={<NavLink label="Save" disabled />}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colorsLight.primary} />
          <Text style={styles.muted}>Loading…</Text>
        </View>
      </View>
    );
  }
  if (isEdit && error) {
    return (
      <View style={styles.screen}>
        <NavBar
          title="Edit"
          leading={<BackButton onPress={() => navigation.goBack()} />}
        />
        <View style={[styles.center, { padding: 16 }]}>
          <Text style={styles.errorTitle}>Failed to load person</Text>
          <Text style={styles.muted}>{String((error as any).message)}</Text>
        </View>
      </View>
    );
  }

  const currentEvents = isEdit ? person?.currentEvents ?? [] : localCurrentEvents;
  const upcomingEvents = isEdit ? person?.upcomingEvents ?? [] : localUpcomingEvents;
  const giftIdeas: GiftIdea[] = isEdit ? ((giftData?.giftIdeas ?? []) as any) : localGiftIdeas;
  const interactions: Interaction[] = isEdit ? ((interData?.interactions ?? []) as any) : localInteractions;

  const headerTitle = isEdit ? 'Edit' : 'New person';
  const photoLinkLabel = isEdit ? 'Change photo' : 'Add photo';

  return (
    <View style={styles.screen}>
      <NavBar
        title={headerTitle}
        leading={
          isEdit ? (
            <BackButton onPress={() => navigation.goBack()} />
          ) : (
            <NavLink label="Cancel" onPress={() => navigation.goBack()} />
          )
        }
        trailing={
          <NavLink
            label="Save"
            onPress={onSave}
            disabled={!canSubmit || saving}
            bold
          />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarHeader}>
          {isEdit ? (
            <Avatar firstName={firstName} lastName={lastName} size={84} />
          ) : (
            <Avatar size={84} placeholder />
          )}
          <Pressable hitSlop={6}>
            <Text style={styles.photoLink}>{photoLinkLabel}</Text>
          </Pressable>
        </View>

        <SectionLabel>Name</SectionLabel>
        <FieldGroup>
          <FieldRow
            label="First"
            value={firstName}
            onChangeText={setFirstName}
            required={!isEdit}
            placeholder="Required"
            textInputProps={{ autoCapitalize: 'words', autoCorrect: false }}
          />
          <FieldRow
            label="Last"
            value={lastName}
            onChangeText={setLastName}
            required={!isEdit}
            placeholder="Required"
            textInputProps={{ autoCapitalize: 'words', autoCorrect: false }}
          />
        </FieldGroup>

        <SectionLabel>Details</SectionLabel>
        <FieldGroup>
          <FieldRow label="City" value={city} onChangeText={setCity} placeholder="Optional" />
          <FieldRow label="Employer" value={employer} onChangeText={setEmployer} placeholder="Optional" />
          <FieldRow label="Role" value={workRole} onChangeText={setWorkRole} placeholder="Optional" />
          <SelectInput
            label="Relationship"
            value={relationship}
            onChange={setRelationship}
            options={RELATIONSHIP_OPTIONS as unknown as string[]}
          />
        </FieldGroup>

        <SectionLabel>Personal</SectionLabel>
        <FieldGroup>
          <DateInput label="Birthday" value={birthDate} onChange={(v) => setBirthDate(v)} />
          <ChipInput label="Interests" values={interests} onChange={setInterests} />
        </FieldGroup>

        <EventsSection
          currentEvents={currentEvents}
          upcomingEvents={upcomingEvents}
          onAddCurrent={
            isEdit
              ? async (text) => {
                  const next = [...(person?.currentEvents ?? []), text];
                  await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), currentEvents: next } } });
                  refetch();
                }
              : (text) => setLocalCurrentEvents((arr) => [...arr, text])
          }
          onEditCurrent={
            isEdit
              ? async (index, text) => {
                  const base = [...(person?.currentEvents ?? [])];
                  base[index] = text;
                  await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), currentEvents: base } } });
                  refetch();
                }
              : (index, text) => setLocalCurrentEvents((arr) => { const next = [...arr]; next[index] = text; return next; })
          }
          onDeleteCurrent={
            isEdit
              ? async (index) => {
                  const base = [...(person?.currentEvents ?? [])].filter((_, i) => i !== index);
                  await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), currentEvents: base } } });
                  refetch();
                }
              : (index) => setLocalCurrentEvents((arr) => arr.filter((_, i) => i !== index))
          }
          onAddUpcoming={
            isEdit
              ? async (form) => {
                  const payload: any = { title: form.title, date: form.date || undefined, notes: form.notes || undefined };
                  const next = [...(person?.upcomingEvents ?? []), payload];
                  await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), upcomingEvents: next } } });
                  refetch();
                }
              : (form) =>
                  setLocalUpcomingEvents((arr) => [
                    ...arr,
                    { title: form.title, date: form.date || undefined, notes: form.notes || undefined },
                  ])
          }
          onEditUpcoming={
            isEdit
              ? async (index, form) => {
                  const base: any[] = [...(person?.upcomingEvents ?? [])];
                  base[index] = { title: form.title, date: form.date || undefined, notes: form.notes || undefined };
                  await updatePerson({ variables: { id: personId, input: { ...currentPersonInput(), upcomingEvents: base } } });
                  refetch();
                }
              : (index, form) =>
                  setLocalUpcomingEvents((arr) => {
                    const next = [...arr];
                    next[index] = { title: form.title, date: form.date || undefined, notes: form.notes || undefined };
                    return next;
                  })
          }
          onDeleteUpcoming={
            isEdit
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
          onAdd={
            isEdit
              ? async (form: GiftIdeaForm) => {
                  await createGiftIdea({
                    variables: {
                      input: {
                        personId,
                        title: form.title,
                        notes: form.notes || undefined,
                        occasion: form.occasion || undefined,
                        status: form.status || undefined,
                        priority: form.priority ? Number(form.priority) : undefined,
                      },
                    },
                  });
                  refetchGifts();
                }
              : (form) =>
                  setLocalGiftIdeas((arr) => [
                    ...arr,
                    {
                      title: form.title,
                      notes: form.notes || undefined,
                      occasion: form.occasion || undefined,
                      status: form.status || undefined,
                      priority: form.priority ? Number(form.priority) : undefined,
                    },
                  ])
          }
          onEdit={
            isEdit
              ? async (index, form) => {
                  const item = (giftData?.giftIdeas ?? [])[index] as any;
                  if (!item?.id) return;
                  await updateGiftIdea({
                    variables: {
                      id: item.id,
                      input: {
                        title: form.title || undefined,
                        notes: form.notes || undefined,
                        occasion: form.occasion || undefined,
                        status: form.status || undefined,
                        priority: form.priority ? Number(form.priority) : undefined,
                      },
                    },
                  });
                  refetchGifts();
                }
              : (index, form) =>
                  setLocalGiftIdeas((arr) => {
                    const next = [...arr];
                    next[index] = {
                      title: form.title,
                      notes: form.notes || undefined,
                      occasion: form.occasion || undefined,
                      status: form.status || undefined,
                      priority: form.priority ? Number(form.priority) : undefined,
                    };
                    return next;
                  })
          }
          onDelete={
            isEdit
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
          onAdd={
            isEdit
              ? async (form: InteractionForm) => {
                  await createInteraction({
                    variables: {
                      input: {
                        personId,
                        summary: form.summary,
                        date: form.date || undefined,
                        channel: form.channel || undefined,
                        location: form.location || undefined,
                      },
                    },
                  });
                  refetchInter();
                }
              : (form) => setLocalInteractions((arr) => [...arr, { ...form }])
          }
          onEdit={
            isEdit
              ? async (index, form) => {
                  const item = (interData?.interactions ?? [])[index] as any;
                  if (!item?.id) return;
                  await updateInteraction({
                    variables: {
                      id: item.id,
                      input: {
                        summary: form.summary || undefined,
                        date: form.date || undefined,
                        channel: form.channel || undefined,
                        location: form.location || undefined,
                      },
                    },
                  });
                  refetchInter();
                }
              : (index, form) =>
                  setLocalInteractions((arr) => {
                    const next = [...arr];
                    next[index] = { ...form };
                    return next;
                  })
          }
          onDelete={
            isEdit
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
          <Text style={styles.errorBody}>{String((createError as any).message)}</Text>
        ) : null}

        <View style={styles.footer}>
          {isEdit ? (
            <>
              <PrimaryButton
                full
                label="Save changes"
                onPress={onSave}
                loading={saving}
                disabled={!canSubmit}
              />
              <Pressable onPress={onDeletePerson} hitSlop={6} style={styles.deleteWrap}>
                <Text style={styles.deleteText}>Delete person</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.tipText}>
              Only first and last name are required. You can add events, gifts, and moments after saving.
            </Text>
          )}
        </View>
      </ScrollView>
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
  },
  errorBody: {
    marginTop: 4,
    marginHorizontal: 16,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    color: colorsLight.danger,
  },
  avatarHeader: {
    alignItems: 'center',
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  photoLink: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
  footer: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  deleteWrap: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deleteText: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 15,
    color: colorsLight.danger,
    includeFontPadding: false,
  },
  tipText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colorsLight.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});
