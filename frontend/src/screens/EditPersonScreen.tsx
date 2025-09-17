import * as React from "react";
import { ScrollView, View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_PERSON_QUERY,
  GIFT_IDEAS_QUERY,
  INTERACTIONS_QUERY,
  UPDATE_PERSON_MUTATION,
  CREATE_GIFT_IDEA_MUTATION,
  UPDATE_GIFT_IDEA_MUTATION,
  DELETE_GIFT_IDEA_MUTATION,
  CREATE_INTERACTION_MUTATION,
  UPDATE_INTERACTION_MUTATION,
  DELETE_INTERACTION_MUTATION,
} from "../graphql/operations";
import SelectInput from "../components/inputs/SelectInput";
import DateInput from "../components/inputs/DateInput";
import { GiftIdeaForm } from "../components/modals/GiftIdeaModal";
import { InteractionForm } from "../components/modals/InteractionModal";
import EventsSection from "../components/sections/EventsSection";
import GiftIdeasSection from "../components/sections/GiftIdeasSection";
import InteractionsSection from "../components/sections/InteractionsSection";
import { RELATIONSHIP_OPTIONS } from "../constants/options";

export default function EditPersonScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId = route.params?.id as string;
  const { data, loading, error, refetch } = useQuery(GET_PERSON_QUERY, {
    variables: { id: personId },
  });
  const { data: giftData, refetch: refetchGifts } = useQuery(GIFT_IDEAS_QUERY, {
    variables: { personId },
  });
  const { data: interData, refetch: refetchInter } = useQuery(INTERACTIONS_QUERY, {
    variables: { personId },
  });
  const [updatePerson, { loading: saving }] = useMutation(UPDATE_PERSON_MUTATION);
  const [createGiftIdea] = useMutation(CREATE_GIFT_IDEA_MUTATION);
  const [updateGiftIdea] = useMutation(UPDATE_GIFT_IDEA_MUTATION);
  const [deleteGiftIdea] = useMutation(DELETE_GIFT_IDEA_MUTATION);
  const [createInteraction] = useMutation(CREATE_INTERACTION_MUTATION);
  const [updateInteraction] = useMutation(UPDATE_INTERACTION_MUTATION);
  const [deleteInteraction] = useMutation(DELETE_INTERACTION_MUTATION);

  const person = data?.person;

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [employer, setEmployer] = React.useState("");
  const [workRole, setWorkRole] = React.useState("");
  const [relationship, setRelationship] = React.useState("");
  const [birthDate, setBirthDate] = React.useState<string>("");
  const [interestsCsv, setInterestsCsv] = React.useState("");

  // Modals handled by reusable sections

  React.useEffect(() => {
    if (person) {
      setFirstName(person.firstName ?? "");
      setLastName(person.lastName ?? "");
      setCity(person.city ?? "");
      setEmployer(person.employer ?? "");
      setWorkRole(person.workRole ?? "");
      setRelationship(person.relationship ?? "");
      setBirthDate(person.birthDate ? formatDateYmd(new Date(person.birthDate)) : "");
      setInterestsCsv(Array.isArray(person.interests) ? person.interests.join(", ") : "");
    }
  }, [person]);

  function formatDateYmd(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  async function onSave() {
    const interests = interestsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const input: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };
    if (city) input.city = city;
    if (employer) input.employer = employer;
    if (workRole) input.workRole = workRole;
    if (relationship) input.relationship = relationship;
    if (birthDate) input.birthDate = birthDate;
    if (interests.length) input.interests = interests;

    await updatePerson({ variables: { id: personId, input } });
    navigation.goBack();
  }

  if (loading && !person) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text variant="titleMedium">Failed to load person</Text>
        <Text style={{ marginTop: 8 }}>{String((error as any).message)}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        Edit Person
      </Text>
      <TextInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={{ marginBottom: 12 }}
      />
      <TextInput label="City" value={city} onChangeText={setCity} style={{ marginBottom: 12 }} />
      <TextInput
        label="Employer"
        value={employer}
        onChangeText={setEmployer}
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Work Role"
        value={workRole}
        onChangeText={setWorkRole}
        style={{ marginBottom: 12 }}
      />
      <SelectInput
        label="Relationship"
        value={relationship}
        onChange={setRelationship}
        options={RELATIONSHIP_OPTIONS as unknown as string[]}
        style={{ marginBottom: 12 }}
      />
      <DateInput
        label="Birth Date"
        value={birthDate}
        onChange={(v) => setBirthDate(v)}
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Interests (comma-separated)"
        value={interestsCsv}
        onChangeText={setInterestsCsv}
        style={{ marginBottom: 16 }}
      />

      <EventsSection
        currentEvents={person?.currentEvents ?? []}
        upcomingEvents={person?.upcomingEvents ?? []}
        onAddCurrent={async (text) => {
          const next = [...(person?.currentEvents ?? []), text];
          await updatePerson({ variables: { id: personId, input: { currentEvents: next } } });
          refetch();
        }}
        onEditCurrent={async (index, text) => {
          const base = [...(person?.currentEvents ?? [])];
          base[index] = text;
          await updatePerson({ variables: { id: personId, input: { currentEvents: base } } });
          refetch();
        }}
        onDeleteCurrent={async (index) => {
          const base = [...(person?.currentEvents ?? [])].filter((_, i) => i !== index);
          await updatePerson({ variables: { id: personId, input: { currentEvents: base } } });
          refetch();
        }}
        onAddUpcoming={async (form) => {
          const payload: any = { title: form.title, date: form.date || undefined, notes: form.notes || undefined };
          const next = [...(person?.upcomingEvents ?? []), payload];
          await updatePerson({ variables: { id: personId, input: { upcomingEvents: next } } });
          refetch();
        }}
        onEditUpcoming={async (index, form) => {
          const base: any[] = [...(person?.upcomingEvents ?? [])];
          base[index] = { title: form.title, date: form.date || undefined, notes: form.notes || undefined };
          await updatePerson({ variables: { id: personId, input: { upcomingEvents: base } } });
          refetch();
        }}
        onDeleteUpcoming={async (index) => {
          const base = [...(person?.upcomingEvents ?? [])].filter((_, i) => i !== index);
          await updatePerson({ variables: { id: personId, input: { upcomingEvents: base } } });
          refetch();
        }}
      />

      <GiftIdeasSection
        items={(giftData?.giftIdeas ?? []) as any}
        onAdd={async (form: GiftIdeaForm) => {
          await createGiftIdea({ variables: { input: { personId, title: form.title, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined } } });
          refetchGifts();
        }}
        onEdit={async (index, form) => {
          const item = (giftData?.giftIdeas ?? [])[index] as any;
          if (!item?.id) return;
          await updateGiftIdea({ variables: { id: item.id, input: { title: form.title || undefined, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined } } });
          refetchGifts();
        }}
        onDelete={async (index) => {
          const item = (giftData?.giftIdeas ?? [])[index] as any;
          if (!item?.id) return;
          await deleteGiftIdea({ variables: { id: item.id } });
          refetchGifts();
        }}
      />

      <InteractionsSection
        items={(interData?.interactions ?? []) as any}
        onAdd={async (form: InteractionForm) => {
          await createInteraction({ variables: { input: { personId, summary: form.summary, date: form.date || undefined, channel: form.channel || undefined, location: form.location || undefined } } });
          refetchInter();
        }}
        onEdit={async (index, form) => {
          const item = (interData?.interactions ?? [])[index] as any;
          if (!item?.id) return;
          await updateInteraction({ variables: { id: item.id, input: { summary: form.summary || undefined, date: form.date || undefined, channel: form.channel || undefined, location: form.location || undefined } } });
          refetchInter();
        }}
        onDelete={async (index) => {
          const item = (interData?.interactions ?? [])[index] as any;
          if (!item?.id) return;
          await deleteInteraction({ variables: { id: item.id } });
          refetchInter();
        }}
      />

      <Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>
        Save
      </Button>

      {/* Sections render their own modals */}
    </ScrollView>
  );
}
