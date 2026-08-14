import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { UserTabs } from './UserTabs';
import { ProviderTabs } from './ProviderTabs';
import SignIn from '../screens/auth/SignIn';
import SignUp from '../screens/auth/SignUp';
import ForgotPassword from '../screens/auth/ForgotPassword';
import MyAppointmentsDetails from '../screens/user/MyAppointmentsDetails';
import PurposeOfVisit from '../screens/user/PurposeOfVisit';
import PaymentSuccess from '../screens/user/PaymentSuccess';
import PrivacyPolicy from '../screens/user/PrivacyPolicy';
import TermsAndConditions from '../screens/user/TermsAndConditions';
import Profile from '../screens/user/Profile';
import MyAppointmentsDetailsProvider from '../screens/provider/MyAppointmentsDetailsProvider';
import ProfileProvider from '../screens/provider/ProfileProvider';
import MyServiceProvider from '../screens/provider/MyServiceProvider';
import type { RootStackParamList } from './types';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RoleTabs() {
  const { userDetail } = useAuth();
  return userDetail?.role === 'provider' ? <ProviderTabs /> : <UserTabs />;
}

export function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={RoleTabs} />
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
            <Stack.Screen
              name="PaymentSuccess"
              component={PaymentSuccess}
              options={{ headerShown: true, title: 'Confirmation' }}
            />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true, title: 'Profile' }} />
            <Stack.Screen
              name="MyAppointmentsDetailsProvider"
              component={MyAppointmentsDetailsProvider}
              options={{ headerShown: true, title: 'Appointment Details' }}
            />
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
          </>
        )}
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{ headerShown: true, title: 'Privacy Policy' }}
        />
        <Stack.Screen
          name="TermsAndConditions"
          component={TermsAndConditions}
          options={{ headerShown: true, title: 'Terms & Conditions' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
});
