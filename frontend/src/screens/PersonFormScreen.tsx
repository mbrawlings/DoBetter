import * as React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from '@apollo/client';
import ChipInput from '../components/inputs/ChipInput';
import DateInput, { toYmd } from '../components/inputs/DateInput';
import SelectInput from '../components/inputs/SelectInput';
import {
  Avatar,
  BackButton,
  FieldGroup,
  FieldRow,
  NavBar,
  NavLink,
  SectionLabel,
} from '../components/ui';
import { RELATIONSHIP_OPTIONS } from '../constants/options';
import { colorsLight, fontFamily } from '../theme/theme';
import { buildPersonInput } from '../utils/person';
import {
  CREATE_PERSON_MUTATION,
  GET_PERSON_QUERY,
  UPDATE_PERSON_MUTATION,
} from '../graphql/operations';

export default function PersonFormScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId: string | undefined = route.params?.id;
  const isEdit = Boolean(personId);

  const { data, loading, error } = useQuery(GET_PERSON_QUERY, {
    variables: { id: personId! },
    skip: !isEdit,
    fetchPolicy: 'cache-and-network',
  });

  const [createPerson, { error: createError }] = useMutation(CREATE_PERSON_MUTATION);
  const [updatePerson] = useMutation(UPDATE_PERSON_MUTATION);

  const person = data?.person;
  const [submitting, setSubmitting] = React.useState(false);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [employer, setEmployer] = React.useState('');
  const [workRole, setWorkRole] = React.useState('');
  const [relationship, setRelationship] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [interests, setInterests] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (person) {
      setFirstName(person.firstName ?? '');
      setLastName(person.lastName ?? '');
      setCity(person.city ?? '');
      setEmployer(person.employer ?? '');
      setWorkRole(person.workRole ?? '');
      setRelationship(person.relationship ?? '');
      setBirthDate(person.birthDate ? toYmd(person.birthDate) : '');
      setInterests(Array.isArray(person.interests) ? person.interests : []);
    }
  }, [person]);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  async function onSave() {
    if (!canSubmit || submitting) return;
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

    setSubmitting(true);
    try {
      if (isEdit) {
        await updatePerson({ variables: { id: personId, input } });
      } else {
        await createPerson({ variables: { input } });
      }
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
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
            disabled={!canSubmit}
            loading={submitting}
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

        {createError ? (
          <Text style={styles.errorBody}>{String((createError as any).message)}</Text>
        ) : null}

        <View style={styles.footer}>
          {isEdit ? (
            <Pressable onPress={onDeletePerson} hitSlop={6} style={styles.deleteWrap}>
              <Text style={styles.deleteText}>Delete person</Text>
            </Pressable>
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
