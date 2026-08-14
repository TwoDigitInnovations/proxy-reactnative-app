import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyAppointments from '../screens/user/MyAppointments';
import MyAppointmentsDetails from '../screens/user/MyAppointmentsDetails';
import PurposeOfVisit from '../screens/user/PurposeOfVisit';
import type { MyAppointmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<MyAppointmentsStackParamList>();

export function MyAppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyAppointments" component={MyAppointments} />
      <Stack.Screen
        name="MyAppointmentsDetails"
        component={MyAppointmentsDetails}
        options={{ headerShown: true, title: 'Appointment Details' }}
      />
      <Stack.Screen
        name="PurposeOfVisit"
        component={PurposeOfVisit}
        options={{ headerShown: true, title: 'Purpose of Visit' }}
      />
    </Stack.Navigator>
  );
}
