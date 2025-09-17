import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddPersonScreen from '../screens/AddPersonScreen';
import EditPersonScreen from '../screens/EditPersonScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddPerson" component={AddPersonScreen} options={{ title: 'Add Person' }} />
        <Stack.Screen name="EditPerson" component={EditPersonScreen} options={{ title: 'Edit Person' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


