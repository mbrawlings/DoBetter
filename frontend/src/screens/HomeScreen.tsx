import * as React from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { Text, FAB, Searchbar, Card, ActivityIndicator, useTheme, Icon } from 'react-native-paper';
import { PERSONS_QUERY } from '../graphql/operations';
import { spacing, getAvatarColor, getInitials } from '../theme/theme';

function InitialsAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = getInitials(firstName, lastName);
  const bg = getAvatarColor(`${firstName}${lastName}`);
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

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
    }, [refetch]),
  );

  const [searchQuery, setSearchQuery] = React.useState('');

  if (error) {
    return (
      <View style={[styles.center, { padding: spacing.lg }]}>
        <Icon source="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text variant="titleMedium" style={{ marginTop: spacing.md }}>
          Something went wrong
        </Text>
        <Text style={{ marginTop: spacing.xs, color: theme.colors.onSurfaceVariant }}>
          {String((error as any).message)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
        <Searchbar
          placeholder="Search people"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={{ fontSize: 16 }}
          elevation={0}
          onSubmitEditing={() =>
            refetch({ filter: searchQuery ? { search: searchQuery } : null })
          }
        />
      </View>

      {loading && persons.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: spacing.md, color: theme.colors.onSurfaceVariant }}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={persons}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => refetch()}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card
              mode="elevated"
              style={styles.card}
              onPress={() =>
                (navigation as any).navigate('Person' as never, { id: item.id } as never)
              }
            >
              <Card.Title
                title={`${item.firstName} ${item.lastName}`}
                titleStyle={styles.cardTitle}
                subtitle={[item.relationship, item.city].filter(Boolean).join(' \u2022 ') || undefined}
                subtitleStyle={styles.cardSubtitle}
                left={() => (
                  <InitialsAvatar firstName={item.firstName} lastName={item.lastName} />
                )}
                leftStyle={styles.cardLeft}
              />
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon source="account-group-outline" size={64} color={theme.colors.outline} />
              <Text
                variant="titleMedium"
                style={{ marginTop: spacing.lg, color: theme.colors.onSurfaceVariant }}
              >
                No people yet
              </Text>
              <Text style={{ marginTop: spacing.xs, color: theme.colors.outline }}>
                Tap + to add someone
              </Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        onPress={() => (navigation as any).navigate('Person' as never)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        accessibilityLabel="Add person"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchbar: {
    borderRadius: 12,
    elevation: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 96,
    gap: 10,
  },
  card: {
    borderRadius: 14,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  cardLeft: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    borderRadius: 16,
  },
});
