import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';
import type { UserRole } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useUi } from '../../context/UiContext';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUp({ navigation }: Props) {
  const { showLoading, hideLoading, showToast } = useUi();

  const [role, setRole] = useState<UserRole>('user');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !fullName ? 'Name is required.' : undefined;
  const emailError = submitted && !email ? 'Email is required.' : submitted && !EMAIL_PATTERN.test(email) ? 'Invalid your email' : undefined;
  const phoneError = submitted && !phoneNumber ? 'Mobile Number is required.' : undefined;
  const passwordError = submitted && !password ? 'Password is required.' : undefined;

  async function handleSignUp() {
    setSubmitted(true);
    if (!fullName || !email || !EMAIL_PATTERN.test(email) || !phoneNumber || !password) {
      return;
    }

    showLoading();
    try {
      await authApi.register({ name: fullName, email, phone: phoneNumber, password, role });
      showToast('Congratulations! Your sign-up process was successful.');
      setSubmitted(false);
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      navigation.navigate('SignIn');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      hideLoading();
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.subText}>Please enter your sign up details.</Text>
        </View>

        <View style={styles.roleRow}>
          <PrimaryButton
            title="User"
            onPress={() => setRole('user')}
            style={[styles.roleButton, role !== 'user' && styles.roleButtonInactive]}
            textStyle={role !== 'user' ? styles.roleButtonTextInactive : undefined}
          />
          <PrimaryButton
            title="Provider"
            onPress={() => setRole('provider')}
            style={[styles.roleButton, role !== 'provider' && styles.roleButtonInactive]}
            textStyle={role !== 'provider' ? styles.roleButtonTextInactive : undefined}
          />
        </View>

        <TextField label="Name" placeholder="Enter Name" value={fullName} onChangeText={setFullName} error={nameError} />
        <TextField
          label="Email"
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={emailError}
        />
        <TextField
          label="Mobile Number"
          placeholder="Enter Mobile Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          error={phoneError}
        />
        <TextField label="Password" placeholder="**************" secureTextEntry value={password} onChangeText={setPassword} error={passwordError} />

        <Text style={styles.termsText}>
          By clicking Sign up, you agree with our{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('TermsAndConditions')}>
            Terms and Conditions{' '}
          </Text>
          and{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}>
            Privacy Policy
          </Text>
        </Text>

        <PrimaryButton title="Next" onPress={handleSignUp} />

        <Text style={styles.accountText}>
          Already have any account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}>
            Sign in
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  welcomeBlock: { alignItems: 'flex-start', marginBottom: 12 },
  welcomeText: { fontSize: 28, fontWeight: '700', color: colors.textDarker, marginBottom: 3 },
  subText: { fontSize: 14, color: colors.border },
  roleRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  roleButton: { flex: 1 },
  roleButtonInactive: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primaryAlt },
  roleButtonTextInactive: { color: colors.primaryAlt },
  termsText: { fontSize: 12, lineHeight: 16, textAlign: 'center', color: colors.border, paddingVertical: 30 },
  link: { fontWeight: '700', color: colors.border },
  accountText: { fontSize: 12, textAlign: 'center', color: colors.border, paddingVertical: 20 },
});
