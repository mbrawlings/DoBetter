import * as React from "react";
import { Platform, ScrollView, View } from "react-native";
import { Text, TextInput, Button, List, Card, IconButton } from "react-native-paper";
import DateInput from "../components/inputs/DateInput";
import SelectInput from "../components/inputs/SelectInput";
import GiftIdeaModal, { GiftIdeaForm } from "../components/modals/GiftIdeaModal";
import InteractionModal, { InteractionForm } from "../components/modals/InteractionModal";
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
  const [currentEventModalVisible, setCurrentEventModalVisible] = React.useState(false);
  const [editCurrentIdx, setEditCurrentIdx] = React.useState<number | null>(null);
  const [currentEventText, setCurrentEventText] = React.useState("");

  const [upcomingEvents, setUpcomingEvents] = React.useState<
    Array<{ title: string; date?: string; notes?: string }>
  >([]);
  const [upcomingModalVisible, setUpcomingModalVisible] = React.useState(false);
  const [editUpcomingIdx, setEditUpcomingIdx] = React.useState<number | null>(null);
  const [newUpcomingTitle, setNewUpcomingTitle] = React.useState("");
  const [newUpcomingDate, setNewUpcomingDate] = React.useState<string>("");
  const [newUpcomingNotes, setNewUpcomingNotes] = React.useState("");

  const [giftIdeas, setGiftIdeas] = React.useState<
    Array<{ title: string; notes?: string; occasion?: string; status?: string; priority?: number }>
  >([]);
  const [giftModalVisible, setGiftModalVisible] = React.useState(false);
  const [editGiftIdx, setEditGiftIdx] = React.useState<number | null>(null);
  const [giftForm, setGiftForm] = React.useState<GiftIdeaForm | undefined>(undefined);

  const [interactions, setInteractions] = React.useState<
    Array<{ summary: string; date?: string; channel?: string; location?: string }>
  >([]);
  const [interModalVisible, setInterModalVisible] = React.useState(false);
  const [editInterIdx, setEditInterIdx] = React.useState<number | null>(null);
  const [interForm, setInterForm] = React.useState<InteractionForm | undefined>(undefined);

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

      <List.Section>
        <List.Subheader>Events</List.Subheader>
        <Button
          onPress={() => {
            setEditCurrentIdx(null);
            setCurrentEventText("");
            setCurrentEventModalVisible(true);
          }}
        >
          Add current event
        </Button>
        {currentEvents.map((ce, idx) => (
          <Card key={`${ce}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
            <Card.Title
              title={ce}
              right={() => (
                <View style={{ flexDirection: "row" }}>
                  <IconButton
                    icon="pencil"
                    onPress={() => {
                      setEditCurrentIdx(idx);
                      setCurrentEventText(currentEvents[idx]);
                      setCurrentEventModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    onPress={() => setCurrentEvents((arr) => arr.filter((_, i) => i !== idx))}
                  />
                </View>
              )}
            />
          </Card>
        ))}

        <Button
          onPress={() => {
            setEditUpcomingIdx(null);
            setNewUpcomingTitle("");
            setNewUpcomingDate("");
            setNewUpcomingNotes("");
            setUpcomingModalVisible(true);
          }}
        >
          Add upcoming event
        </Button>
        {upcomingEvents.map((ue, idx) => (
          <Card key={`${ue.title}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
            <Card.Title
              title={ue.title}
              subtitle={[ue.date, ue.notes].filter(Boolean).join(" • ")}
              right={() => (
                <View style={{ flexDirection: "row" }}>
                  <IconButton
                    icon="pencil"
                    onPress={() => {
                      setEditUpcomingIdx(idx);
                      const u = upcomingEvents[idx];
                      setNewUpcomingTitle(u.title);
                      setNewUpcomingDate(u.date || "");
                      setNewUpcomingNotes(u.notes || "");
                      setUpcomingModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    onPress={() => setUpcomingEvents((arr) => arr.filter((_, i) => i !== idx))}
                  />
                </View>
              )}
            />
          </Card>
        ))}
      </List.Section>

      <List.Section>
        <List.Subheader>Gift Ideas</List.Subheader>
        {(giftIdeas ?? []).map((gi, idx) => (
          <Card key={`${gi.title}-${idx}`} style={{ marginBottom: 8 }}>
            <Card.Title
              title={gi.title}
              subtitle={[
                gi.notes,
                gi.occasion,
                gi.status,
                gi.priority ? `priority ${gi.priority}` : undefined,
              ]
                .filter(Boolean)
                .join(" • ")}
              right={() => (
                <View style={{ flexDirection: "row" }}>
                  <IconButton
                    icon="pencil"
                    onPress={() => {
                      setEditGiftIdx(idx);
                      const g = giftIdeas[idx];
                      setGiftForm({
                        title: g.title,
                        notes: g.notes || "",
                        occasion: g.occasion || "",
                        status: g.status || "",
                        priority: g.priority ? String(g.priority) : "",
                      });
                      setGiftModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    onPress={() => setGiftIdeas((arr) => arr.filter((_, i) => i !== idx))}
                  />
                </View>
              )}
            />
          </Card>
        ))}
        <Button
          onPress={() => {
            setEditGiftIdx(null);
            setGiftForm({ title: "", notes: "", occasion: "", status: "", priority: "" });
            setGiftModalVisible(true);
          }}
        >
          Add gift idea
        </Button>
      </List.Section>

      <List.Section>
        <List.Subheader>Interactions</List.Subheader>
        {(interactions ?? []).map((itx, idx) => (
          <Card key={`${itx.summary}-${idx}`} style={{ marginBottom: 8 }}>
            <Card.Title
              title={itx.summary}
              subtitle={[itx.date, itx.channel, itx.location].filter(Boolean).join(" • ")}
              right={() => (
                <View style={{ flexDirection: "row" }}>
                  <IconButton
                    icon="pencil"
                    onPress={() => {
                      setEditInterIdx(idx);
                      const x = interactions[idx];
                      setInterForm({
                        summary: x.summary,
                        date: x.date || "",
                        channel: x.channel || "",
                        location: x.location || "",
                      });
                      setInterModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    onPress={() => setInteractions((arr) => arr.filter((_, i) => i !== idx))}
                  />
                </View>
              )}
            />
          </Card>
        ))}
        <Button
          onPress={() => {
            setEditInterIdx(null);
            setInterForm({ summary: "", date: "", channel: "", location: "" });
            setInterModalVisible(true);
          }}
        >
          Add interaction
        </Button>
      </List.Section>

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

      {/* Current Event Modal */}
      <PortalLike
        visible={currentEventModalVisible}
        onDismiss={() => setCurrentEventModalVisible(false)}
        title={editCurrentIdx !== null ? "Edit Current Event" : "Add Current Event"}
        onSave={() => {
          const v = currentEventText.trim();
          if (!v) return;
          setCurrentEvents((arr) => {
            if (editCurrentIdx !== null) {
              const next = [...arr];
              next[editCurrentIdx] = v;
              return next;
            }
            return [...arr, v];
          });
          setCurrentEventModalVisible(false);
        }}
      >
        <TextInput
          label="Event"
          value={currentEventText}
          onChangeText={setCurrentEventText}
          style={{ marginBottom: 8 }}
        />
      </PortalLike>

      {/* Upcoming Event Modal */}
      <PortalLike
        visible={upcomingModalVisible}
        onDismiss={() => setUpcomingModalVisible(false)}
        title={editUpcomingIdx !== null ? "Edit Upcoming Event" : "Add Upcoming Event"}
        onSave={() => {
          if (!newUpcomingTitle.trim()) return;
          const payload = {
            title: newUpcomingTitle.trim(),
            date: newUpcomingDate || undefined,
            notes: newUpcomingNotes || undefined,
          } as any;
          setUpcomingEvents((arr) => {
            if (editUpcomingIdx !== null) {
              const next = [...arr];
              next[editUpcomingIdx] = { ...next[editUpcomingIdx], ...payload };
              return next;
            }
            return [...arr, payload];
          });
          setUpcomingModalVisible(false);
        }}
      >
        <TextInput
          label="Title"
          value={newUpcomingTitle}
          onChangeText={setNewUpcomingTitle}
          style={{ marginBottom: 8 }}
        />
        <DateInput
          label="Date"
          value={newUpcomingDate}
          onChange={(v) => setNewUpcomingDate(v)}
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Notes"
          value={newUpcomingNotes}
          onChangeText={setNewUpcomingNotes}
          style={{ marginBottom: 8 }}
        />
      </PortalLike>

      {/* Gift Idea Modal */}
      <GiftIdeaModal
        visible={giftModalVisible}
        titleText={editGiftIdx !== null ? "Edit Gift Idea" : "Add Gift Idea"}
        initial={giftForm}
        onDismiss={() => setGiftModalVisible(false)}
        onSave={(form) => {
          setGiftIdeas((arr) => {
            if (editGiftIdx !== null) {
              const next = [...arr];
              next[editGiftIdx] = {
                ...next[editGiftIdx],
                title: form.title,
                notes: form.notes || undefined,
                occasion: form.occasion || undefined,
                status: form.status || undefined,
                priority: form.priority ? Number(form.priority) : undefined,
              };
              return next;
            }
            return [
              ...arr,
              {
                title: form.title,
                notes: form.notes || undefined,
                occasion: form.occasion || undefined,
                status: form.status || undefined,
                priority: form.priority ? Number(form.priority) : undefined,
              },
            ];
          });
          setGiftModalVisible(false);
        }}
      />

      {/* Interaction Modal */}
      <InteractionModal
        visible={interModalVisible}
        titleText={editInterIdx !== null ? "Edit Interaction" : "Add Interaction"}
        initial={interForm}
        onDismiss={() => setInterModalVisible(false)}
        onSave={(form) => {
          setInteractions((arr) => {
            if (editInterIdx !== null) {
              const next = [...arr];
              next[editInterIdx] = { ...next[editInterIdx], ...form };
              return next;
            }
            return [...arr, { ...form }];
          });
          setInterModalVisible(false);
        }}
      />
    </ScrollView>
  );
}

function PortalLike({ visible, onDismiss, title, onSave, children }: any) {
  // Lightweight wrapper to reuse the inline modal pattern without duplicating code
  const { Portal, Modal } = require("react-native-paper");
  const { View } = require("react-native");
  const { Text, Button } = require("react-native-paper");
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: "white",
          margin: 16,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          {title}
        </Text>
        {children}
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Button onPress={onDismiss} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button mode="contained" onPress={onSave}>
            Save
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}
