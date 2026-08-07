import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ImportContactsScreen from '../screens/ImportContactsScreen';
import PersonFormScreen from '../screens/PersonFormScreen';
import PersonHubScreen from '../screens/PersonHubScreen';
import EventsScreen from '../screens/EventsScreen';
import MomentsScreen from '../screens/MomentsScreen';
import GiftsScreen from '../screens/GiftsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import AccountScreen from '../screens/AccountScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { useAuth } from '../providers/AuthContext';
import { useNotificationSync } from '../notifications/useNotificationSync';
import { navigationRef } from './navigationRef';
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
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      {token ? <AuthedNavigator /> : <UnauthedNavigator />}
    </NavigationContainer>
  );
}

function AuthedNavigator() {
  useNotificationSync();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorsLight.bg } }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ImportContacts" component={ImportContactsScreen} />
      <Stack.Screen name="PersonHub" component={PersonHubScreen} />
      <Stack.Screen name="Person" component={PersonFormScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="Moments" component={MomentsScreen} />
      <Stack.Screen name="Gifts" component={GiftsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function UnauthedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorsLight.bg } }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
}
