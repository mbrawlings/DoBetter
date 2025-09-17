import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, ActivityIndicator, List, Text, FAB, TextInput, Button, Menu, Portal, Modal, MD3LightTheme, Searchbar, Card, IconButton } from 'react-native-paper';
import { View, FlatList, Platform, RefreshControl, NativeModules, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, gql, useQuery, useMutation } from '@apollo/client';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';

function resolveGraphqlUri(): string {
  if (process.env.EXPO_PUBLIC_GRAPHQL_URL) {
    return process.env.EXPO_PUBLIC_GRAPHQL_URL;
  }
  const extraUrl = (Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_GRAPHQL_URL as string | undefined;
  if (extraUrl) {
    return extraUrl;
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/graphql';
  }
  const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
  if (scriptURL) {
    try {
      const match = scriptURL.match(/^\w+:\/\/(.*?):\d+\//);
      const host = match?.[1] ?? 'localhost';
      const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      // Only trust LAN/IP hosts; avoid tunnel domains like *.ngrok.* or exp.direct etc.
      if (isIPv4 || isLocal) {
        return `http://${host}:4000/graphql`;
      }
    } catch {}
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:4000/graphql' : 'http://localhost:4000/graphql';
}

const graphqlUri = resolveGraphqlUri();
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('Using GraphQL endpoint:', graphqlUri);
}

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphqlUri }),
  cache: new InMemoryCache(),
});

const theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    secondary: '#9c27b0',
    tertiary: '#03a9f4',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#d32f2f',
  },
} as const;

const PERSONS_QUERY = gql`
  query Persons($filter: PersonFilterInput) {
    persons(filter: $filter) {
      id
      firstName
      lastName
    }
  }
`;

const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($input: PersonInput!) {
    createPerson(input: $input) {
      id
      firstName
      lastName
    }
  }
`;

const CREATE_GIFT_IDEA_MUTATION = gql`
  mutation CreateGiftIdea($input: GiftIdeaInput!) {
    createGiftIdea(input: $input) { id }
  }
`;

const CREATE_INTERACTION_MUTATION = gql`
  mutation CreateInteraction($input: InteractionInput!) {
    createInteraction(input: $input) { id }
  }
`;

const GET_PERSON_QUERY = gql`
  query Person($id: ID!) {
    person(id: $id) {
      id
      firstName
      lastName
      birthDate
      relationship
      city
      employer
      workRole
      interests
    }
  }
`;

const UPDATE_PERSON_MUTATION = gql`
  mutation UpdatePerson($id: ID!, $input: PersonInput!) {
    updatePerson(id: $id, input: $input) {
      id
      firstName
      lastName
    }
  }
`;

const GIFT_IDEAS_QUERY = gql`
  query GiftIdeas($personId: ID!) { giftIdeas(personId: $personId) { id title notes occasion status priority createdAt } }
`;
const INTERACTIONS_QUERY = gql`
  query Interactions($personId: ID!) { interactions(personId: $personId) { id date channel location summary } }
`;
const UPDATE_GIFT_IDEA_MUTATION = gql`
  mutation UpdateGiftIdea($id: ID!, $input: GiftIdeaUpdateInput!) { updateGiftIdea(id: $id, input: $input) { id } }
`;
const DELETE_GIFT_IDEA_MUTATION = gql`
  mutation DeleteGiftIdea($id: ID!) { deleteGiftIdea(id: $id) }
`;
const UPDATE_INTERACTION_MUTATION = gql`
  mutation UpdateInteraction($id: ID!, $input: InteractionUpdateInput!) { updateInteraction(id: $id, input: $input) { id } }
`;
const DELETE_INTERACTION_MUTATION = gql`
  mutation DeleteInteraction($id: ID!) { deleteInteraction(id: $id) }
`;

const Stack = createNativeStackNavigator();

function HomeScreen() {
  const { data, loading, error, refetch } = useQuery(PERSONS_QUERY, {
    variables: { filter: null },
    fetchPolicy: 'cache-and-network',
  });
  const navigation = useNavigation();

  const persons = data?.persons ?? [];

  useFocusEffect(
    React.useCallback(() => {
      // Refetch when the screen gains focus (e.g., after adding a person)
      refetch();
    }, [refetch])
  );

  const [searchQuery, setSearchQuery] = React.useState('');

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text variant="titleMedium">Failed to load persons</Text>
        <Text style={{ marginTop: 8 }}>{String(error)}</Text>
        <Text style={{ marginTop: 8 }}>{String(error.message)}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, elevation: 2 }}>
        <Searchbar
          placeholder="Search people"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ borderRadius: 12 }}
          onSubmitEditing={() => refetch({ filter: searchQuery ? { search: searchQuery } : null })}
        />
      </View>
      {loading && persons.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 12 }}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={persons}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Card mode="elevated" style={{ borderRadius: 12 }} onPress={() => (navigation as any).navigate('EditPerson' as never, { id: item.id } as never)}>
              <Card.Title
                title={`${item.firstName} ${item.lastName}`}
                left={(props) => <List.Icon {...props} icon="account" />}
              />
            </Card>
          )}
          ListEmptyComponent={(
            <View style={{ alignItems: 'center', paddingTop: 48 }}>
              <Text>No persons yet</Text>
            </View>
          )}
        />
      )}
      <FAB
        icon="plus"
        onPress={() => (navigation as any).navigate('AddPerson' as never)}
        style={{ position: 'absolute', right: 16, bottom: 24 }}
        accessibilityLabel="Add person"
      />
    </View>
  );
}

function AddPersonScreen({ navigation }: any) {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [employer, setEmployer] = React.useState('');
  const [workRole, setWorkRole] = React.useState('');
  const [relationship, setRelationship] = React.useState('');
  const [relationshipMenuVisible, setRelationshipMenuVisible] = React.useState(false);
  const [birthDate, setBirthDate] = React.useState<string>(''); // YYYY-MM-DD
  const [birthDateObj, setBirthDateObj] = React.useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [iosBirthModalVisible, setIosBirthModalVisible] = React.useState(false);
  const [tempBirthDate, setTempBirthDate] = React.useState<Date>(new Date());
  const [interestsCsv, setInterestsCsv] = React.useState('');

  // Collapsible sections state
  const [eventsExpanded, setEventsExpanded] = React.useState(false);
  const [giftIdeasExpanded, setGiftIdeasExpanded] = React.useState(false);
  const [interactionsExpanded, setInteractionsExpanded] = React.useState(false);

  // Events state
  const [currentEvents, setCurrentEvents] = React.useState<string[]>([]);
  const [upcomingEvents, setUpcomingEvents] = React.useState<Array<{ title: string; date?: string; notes?: string }>>([]);
  // Current event modal
  const [currentEventModalVisible, setCurrentEventModalVisible] = React.useState(false);
  const [editCurrentIdx, setEditCurrentIdx] = React.useState<number | null>(null);
  const [currentEventText, setCurrentEventText] = React.useState('');
  // Upcoming event modal
  const [upcomingModalVisible, setUpcomingModalVisible] = React.useState(false);
  const [editUpcomingIdx, setEditUpcomingIdx] = React.useState<number | null>(null);
  const [newUpcomingTitle, setNewUpcomingTitle] = React.useState('');
  const [newUpcomingDate, setNewUpcomingDate] = React.useState<string>('');
  const [newUpcomingDateObj, setNewUpcomingDateObj] = React.useState<Date | undefined>(undefined);
  const [newUpcomingShowPicker, setNewUpcomingShowPicker] = React.useState(false);
  const [newUpcomingIosModalVisible, setNewUpcomingIosModalVisible] = React.useState(false);
  const [newUpcomingTempDate, setNewUpcomingTempDate] = React.useState<Date>(new Date());
  const [newUpcomingNotes, setNewUpcomingNotes] = React.useState('');

  // Gift ideas state
  const [giftIdeas, setGiftIdeas] = React.useState<Array<{ title: string; notes?: string; occasion?: string; status?: string; priority?: number }>>([]);
  const [addGiftModalVisible, setAddGiftModalVisible] = React.useState(false);
  const [editGiftIdx, setEditGiftIdx] = React.useState<number | null>(null);
  const [giftTitle, setGiftTitle] = React.useState('');
  const [giftNotes, setGiftNotes] = React.useState('');
  const [giftOccasion, setGiftOccasion] = React.useState('');
  const [giftStatus, setGiftStatus] = React.useState('');
  const [giftPriority, setGiftPriority] = React.useState<string>('');
  const [giftOccasionMenuVisible, setGiftOccasionMenuVisible] = React.useState(false);
  const [giftStatusMenuVisible, setGiftStatusMenuVisible] = React.useState(false);
  const [giftPriorityMenuVisible, setGiftPriorityMenuVisible] = React.useState(false);

  // Interactions state
  const [interactions, setInteractions] = React.useState<Array<{ summary: string; date?: string; channel?: string; location?: string }>>([]);
  const [addInterModalVisible, setAddInterModalVisible] = React.useState(false);
  const [editInterIdx, setEditInterIdx] = React.useState<number | null>(null);
  const [interSummary, setInterSummary] = React.useState('');
  const [interDate, setInterDate] = React.useState<string>('');
  const [interDateObj, setInterDateObj] = React.useState<Date | undefined>(undefined);
  const [interShowPicker, setInterShowPicker] = React.useState(false);
  const [interIosModalVisible, setInterIosModalVisible] = React.useState(false);
  const [interTempDate, setInterTempDate] = React.useState<Date>(new Date());
  const [interChannel, setInterChannel] = React.useState('');
  const [interLocation, setInterLocation] = React.useState('');
  const [interChannelMenuVisible, setInterChannelMenuVisible] = React.useState(false);

  const [createPerson, { loading, error }] = useMutation(CREATE_PERSON_MUTATION);
  const [createGiftIdea] = useMutation(CREATE_GIFT_IDEA_MUTATION);
  const [createInteraction] = useMutation(CREATE_INTERACTION_MUTATION);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  async function onSubmit() {
    if (!canSubmit) return;
    const interests = interestsCsv
      .split(',')
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
    const personId = res?.data?.createPerson?.id as string | undefined;

    if (personId) {
      if (giftIdeas.length) {
        await Promise.all(
          giftIdeas.map((gi) =>
            createGiftIdea({ variables: { input: { personId, title: gi.title, notes: gi.notes, occasion: gi.occasion || undefined, status: gi.status || undefined, priority: gi.priority || undefined } } })
          )
        );
      }
      if (interactions.length) {
        await Promise.all(
          interactions.map((itx) =>
            createInteraction({ variables: { input: { personId, summary: itx.summary, date: itx.date, channel: itx.channel, location: itx.location } } })
          )
        );
      }
    }
    navigation.goBack();
  }

  function formatDateYmd(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function openBirthPicker() {
    if (Platform.OS === 'ios') {
      setTempBirthDate(birthDateObj ?? new Date());
      setIosBirthModalVisible(true);
    } else {
      setShowDatePicker(true);
    }
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
      <TextInput
        label="City"
        value={city}
        onChangeText={setCity}
        style={{ marginBottom: 12 }}
      />
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
      <Menu
        visible={relationshipMenuVisible}
        onDismiss={() => setRelationshipMenuVisible(false)}
        anchor={
          <TextInput
            label="Relationship"
            value={relationship}
            right={<TextInput.Icon icon="menu-down" onPress={() => setRelationshipMenuVisible(true)} />}
            onPressIn={() => setRelationshipMenuVisible(true)}
            editable={false}
            style={{ marginBottom: 12 }}
          />
        }
      >
        {['spouse','sibling','parent','child','friend','colleague','other'].map((opt) => (
          <Menu.Item key={opt} onPress={() => { setRelationship(opt); setRelationshipMenuVisible(false); }} title={opt} />
        ))}
      </Menu>

      <TextInput
        label="Birth Date"
        value={birthDate}
        editable={false}
        right={<TextInput.Icon icon="calendar" onPress={openBirthPicker} />}
        onPressIn={openBirthPicker}
        style={{ marginBottom: 12 }}
      />
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={birthDateObj ?? new Date()}
          mode="date"
          display="default"
          onChange={(event: any, date?: Date) => {
            setShowDatePicker(false);
            if (event?.type === 'set' && date) {
              setBirthDateObj(date);
              setBirthDate(formatDateYmd(date));
            }
          }}
        />
      )}

      {Platform.OS === 'ios' && (
        <Portal>
          <Modal
            visible={iosBirthModalVisible}
            onDismiss={() => setIosBirthModalVisible(false)}
            contentContainerStyle={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 12, padding: 16 }}
          >
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Birth Date</Text>
            <DateTimePicker
              value={tempBirthDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => { if (date) setTempBirthDate(date); }}
              style={{ marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button onPress={() => setIosBirthModalVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={() => {
                setBirthDateObj(tempBirthDate);
                setBirthDate(formatDateYmd(tempBirthDate));
                setIosBirthModalVisible(false);
              }}>Done</Button>
            </View>
          </Modal>
        </Portal>
      )}
      <TextInput
        label="Interests (comma-separated)"
        value={interestsCsv}
        onChangeText={setInterestsCsv}
        style={{ marginBottom: 12 }}
      />

      {/* Collapsible sections */}
      <List.Section>
        <List.Accordion
          title="Events"
          expanded={eventsExpanded}
          onPress={() => setEventsExpanded((v) => !v)}
          left={(props) => <List.Icon {...props} icon="calendar" />}
        >
          <Text variant="titleSmall" style={{ marginHorizontal: 8, marginBottom: 8 }}>Current Events</Text>
          <View style={{ paddingHorizontal: 8 }}>
            <Button mode="contained" onPress={() => { setEditCurrentIdx(null); setCurrentEventText(''); setCurrentEventModalVisible(true); }}>Add current event</Button>
          </View>
          {currentEvents.map((ce, idx) => (
            <Card key={`${ce}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
              <Card.Title title={ce} right={() => (
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="pencil" onPress={() => { setEditCurrentIdx(idx); setCurrentEventText(currentEvents[idx]); setCurrentEventModalVisible(true); }} />
                  <IconButton icon="delete" onPress={() => setCurrentEvents((arr) => arr.filter((_, i) => i !== idx))} />
                </View>
              )} />
            </Card>
          ))}

          <Text variant="titleSmall" style={{ marginHorizontal: 8, marginTop: 8 }}>Upcoming Events</Text>
          <View style={{ paddingHorizontal: 8 }}>
            <Button mode="contained" onPress={() => { setEditUpcomingIdx(null); setNewUpcomingTitle(''); setNewUpcomingDate(''); setNewUpcomingDateObj(undefined); setNewUpcomingNotes(''); setUpcomingModalVisible(true); }}>Add upcoming event</Button>
          </View>
          {upcomingEvents.map((ue, idx) => (
            <Card key={`${ue.title}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
              <Card.Title title={ue.title} subtitle={[ue.date, ue.notes].filter(Boolean).join(' • ')} right={() => (
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="pencil" onPress={() => { setEditUpcomingIdx(idx); const u = upcomingEvents[idx]; setNewUpcomingTitle(u.title); setNewUpcomingDate(u.date || ''); setNewUpcomingDateObj(u.date ? new Date(u.date) : undefined); setNewUpcomingNotes(u.notes || ''); setUpcomingModalVisible(true); }} />
                  <IconButton icon="delete" onPress={() => setUpcomingEvents((arr) => arr.filter((_, i) => i !== idx))} />
                </View>
              )} />
            </Card>
          ))}
        </List.Accordion>

        <List.Accordion
          title="Gift Ideas"
          expanded={giftIdeasExpanded}
          onPress={() => setGiftIdeasExpanded((v) => !v)}
          left={(props) => <List.Icon {...props} icon="gift" />}
        >
          <View style={{ paddingHorizontal: 8 }}>
            <Button mode="contained" onPress={() => { setEditGiftIdx(null); setGiftTitle(''); setGiftNotes(''); setGiftOccasion(''); setGiftStatus(''); setGiftPriority(''); setAddGiftModalVisible(true); }}>Add gift idea</Button>
          </View>
          {giftIdeas.map((gi, idx) => (
            <Card key={`${gi.title}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
              <Card.Title title={gi.title} subtitle={[gi.notes, gi.occasion, gi.status, gi.priority ? `priority ${gi.priority}` : undefined].filter(Boolean).join(' • ')} right={() => (
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="pencil" onPress={() => { setEditGiftIdx(idx); const g = giftIdeas[idx]; setGiftTitle(g.title); setGiftNotes(g.notes || ''); setGiftOccasion(g.occasion || ''); setGiftStatus(g.status || ''); setGiftPriority(g.priority ? String(g.priority) : ''); setAddGiftModalVisible(true); }} />
                  <IconButton icon="delete" onPress={() => setGiftIdeas((arr) => arr.filter((_, i) => i !== idx))} />
                </View>
              )} />
            </Card>
          ))}
        </List.Accordion>

        <List.Accordion
          title="Interactions"
          expanded={interactionsExpanded}
          onPress={() => setInteractionsExpanded((v) => !v)}
          left={(props) => <List.Icon {...props} icon="account-voice" />}
        >
          <View style={{ paddingHorizontal: 8 }}>
            <Button mode="contained" onPress={() => { setEditInterIdx(null); setInterSummary(''); setInterDate(''); setInterDateObj(undefined); setInterChannel(''); setInterLocation(''); setAddInterModalVisible(true); }}>Add interaction</Button>
          </View>
          {interactions.map((itx, idx) => (
            <Card key={`${itx.summary}-${idx}`} style={{ marginHorizontal: 8, marginTop: 8 }}>
              <Card.Title title={itx.summary} subtitle={[itx.date, itx.channel, itx.location].filter(Boolean).join(' • ')} right={() => (
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="pencil" onPress={() => { setEditInterIdx(idx); const x = interactions[idx]; setInterSummary(x.summary); setInterDate(x.date || ''); setInterDateObj(x.date ? new Date(x.date) : undefined); setInterChannel(x.channel || ''); setInterLocation(x.location || ''); setAddInterModalVisible(true); }} />
                  <IconButton icon="delete" onPress={() => setInteractions((arr) => arr.filter((_, i) => i !== idx))} />
                </View>
              )} />
            </Card>
          ))}
        </List.Accordion>
      </List.Section>

      {error ? (
        <Text style={{ color: 'red', marginBottom: 12 }}>{String(error.message)}</Text>
      ) : null}

      {/* Current Event Modal */}
      <Portal>
        <Modal visible={currentEventModalVisible} onDismiss={() => setCurrentEventModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>{editCurrentIdx !== null ? 'Edit Current Event' : 'Add Current Event'}</Text>
          <TextInput label="Event" value={currentEventText} onChangeText={setCurrentEventText} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={() => setCurrentEventModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={() => {
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
            }}>Save</Button>
          </View>
        </Modal>
      </Portal>

      {/* Upcoming Event Modal */}
      <Portal>
        <Modal visible={upcomingModalVisible} onDismiss={() => setUpcomingModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>{editUpcomingIdx !== null ? 'Edit Upcoming Event' : 'Add Upcoming Event'}</Text>
          <TextInput label="Title" value={newUpcomingTitle} onChangeText={setNewUpcomingTitle} style={{ marginBottom: 8 }} />
          <TextInput label="Date" value={newUpcomingDate} editable={false} right={<TextInput.Icon icon="calendar" onPress={() => { if (Platform.OS === 'ios') { setNewUpcomingTempDate(newUpcomingDateObj ?? new Date()); setNewUpcomingIosModalVisible(true); } else { setNewUpcomingShowPicker(true); } }} />} onPressIn={() => { if (Platform.OS === 'ios') { setNewUpcomingTempDate(newUpcomingDateObj ?? new Date()); setNewUpcomingIosModalVisible(true); } else { setNewUpcomingShowPicker(true); } }} style={{ marginBottom: 8 }} />
          {Platform.OS === 'android' && newUpcomingShowPicker && (
            <DateTimePicker value={newUpcomingDateObj ?? new Date()} mode="date" display="default" onChange={(event: any, date?: Date) => { setNewUpcomingShowPicker(false); if (event?.type === 'set' && date) { setNewUpcomingDateObj(date); const yyyy = date.getFullYear(); const mm = String(date.getMonth() + 1).padStart(2, '0'); const dd = String(date.getDate()).padStart(2, '0'); setNewUpcomingDate(`${yyyy}-${mm}-${dd}`); } }} />
          )}
          {Platform.OS === 'ios' && (
            <Portal>
              <Modal visible={newUpcomingIosModalVisible} onDismiss={() => setNewUpcomingIosModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Date</Text>
                <DateTimePicker value={newUpcomingTempDate} mode="date" display="spinner" onChange={(_, date) => { if (date) setNewUpcomingTempDate(date); }} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Button onPress={() => setNewUpcomingIosModalVisible(false)}>Cancel</Button>
                  <Button mode="contained" onPress={() => { setNewUpcomingDateObj(newUpcomingTempDate); const yyyy = newUpcomingTempDate.getFullYear(); const mm = String(newUpcomingTempDate.getMonth() + 1).padStart(2, '0'); const dd = String(newUpcomingTempDate.getDate()).padStart(2, '0'); setNewUpcomingDate(`${yyyy}-${mm}-${dd}`); setNewUpcomingIosModalVisible(false); }}>Done</Button>
                </View>
              </Modal>
            </Portal>
          )}
          <TextInput label="Notes" value={newUpcomingNotes} onChangeText={setNewUpcomingNotes} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={() => setUpcomingModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={() => {
              if (!newUpcomingTitle.trim()) return;
              const payload = { title: newUpcomingTitle.trim(), date: newUpcomingDate || undefined, notes: newUpcomingNotes || undefined } as any;
              setUpcomingEvents((arr) => {
                if (editUpcomingIdx !== null) {
                  const next = [...arr];
                  next[editUpcomingIdx] = { ...next[editUpcomingIdx], ...payload };
                  return next;
                }
                return [...arr, payload];
              });
              setUpcomingModalVisible(false);
            }}>Save</Button>
          </View>
        </Modal>
      </Portal>

      {/* Add Gift Idea Modal (for Add Person) */}
      <Portal>
        <Modal visible={addGiftModalVisible} onDismiss={() => setAddGiftModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>{editGiftIdx !== null ? 'Edit Gift Idea' : 'Add Gift Idea'}</Text>
          <TextInput label="Title" value={giftTitle} onChangeText={setGiftTitle} style={{ marginBottom: 8 }} />
          <TextInput label="Notes" value={giftNotes} onChangeText={setGiftNotes} style={{ marginBottom: 8 }} />
          <Menu visible={giftOccasionMenuVisible} onDismiss={() => setGiftOccasionMenuVisible(false)} anchor={<TextInput label="Occasion" value={giftOccasion} right={<TextInput.Icon icon="menu-down" onPress={() => setGiftOccasionMenuVisible(true)} />} onPressIn={() => setGiftOccasionMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />}>
            {['birthday','holiday','anniversary','other'].map((opt) => (<Menu.Item key={opt} onPress={() => { setGiftOccasion(opt); setGiftOccasionMenuVisible(false); }} title={opt} />))}
          </Menu>
          <Menu visible={giftStatusMenuVisible} onDismiss={() => setGiftStatusMenuVisible(false)} anchor={<TextInput label="Status" value={giftStatus} right={<TextInput.Icon icon="menu-down" onPress={() => setGiftStatusMenuVisible(true)} />} onPressIn={() => setGiftStatusMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />}>
            {['idea','shortlist','purchased','gifted'].map((opt) => (<Menu.Item key={opt} onPress={() => { setGiftStatus(opt); setGiftStatusMenuVisible(false); }} title={opt} />))}
          </Menu>
          <Menu visible={giftPriorityMenuVisible} onDismiss={() => setGiftPriorityMenuVisible(false)} anchor={<TextInput label="Priority" value={giftPriority} right={<TextInput.Icon icon="menu-down" onPress={() => setGiftPriorityMenuVisible(true)} />} onPressIn={() => setGiftPriorityMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />}>
            {['1','2','3'].map((opt) => (<Menu.Item key={opt} onPress={() => { setGiftPriority(opt); setGiftPriorityMenuVisible(false); }} title={opt} />))}
          </Menu>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={() => setAddGiftModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={() => {
              if (!giftTitle.trim()) return;
              const payload = { title: giftTitle.trim(), notes: giftNotes || undefined, occasion: giftOccasion || undefined, status: giftStatus || undefined, priority: giftPriority ? Number(giftPriority) : undefined } as any;
              setGiftIdeas((arr) => {
                if (editGiftIdx !== null) {
                  const next = [...arr];
                  next[editGiftIdx] = { ...next[editGiftIdx], ...payload };
                  return next;
                }
                return [...arr, payload];
              });
              setAddGiftModalVisible(false);
            }}>Save</Button>
          </View>
        </Modal>
      </Portal>

      {/* Add Interaction Modal (for Add Person) */}
      <Portal>
        <Modal visible={addInterModalVisible} onDismiss={() => setAddInterModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>{editInterIdx !== null ? 'Edit Interaction' : 'Add Interaction'}</Text>
          <TextInput label="Summary" value={interSummary} onChangeText={setInterSummary} style={{ marginBottom: 8 }} />
          <TextInput label="Date" value={interDate} editable={false} right={<TextInput.Icon icon="calendar" onPress={() => { if (Platform.OS === 'ios') { setInterTempDate(interDateObj ?? new Date()); setInterIosModalVisible(true); } else { setInterShowPicker(true); } }} />} onPressIn={() => { if (Platform.OS === 'ios') { setInterTempDate(interDateObj ?? new Date()); setInterIosModalVisible(true); } else { setInterShowPicker(true); } }} style={{ marginBottom: 8 }} />
          {Platform.OS === 'android' && interShowPicker && (
            <DateTimePicker value={interDateObj ?? new Date()} mode="date" display="default" onChange={(event: any, date?: Date) => { setInterShowPicker(false); if (event?.type === 'set' && date) { setInterDateObj(date); const yyyy = date.getFullYear(); const mm = String(date.getMonth() + 1).padStart(2, '0'); const dd = String(date.getDate()).padStart(2, '0'); setInterDate(`${yyyy}-${mm}-${dd}`); } }} />
          )}
          {Platform.OS === 'ios' && (
            <Portal>
              <Modal visible={interIosModalVisible} onDismiss={() => setInterIosModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Date</Text>
                <DateTimePicker value={interTempDate} mode="date" display="spinner" onChange={(_, date) => { if (date) setInterTempDate(date); }} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Button onPress={() => setInterIosModalVisible(false)}>Cancel</Button>
                  <Button mode="contained" onPress={() => { setInterDateObj(interTempDate); const yyyy = interTempDate.getFullYear(); const mm = String(interTempDate.getMonth() + 1).padStart(2, '0'); const dd = String(interTempDate.getDate()).padStart(2, '0'); setInterDate(`${yyyy}-${mm}-${dd}`); setInterIosModalVisible(false); }}>Done</Button>
                </View>
              </Modal>
            </Portal>
          )}
          <Menu visible={interChannelMenuVisible} onDismiss={() => setInterChannelMenuVisible(false)} anchor={<TextInput label="Channel" value={interChannel} right={<TextInput.Icon icon="menu-down" onPress={() => setInterChannelMenuVisible(true)} />} onPressIn={() => setInterChannelMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />}>
            {['irl','call','text','video','other'].map((opt) => (<Menu.Item key={opt} onPress={() => { setInterChannel(opt); setInterChannelMenuVisible(false); }} title={opt} />))}
          </Menu>
          <TextInput label="Location" value={interLocation} onChangeText={setInterLocation} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={() => setAddInterModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={() => {
              if (!interSummary.trim()) return;
              const payload = { summary: interSummary.trim(), date: interDate || undefined, channel: interChannel || undefined, location: interLocation || undefined } as any;
              setInteractions((arr) => {
                if (editInterIdx !== null) {
                  const next = [...arr];
                  next[editInterIdx] = { ...next[editInterIdx], ...payload };
                  return next;
                }
                return [...arr, payload];
              });
              setAddInterModalVisible(false);
            }}>Save</Button>
          </View>
        </Modal>
      </Portal>
      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        disabled={!canSubmit || loading}
      >
        Save
      </Button>
    </ScrollView>
  );
}

function EditPersonScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId = route.params?.id as string;
  const { data, loading, error } = useQuery(GET_PERSON_QUERY, { variables: { id: personId } });
  const { data: giftData, refetch: refetchGifts } = useQuery(GIFT_IDEAS_QUERY, { variables: { personId } });
  const { data: interData, refetch: refetchInter } = useQuery(INTERACTIONS_QUERY, { variables: { personId } });
  const [updatePerson, { loading: saving }] = useMutation(UPDATE_PERSON_MUTATION);
  const [createGiftIdea] = useMutation(CREATE_GIFT_IDEA_MUTATION);
  const [updateGiftIdea] = useMutation(UPDATE_GIFT_IDEA_MUTATION);
  const [deleteGiftIdea] = useMutation(DELETE_GIFT_IDEA_MUTATION);
  const [createInteraction] = useMutation(CREATE_INTERACTION_MUTATION);
  const [updateInteraction] = useMutation(UPDATE_INTERACTION_MUTATION);
  const [deleteInteraction] = useMutation(DELETE_INTERACTION_MUTATION);

  const person = data?.person;

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [employer, setEmployer] = React.useState('');
  const [workRole, setWorkRole] = React.useState('');
  const [relationship, setRelationship] = React.useState('');
  const [relationshipMenuVisible, setRelationshipMenuVisible] = React.useState(false);
  const [birthDate, setBirthDate] = React.useState<string>('');
  const [birthDateObj, setBirthDateObj] = React.useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [iosBirthModalVisible, setIosBirthModalVisible] = React.useState(false);
  const [tempBirthDate, setTempBirthDate] = React.useState<Date>(new Date());
  const [interestsCsv, setInterestsCsv] = React.useState('');

  // Gift idea modal state
  const [giftModalVisible, setGiftModalVisible] = React.useState(false);
  const [editingGiftId, setEditingGiftId] = React.useState<string | null>(null);
  const [giftTitle, setGiftTitle] = React.useState('');
  const [giftNotes, setGiftNotes] = React.useState('');
  const [giftOccasion, setGiftOccasion] = React.useState('');
  const [giftStatus, setGiftStatus] = React.useState('');
  const [giftPriority, setGiftPriority] = React.useState<string>('');
  const [giftOccasionMenuVisible, setGiftOccasionMenuVisible] = React.useState(false);
  const [giftStatusMenuVisible, setGiftStatusMenuVisible] = React.useState(false);
  const [giftPriorityMenuVisible, setGiftPriorityMenuVisible] = React.useState(false);

  // Interaction modal state
  const [interModalVisible, setInterModalVisible] = React.useState(false);
  const [editingInterId, setEditingInterId] = React.useState<string | null>(null);
  const [interSummary, setInterSummary] = React.useState('');
  const [interDate, setInterDate] = React.useState<string>('');
  const [interDateObj, setInterDateObj] = React.useState<Date | undefined>(undefined);
  const [interShowPicker, setInterShowPicker] = React.useState(false);
  const [interIosModalVisible, setInterIosModalVisible] = React.useState(false);
  const [interTempDate, setInterTempDate] = React.useState<Date>(new Date());
  const [interChannel, setInterChannel] = React.useState('');
  const [interLocation, setInterLocation] = React.useState('');
  const [interChannelMenuVisible, setInterChannelMenuVisible] = React.useState(false);

  function openEditGiftModal(gi: any | null) {
    setEditingGiftId(gi?.id ?? null);
    setGiftTitle(gi?.title ?? '');
    setGiftNotes(gi?.notes ?? '');
    setGiftOccasion(gi?.occasion ?? '');
    setGiftStatus(gi?.status ?? '');
    setGiftPriority(gi?.priority ? String(gi.priority) : '');
    setGiftModalVisible(true);
  }

  function openEditInteractionModal(ix: any | null) {
    setEditingInterId(ix?.id ?? null);
    setInterSummary(ix?.summary ?? '');
    if (ix?.date) {
      const d = new Date(ix.date);
      setInterDateObj(d);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setInterDate(`${yyyy}-${mm}-${dd}`);
    } else {
      setInterDate('');
      setInterDateObj(undefined);
    }
    setInterChannel(ix?.channel ?? '');
    setInterLocation(ix?.location ?? '');
    setInterModalVisible(true);
  }

  async function saveGiftModal() {
    const input: any = { title: giftTitle || undefined, notes: giftNotes || undefined, occasion: giftOccasion || undefined, status: giftStatus || undefined, priority: giftPriority ? Number(giftPriority) : undefined };
    if (editingGiftId) {
      await updateGiftIdea({ variables: { id: editingGiftId, input } });
    } else {
      await createGiftIdea({ variables: { input: { personId, title: giftTitle, notes: giftNotes || undefined, occasion: giftOccasion || undefined, status: giftStatus || undefined, priority: giftPriority ? Number(giftPriority) : undefined } } });
    }
    setGiftModalVisible(false);
    refetchGifts();
  }

  function openInterDatePicker() {
    if (Platform.OS === 'ios') {
      setInterTempDate(interDateObj ?? new Date());
      setInterIosModalVisible(true);
    } else {
      setInterShowPicker(true);
    }
  }

  async function saveInterModal() {
    const input: any = { summary: interSummary || undefined, date: interDate || undefined, channel: interChannel || undefined, location: interLocation || undefined };
    if (editingInterId) {
      await updateInteraction({ variables: { id: editingInterId, input } });
    } else {
      await createInteraction({ variables: { input: { personId, summary: interSummary, date: interDate || undefined, channel: interChannel || undefined, location: interLocation || undefined } } });
    }
    setInterModalVisible(false);
    refetchInter();
  }

  React.useEffect(() => {
    if (person) {
      setFirstName(person.firstName ?? '');
      setLastName(person.lastName ?? '');
      setCity(person.city ?? '');
      setEmployer(person.employer ?? '');
      setWorkRole(person.workRole ?? '');
      setRelationship(person.relationship ?? '');
      if (person.birthDate) {
        const d = new Date(person.birthDate);
        setBirthDateObj(d);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setBirthDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setBirthDate('');
        setBirthDateObj(undefined);
      }
      setInterestsCsv(Array.isArray(person.interests) ? person.interests.join(', ') : '');
    }
  }, [person]);

  function formatDateYmd(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function openBirthPicker() {
    if (Platform.OS === 'ios') {
      setTempBirthDate(birthDateObj ?? new Date());
      setIosBirthModalVisible(true);
    } else {
      setShowDatePicker(true);
    }
  }

  async function onSave() {
    const interests = interestsCsv
      .split(',')
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text variant="titleMedium">Failed to load person</Text>
        <Text style={{ marginTop: 8 }}>{String(error.message)}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Edit Person</Text>
      <TextInput label="First Name" value={firstName} onChangeText={setFirstName} style={{ marginBottom: 12 }} />
      <TextInput label="Last Name" value={lastName} onChangeText={setLastName} style={{ marginBottom: 12 }} />
      <TextInput label="City" value={city} onChangeText={setCity} style={{ marginBottom: 12 }} />
      <TextInput label="Employer" value={employer} onChangeText={setEmployer} style={{ marginBottom: 12 }} />
      <TextInput label="Work Role" value={workRole} onChangeText={setWorkRole} style={{ marginBottom: 12 }} />

      <Menu
        visible={relationshipMenuVisible}
        onDismiss={() => setRelationshipMenuVisible(false)}
        anchor={
          <TextInput
            label="Relationship"
            value={relationship}
            right={<TextInput.Icon icon="menu-down" onPress={() => setRelationshipMenuVisible(true)} />}
            onPressIn={() => setRelationshipMenuVisible(true)}
            editable={false}
            style={{ marginBottom: 12 }}
          />
        }
      >
        {['spouse','sibling','parent','child','friend','colleague','other'].map((opt) => (
          <Menu.Item key={opt} onPress={() => { setRelationship(opt); setRelationshipMenuVisible(false); }} title={opt} />
        ))}
      </Menu>

      <TextInput
        label="Birth Date"
        value={birthDate}
        editable={false}
        right={<TextInput.Icon icon="calendar" onPress={openBirthPicker} />}
        onPressIn={openBirthPicker}
        style={{ marginBottom: 12 }}
      />
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={birthDateObj ?? new Date()}
          mode="date"
          display="default"
          onChange={(event: any, date?: Date) => {
            setShowDatePicker(false);
            if (event?.type === 'set' && date) {
              setBirthDateObj(date);
              setBirthDate(formatDateYmd(date));
            }
          }}
        />
      )}

      {Platform.OS === 'ios' && (
        <Portal>
          <Modal
            visible={iosBirthModalVisible}
            onDismiss={() => setIosBirthModalVisible(false)}
            contentContainerStyle={{ backgroundColor: 'white', marginHorizontal: 16, borderRadius: 12, padding: 16 }}
          >
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Birth Date</Text>
            <DateTimePicker
              value={tempBirthDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => { if (date) setTempBirthDate(date); }}
              style={{ marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button onPress={() => setIosBirthModalVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={() => {
                setBirthDateObj(tempBirthDate);
                setBirthDate(formatDateYmd(tempBirthDate));
                setIosBirthModalVisible(false);
              }}>Done</Button>
            </View>
          </Modal>
        </Portal>
      )}

      <TextInput label="Interests (comma-separated)" value={interestsCsv} onChangeText={setInterestsCsv} style={{ marginBottom: 16 }} />

      {/* Gift Ideas */}
      <List.Section>
        <List.Subheader>Gift Ideas</List.Subheader>
        {(giftData?.giftIdeas ?? []).map((gi: any) => (
          <Card key={gi.id} style={{ marginBottom: 8 }}>
            <Card.Title title={gi.title} subtitle={[gi.occasion, gi.status, gi.priority ? `priority ${gi.priority}` : undefined].filter(Boolean).join(' • ')} right={() => (
              <View style={{ flexDirection: 'row' }}>
                <IconButton icon="pencil" onPress={() => openEditGiftModal(gi)} />
                <IconButton icon="delete" onPress={() => deleteGiftIdea({ variables: { id: gi.id } }).then(() => refetchGifts())} />
              </View>
            )} />
          </Card>
        ))}
        <Button onPress={() => openEditGiftModal(null)}>Add gift idea</Button>
      </List.Section>

      {/* Interactions */}
      <List.Section>
        <List.Subheader>Interactions</List.Subheader>
        {(interData?.interactions ?? []).map((ix: any) => (
          <Card key={ix.id} style={{ marginBottom: 8 }}>
            <Card.Title title={ix.summary} subtitle={[ix.date, ix.channel, ix.location].filter(Boolean).join(' • ')} right={() => (
              <View style={{ flexDirection: 'row' }}>
                <IconButton icon="pencil" onPress={() => openEditInteractionModal(ix)} />
                <IconButton icon="delete" onPress={() => deleteInteraction({ variables: { id: ix.id } }).then(() => refetchInter())} />
              </View>
            )} />
          </Card>
        ))}
        <Button onPress={() => openEditInteractionModal(null)}>Add interaction</Button>
      </List.Section>

      <Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>Save</Button>

      {/* Gift Modal */}
      <Portal>
        <Modal visible={giftModalVisible} onDismiss={() => setGiftModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>{editingGiftId ? 'Edit Gift Idea' : 'Add Gift Idea'}</Text>
          <TextInput label="Title" value={giftTitle} onChangeText={setGiftTitle} style={{ marginBottom: 8 }} />
          <TextInput label="Notes" value={giftNotes} onChangeText={setGiftNotes} style={{ marginBottom: 8 }} />
          <Menu visible={giftOccasionMenuVisible} onDismiss={() => setGiftOccasionMenuVisible(false)} anchor={
            <TextInput label="Occasion" value={giftOccasion} right={<TextInput.Icon icon="menu-down" onPress={() => setGiftOccasionMenuVisible(true)} />} onPressIn={() => setGiftOccasionMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />
          }>
            {['birthday','holiday','anniversary','other'].map((opt) => (
              <Menu.Item key={opt} onPress={() => { setGiftOccasion(opt); setGiftOccasionMenuVisible(false); }} title={opt} />
            ))}
          </Menu>
          <Menu visible={giftStatusMenuVisible} onDismiss={() => setGiftStatusMenuVisible(false)} anchor={
            <TextInput label="Status" value={giftStatus} right={<TextInput.Icon icon="menu-down" onPress={() => setGiftStatusMenuVisible(true)} />} onPressIn={() => setGiftStatusMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />
          }>
            {['idea','shortlist','purchased','gifted'].map((opt) => (
              <Menu.Item key={opt} onPress={() => { setGiftStatus(opt); setGiftStatusMenuVisible(false); }} title={opt} />
            ))}
          </Menu>
          <Menu visible={giftPriorityMenuVisible} onDismiss={() => setGiftPriorityMenuVisible(false)} anchor={
            <TextInput label="Priority" value={giftPriority} right={<TextInput.Icon icon="menu-down" onPress={() => setGiftPriorityMenuVisible(true)} />} onPressIn={() => setGiftPriorityMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />
          }>
            {['1','2','3'].map((opt) => (
              <Menu.Item key={opt} onPress={() => { setGiftPriority(opt); setGiftPriorityMenuVisible(false); }} title={opt} />
            ))}
          </Menu>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={() => setGiftModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={saveGiftModal} disabled={!giftTitle.trim()}>Save</Button>
          </View>
        </Modal>
      </Portal>

      {/* Interaction Modal */}
      <Portal>
        <Modal visible={interModalVisible} onDismiss={() => setInterModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>{editingInterId ? 'Edit Interaction' : 'Add Interaction'}</Text>
          <TextInput label="Summary" value={interSummary} onChangeText={setInterSummary} style={{ marginBottom: 8 }} />
          <TextInput label="Date" value={interDate} editable={false} right={<TextInput.Icon icon="calendar" onPress={openInterDatePicker} />} onPressIn={openInterDatePicker} style={{ marginBottom: 8 }} />
          {Platform.OS === 'android' && interShowPicker && (
            <DateTimePicker value={interDateObj ?? new Date()} mode="date" display="default" onChange={(event: any, date?: Date) => {
              setInterShowPicker(false);
              if (event?.type === 'set' && date) {
                setInterDateObj(date);
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                setInterDate(`${yyyy}-${mm}-${dd}`);
              }
            }} />
          )}
          {Platform.OS === 'ios' && (
            <Portal>
              <Modal visible={interIosModalVisible} onDismiss={() => setInterIosModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 }}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Date</Text>
                <DateTimePicker value={interTempDate} mode="date" display="spinner" onChange={(_, date) => { if (date) setInterTempDate(date); }} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Button onPress={() => setInterIosModalVisible(false)}>Cancel</Button>
                  <Button mode="contained" onPress={() => {
                    setInterDateObj(interTempDate);
                    const yyyy = interTempDate.getFullYear();
                    const mm = String(interTempDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(interTempDate.getDate()).padStart(2, '0');
                    setInterDate(`${yyyy}-${mm}-${dd}`);
                    setInterIosModalVisible(false);
                  }}>Done</Button>
                </View>
              </Modal>
            </Portal>
          )}
          <Menu visible={interChannelMenuVisible} onDismiss={() => setInterChannelMenuVisible(false)} anchor={
            <TextInput label="Channel" value={interChannel} right={<TextInput.Icon icon="menu-down" onPress={() => setInterChannelMenuVisible(true)} />} onPressIn={() => setInterChannelMenuVisible(true)} editable={false} style={{ marginBottom: 8 }} />
          }>
            {['irl','call','text','video','other'].map((opt) => (
              <Menu.Item key={opt} onPress={() => { setInterChannel(opt); setInterChannelMenuVisible(false); }} title={opt} />
            ))}
          </Menu>
          <TextInput label="Location" value={interLocation} onChangeText={setInterLocation} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={() => setInterModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={saveInterModal} disabled={!interSummary.trim()}>Save</Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddPerson" component={AddPersonScreen} options={{ title: 'Add Person' }} />
            <Stack.Screen name="EditPerson" component={EditPersonScreen} options={{ title: 'Edit Person' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ApolloProvider>
  );
}
