import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsProvider from '../screens/provider/SettingsProvider';
import ProfileProvider from '../screens/provider/ProfileProvider';
import MyServiceProvider from '../screens/provider/MyServiceProvider';
import type { SettingsProviderStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsProviderStackParamList>();

export function SettingsProviderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsProvider" component={SettingsProvider} />
      <Stack.Screen
        name="ProfileProvider"
        component={ProfileProvider}
        options={{ headerShown: true, title: 'Profile' }}
      />
      <Stack.Screen
        name="MyServiceProvider"
        component={MyServiceProvider}
        options={{ headerShown: true, title: 'My Service' }}
      />
    </Stack.Navigator>
  );
}
