import * as React from "react";
import { ScrollView } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import DateInput from "../components/inputs/DateInput";
import SelectInput from "../components/inputs/SelectInput";
import EventsSection from "../components/sections/EventsSection";
import GiftIdeasSection from "../components/sections/GiftIdeasSection";
import InteractionsSection from "../components/sections/InteractionsSection";
import { RELATIONSHIP_OPTIONS } from "../constants/options";
import { useMutation } from "@apollo/client";
import {
  CREATE_PERSON_MUTATION,
  CREATE_GIFT_IDEA_MUTATION,
  CREATE_INTERACTION_MUTATION,
} from "../graphql/operations";

export default function AddPersonScreen({ navigation }: any) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [employer, setEmployer] = React.useState("");
  const [workRole, setWorkRole] = React.useState("");
  const [relationship, setRelationship] = React.useState("");
  const [birthDate, setBirthDate] = React.useState<string>("");
  const [interestsCsv, setInterestsCsv] = React.useState("");

  // Using simple List.Section layout (no accordions) to match EditPerson screen

  const [currentEvents, setCurrentEvents] = React.useState<string[]>([]);
  // handled by EventsSection modals

  const [upcomingEvents, setUpcomingEvents] = React.useState<
    Array<{ title: string; date?: string; notes?: string }>
  >([]);
  // handled by EventsSection modals

  const [giftIdeas, setGiftIdeas] = React.useState<
    Array<{ title: string; notes?: string; occasion?: string; status?: string; priority?: number }>
  >([]);
  // handled by GiftIdeasSection modal

  const [interactions, setInteractions] = React.useState<
    Array<{ summary: string; date?: string; channel?: string; location?: string }>
  >([]);
  // handled by InteractionsSection modal

  const [createPerson, { loading, error }] = useMutation(CREATE_PERSON_MUTATION);
  const [createGiftIdea] = useMutation(CREATE_GIFT_IDEA_MUTATION);
  const [createInteraction] = useMutation(CREATE_INTERACTION_MUTATION);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  async function onSubmit() {
    if (!canSubmit) return;
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
    if (currentEvents.length) input.currentEvents = currentEvents;
    if (upcomingEvents.length) input.upcomingEvents = upcomingEvents;

    const res = await createPerson({ variables: { input } });
    const personId = (res?.data?.createPerson?.id as string) || undefined;

    if (personId) {
      if (giftIdeas.length) {
        await Promise.all(
          giftIdeas.map((gi) =>
            createGiftIdea({
              variables: {
                input: {
                  personId,
                  title: gi.title,
                  notes: gi.notes,
                  occasion: gi.occasion || undefined,
                  status: gi.status || undefined,
                  priority: gi.priority || undefined,
                },
              },
            })
          )
        );
      }
      if (interactions.length) {
        await Promise.all(
          interactions.map((itx) =>
            createInteraction({
              variables: {
                input: {
                  personId,
                  summary: itx.summary,
                  date: itx.date,
                  channel: itx.channel,
                  location: itx.location,
                },
              },
            })
          )
        );
      }
    }
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        Add Person
      </Text>
      <TextInput
        label="First Name*"
        value={firstName}
        onChangeText={setFirstName}
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Last Name*"
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
        style={{ marginBottom: 12 }}
      />

      <EventsSection
        currentEvents={currentEvents}
        upcomingEvents={upcomingEvents}
        onAddCurrent={(text) => setCurrentEvents((arr) => [...arr, text])}
        onEditCurrent={(index, text) => setCurrentEvents((arr) => { const next = [...arr]; next[index] = text; return next; })}
        onDeleteCurrent={(index) => setCurrentEvents((arr) => arr.filter((_, i) => i !== index))}
        onAddUpcoming={(ev) => setUpcomingEvents((arr) => [...arr, { title: ev.title, date: ev.date || undefined, notes: ev.notes || undefined }])}
        onEditUpcoming={(index, ev) => setUpcomingEvents((arr) => { const next = [...arr]; next[index] = { title: ev.title, date: ev.date || undefined, notes: ev.notes || undefined }; return next; })}
        onDeleteUpcoming={(index) => setUpcomingEvents((arr) => arr.filter((_, i) => i !== index))}
      />

      <GiftIdeasSection
        items={giftIdeas}
        onAdd={(form) => setGiftIdeas((arr) => [...arr, { title: form.title, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined }])}
        onEdit={(index, form) => setGiftIdeas((arr) => { const next = [...arr]; next[index] = { title: form.title, notes: form.notes || undefined, occasion: form.occasion || undefined, status: form.status || undefined, priority: form.priority ? Number(form.priority) : undefined }; return next; })}
        onDelete={(index) => setGiftIdeas((arr) => arr.filter((_, i) => i !== index))}
      />

      <InteractionsSection
        items={interactions}
        onAdd={(form) => setInteractions((arr) => [...arr, { ...form }])}
        onEdit={(index, form) => setInteractions((arr) => { const next = [...arr]; next[index] = { ...form }; return next; })}
        onDelete={(index) => setInteractions((arr) => arr.filter((_, i) => i !== index))}
      />

      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{String((error as any).message)}</Text>
      ) : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        disabled={!canSubmit || loading}
      >
        Save
      </Button>

      {/* Sections render their own modals */}
    </ScrollView>
  );
}

// Sections provide built-in modals; no local modal components needed
