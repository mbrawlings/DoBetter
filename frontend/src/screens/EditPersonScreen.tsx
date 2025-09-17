import * as React from "react";
import { ScrollView, View, Platform } from "react-native";
import {
  Text,
  TextInput,
  Button,
  List,
  Card,
  IconButton,
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
import GiftIdeaModal, { GiftIdeaForm } from "../components/modals/GiftIdeaModal";
import InteractionModal, { InteractionForm } from "../components/modals/InteractionModal";
import UpcomingEventModal, { UpcomingEventForm } from "../components/modals/UpcomingEventModal";
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

  const [giftModalVisible, setGiftModalVisible] = React.useState(false);
  const [editingGift, setEditingGift] = React.useState<any | null>(null);

  const [interModalVisible, setInterModalVisible] = React.useState(false);
  const [editingInter, setEditingInter] = React.useState<any | null>(null);

  // Events state for add flows
  const [addCurrentEventVisible, setAddCurrentEventVisible] = React.useState(false);
  const [newCurrentEvent, setNewCurrentEvent] = React.useState("");
  const [addUpcomingEventVisible, setAddUpcomingEventVisible] = React.useState(false);
  const [newUpcomingEvent, setNewUpcomingEvent] = React.useState<UpcomingEventForm | undefined>(
    undefined
  );

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

      {/* Events */}
      <List.Section>
        <List.Subheader>Events</List.Subheader>
        <Button
          onPress={() => {
            setNewCurrentEvent("");
            setAddCurrentEventVisible(true);
          }}
        >
          Add current event
        </Button>
        {(person?.currentEvents ?? []).map((ce: string, idx: number) => (
          <Card key={`${ce}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
            <Card.Title title={ce} />
          </Card>
        ))}

        <Button
          onPress={() => {
            setNewUpcomingEvent({ title: "", date: "", notes: "" });
            setAddUpcomingEventVisible(true);
          }}
        >
          Add upcoming event
        </Button>
        {(person?.upcomingEvents ?? []).map((ue: any, idx: number) => (
          <Card key={`${ue?.title ?? "ue"}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
            <Card.Title
              title={ue?.title}
              subtitle={[ue?.date, ue?.notes].filter(Boolean).join(" • ")}
            />
          </Card>
        ))}
      </List.Section>

      {/* Gift Ideas */}
      <List.Section>
        <List.Subheader>Gift Ideas</List.Subheader>
        {(giftData?.giftIdeas ?? []).map((gi: any) => (
          <Card key={gi.id} style={{ marginBottom: 8 }}>
            <Card.Title
              title={gi.title}
              subtitle={[
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
                      setEditingGift(gi);
                      setGiftModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    onPress={() =>
                      deleteGiftIdea({ variables: { id: gi.id } }).then(() => refetchGifts())
                    }
                  />
                </View>
              )}
            />
          </Card>
        ))}
        <Button
          onPress={() => {
            setEditingGift(null);
            setGiftModalVisible(true);
          }}
        >
          Add gift idea
        </Button>
      </List.Section>

      {/* Interactions */}
      <List.Section>
        <List.Subheader>Interactions</List.Subheader>
        {(interData?.interactions ?? []).map((ix: any) => (
          <Card key={ix.id} style={{ marginBottom: 8 }}>
            <Card.Title
              title={ix.summary}
              subtitle={[ix.date, ix.channel, ix.location].filter(Boolean).join(" • ")}
              right={() => (
                <View style={{ flexDirection: "row" }}>
                  <IconButton
                    icon="pencil"
                    onPress={() => {
                      setEditingInter(ix);
                      setInterModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    onPress={() =>
                      deleteInteraction({ variables: { id: ix.id } }).then(() => refetchInter())
                    }
                  />
                </View>
              )}
            />
          </Card>
        ))}
        <Button
          onPress={() => {
            setEditingInter(null);
            setInterModalVisible(true);
          }}
        >
          Add interaction
        </Button>
      </List.Section>

      <Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>
        Save
      </Button>

      {/* Gift Modal */}
      <GiftIdeaModal
        visible={giftModalVisible}
        titleText={editingGift ? "Edit Gift Idea" : "Add Gift Idea"}
        initial={
          editingGift
            ? {
                title: editingGift.title,
                notes: editingGift.notes || "",
                occasion: editingGift.occasion || "",
                status: editingGift.status || "",
                priority: editingGift.priority ? String(editingGift.priority) : "",
              }
            : undefined
        }
        onDismiss={() => setGiftModalVisible(false)}
        onSave={async (form: GiftIdeaForm) => {
          const input: any = {
            title: form.title || undefined,
            notes: form.notes || undefined,
            occasion: form.occasion || undefined,
            status: form.status || undefined,
            priority: form.priority ? Number(form.priority) : undefined,
          };
          if (editingGift?.id) {
            await updateGiftIdea({ variables: { id: editingGift.id, input } });
          } else {
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
          }
          setGiftModalVisible(false);
          refetchGifts();
        }}
      />

      {/* Interaction Modal */}
      <InteractionModal
        visible={interModalVisible}
        titleText={editingInter ? "Edit Interaction" : "Add Interaction"}
        initial={
          editingInter
            ? {
                summary: editingInter.summary,
                date: editingInter.date || "",
                channel: editingInter.channel || "",
                location: editingInter.location || "",
              }
            : undefined
        }
        onDismiss={() => setInterModalVisible(false)}
        onSave={async (form: InteractionForm) => {
          const input: any = {
            summary: form.summary || undefined,
            date: form.date || undefined,
            channel: form.channel || undefined,
            location: form.location || undefined,
          };
          if (editingInter?.id) {
            await updateInteraction({ variables: { id: editingInter.id, input } });
          } else {
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
          }
          setInterModalVisible(false);
          refetchInter();
        }}
      />

      {/* Add Current Event Modal */}
      <SimpleModal
        visible={addCurrentEventVisible}
        title="Add Current Event"
        onDismiss={() => setAddCurrentEventVisible(false)}
        onSave={async () => {
          const text = newCurrentEvent.trim();
          if (!text) return;
          const next = [...(person?.currentEvents ?? []), text];
          await updatePerson({ variables: { id: personId, input: { currentEvents: next } } });
          setAddCurrentEventVisible(false);
          setNewCurrentEvent("");
          refetch();
        }}
      >
        <TextInput
          label="Event"
          value={newCurrentEvent}
          onChangeText={setNewCurrentEvent}
          style={{ marginBottom: 8 }}
        />
      </SimpleModal>

      {/* Add Upcoming Event Modal */}
      <UpcomingEventModal
        visible={addUpcomingEventVisible}
        titleText="Add Upcoming Event"
        initial={newUpcomingEvent}
        onDismiss={() => setAddUpcomingEventVisible(false)}
        onSave={async (form) => {
          if (!form.title.trim()) return;
          const payload = {
            title: form.title.trim(),
            date: form.date || undefined,
            notes: form.notes || undefined,
          } as any;
          const next = [...(person?.upcomingEvents ?? []), payload];
          await updatePerson({ variables: { id: personId, input: { upcomingEvents: next } } });
          setAddUpcomingEventVisible(false);
          refetch();
        }}
      />
    </ScrollView>
  );
}

function SimpleModal({ visible, onDismiss, title, onSave, children }: any) {
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
