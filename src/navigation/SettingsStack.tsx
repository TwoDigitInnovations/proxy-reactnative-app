import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Settings from '../screens/user/Settings';
import Profile from '../screens/user/Profile';
import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true, title: 'Profile' }} />
    </Stack.Navigator>
  );
}
