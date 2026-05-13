import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PersonFormScreen from '../screens/PersonFormScreen';
import { colorsLight } from '../theme/theme';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colorsLight.bg,
    card: colorsLight.bg,
    primary: colorsLight.primary,
    text: colorsLight.text,
    border: colorsLight.border,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorsLight.bg } }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Person" component={PersonFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
