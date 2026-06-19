import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import PersonFormScreen from '../screens/PersonFormScreen';
import PersonHubScreen from '../screens/PersonHubScreen';
import EventsScreen from '../screens/EventsScreen';
import MomentsScreen from '../screens/MomentsScreen';
import GiftsScreen from '../screens/GiftsScreen';
import LoginScreen from '../screens/LoginScreen';
import AccountScreen from '../screens/AccountScreen';
import { useAuth } from '../providers/AuthContext';
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
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colorsLight.bg }}>
        <ActivityIndicator color={colorsLight.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorsLight.bg } }}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PersonHub" component={PersonHubScreen} />
            <Stack.Screen name="Person" component={PersonFormScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="Moments" component={MomentsScreen} />
            <Stack.Screen name="Gifts" component={GiftsScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
