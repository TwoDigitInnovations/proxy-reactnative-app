import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
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
import Home from '../screens/user/Home';
import History from '../screens/user/History';
import { MyAppointmentsStack } from './MyAppointmentsStack';
import { SettingsStack } from './SettingsStack';
import type { UserTabParamList } from './types';
import { getTabBarStyle, tabBarLabelStyle, tabBarActiveTintColor, tabBarInactiveTintColor } from './tabBarStyle';

const Tab = createBottomTabNavigator<UserTabParamList>();

const iconMap: Record<keyof UserTabParamList, [React.FC<SvgProps>, React.FC<SvgProps>]> = {
  Home: [HomeIcon, HomeIconSelected],
  MyAppointments: [AppointmentsIcon, AppointmentsIconSelected],
  History: [HistoryIcon, HistoryIconSelected],
  Settings: [SettingsIcon, SettingsIconSelected],
};

export function UserTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle: getTabBarStyle(insets),
        tabBarLabelStyle,
        tabBarIcon: ({ focused, size }) => {
          const [Icon, IconSelected] = iconMap[route.name as keyof UserTabParamList];
          const Component = focused ? IconSelected : Icon;
          return <Component width={size} height={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: t('Home') }} />
      <Tab.Screen
        name="MyAppointments"
        component={MyAppointmentsStack}
        options={{ title: t('Appointments') }}
      />
      <Tab.Screen name="History" component={History} options={{ title: t('History') }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ title: t('Settings') }} />
    </Tab.Navigator>
  );
}
