import * as React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { List, Text, FAB, Searchbar, Card, ActivityIndicator, useTheme } from 'react-native-paper';
import { PERSONS_QUERY } from '../graphql/operations';

export default function HomeScreen() {
  const { data, loading, error, refetch } = useQuery(PERSONS_QUERY, {
    variables: { filter: null },
    fetchPolicy: 'cache-and-network',
  });
  const navigation = useNavigation();
  const theme = useTheme();

  const persons = data?.persons ?? [];

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const [searchQuery, setSearchQuery] = React.useState('');

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text variant="titleMedium">Failed to load persons</Text>
        <Text style={{ marginTop: 8 }}>{String(error)}</Text>
        <Text style={{ marginTop: 8 }}>{String((error as any).message)}</Text>
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


