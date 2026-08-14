import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyAppointmentsProvider from '../screens/provider/MyAppointmentsProvider';
import MyAppointmentsDetailsProvider from '../screens/provider/MyAppointmentsDetailsProvider';
import type { MyAppointmentsProviderStackParamList } from './types';

const Stack = createNativeStackNavigator<MyAppointmentsProviderStackParamList>();

export function MyAppointmentsProviderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyAppointmentsProvider" component={MyAppointmentsProvider} />
      <Stack.Screen
        name="MyAppointmentsDetailsProvider"
        component={MyAppointmentsDetailsProvider}
        options={{ headerShown: true, title: 'Appointment Details' }}
      />
    </Stack.Navigator>
  );
}
