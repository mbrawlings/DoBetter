import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PersonFormScreen from '../screens/PersonFormScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
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
