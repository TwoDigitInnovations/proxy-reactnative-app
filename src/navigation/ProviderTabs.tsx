import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import HomeIcon from '../assets/tabsIcon/tabs-icon-1.svg';
import HomeIconSelected from '../assets/tabsIcon/tabs-icon-1selected.svg';
import AppointmentsIcon from '../assets/tabsIcon/tabs-icon-2.svg';
import AppointmentsIconSelected from '../assets/tabsIcon/tabs-icon-2selected.svg';
import HistoryIcon from '../assets/tabsIcon/tabs-icon-3.svg';
import HistoryIconSelected from '../assets/tabsIcon/tabs-icon-3selected.svg';
import SettingsIcon from '../assets/tabsIcon/tabs-icon-4.svg';
import SettingsIconSelected from '../assets/tabsIcon/tabs-icon-4selected.svg';
import HomeProvider from '../screens/provider/HomeProvider';
import HistoryProvider from '../screens/provider/HistoryProvider';
import { MyAppointmentsProviderStack } from './MyAppointmentsProviderStack';
import { SettingsProviderStack } from './SettingsProviderStack';
import type { ProviderTabParamList } from './types';
import { getTabBarStyle, tabBarLabelStyle, tabBarActiveTintColor, tabBarInactiveTintColor } from './tabBarStyle';

const Tab = createBottomTabNavigator<ProviderTabParamList>();

const iconMap: Record<keyof ProviderTabParamList, [React.FC<SvgProps>, React.FC<SvgProps>]> = {
  HomeProvider: [HomeIcon, HomeIconSelected],
  MyAppointmentsProvider: [AppointmentsIcon, AppointmentsIconSelected],
  HistoryProvider: [HistoryIcon, HistoryIconSelected],
  SettingsProvider: [SettingsIcon, SettingsIconSelected],
};

export function ProviderTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle: getTabBarStyle(insets),
        tabBarLabelStyle,
        tabBarIcon: ({ focused, size }) => {
          const [Icon, IconSelected] = iconMap[route.name as keyof ProviderTabParamList];
          const Component = focused ? IconSelected : Icon;
          return <Component width={size} height={size} />;
        },
      })}
    >
      <Tab.Screen name="HomeProvider" component={HomeProvider} options={{ title: 'Home' }} />
      <Tab.Screen
        name="MyAppointmentsProvider"
        component={MyAppointmentsProviderStack}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen name="HistoryProvider" component={HistoryProvider} options={{ title: 'History' }} />
      <Tab.Screen name="SettingsProvider" component={SettingsProviderStack} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
