import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MyAppointments from '../screens/user/MyAppointments';
import MyAppointmentsDetails from '../screens/user/MyAppointmentsDetails';
import PurposeOfVisit from '../screens/user/PurposeOfVisit';
import type { MyAppointmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<MyAppointmentsStackParamList>();

export function MyAppointmentsStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyAppointments" component={MyAppointments} />
      <Stack.Screen
        name="MyAppointmentsDetails"
        component={MyAppointmentsDetails}
        options={{ headerShown: true, title: t('Appointment Details') }}
      />
      <Stack.Screen
        name="PurposeOfVisit"
        component={PurposeOfVisit}
        options={{ headerShown: true, title: t('Purpose of Visit') }}
      />
    </Stack.Navigator>
  );
}
