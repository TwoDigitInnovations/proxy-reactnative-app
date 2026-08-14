export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Tabs: undefined;
  MyAppointmentsDetails: { appointmentId: string };
  PurposeOfVisit: { appointmentId: string };
  PaymentSuccess: { appointmentId: string };
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  Profile: undefined;
  MyAppointmentsDetailsProvider: { appointmentId: string };
  ProfileProvider: undefined;
  MyServiceProvider: undefined;
};

export type UserTabParamList = {
  Home: undefined;
  MyAppointments: undefined;
  History: undefined;
  Settings: undefined;
};

export type ProviderTabParamList = {
  HomeProvider: undefined;
  MyAppointmentsProvider: undefined;
  HistoryProvider: undefined;
  SettingsProvider: undefined;
};
