import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PersonFormScreen from '../screens/PersonFormScreen';
import { theme } from '../theme/theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          headerTintColor: theme.colors.primary,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'People' }}
        />
        <Stack.Screen
          name="Person"
          component={PersonFormScreen}
          options={({ route }: any) => ({
            title: route.params?.id ? 'Edit Person' : 'Add Person',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
