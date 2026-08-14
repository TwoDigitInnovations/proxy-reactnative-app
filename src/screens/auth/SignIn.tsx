import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/types';

const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignIn({ navigation }: Props) {
  const { login } = useAuth();
  const { showLoading, hideLoading, showToast } = useUi();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailError = submitted && !email ? 'Email is required.' : submitted && !EMAIL_PATTERN.test(email) ? 'Invalid your email' : undefined;
  const passwordError = submitted && !password ? 'Password is required.' : undefined;

  async function handleSignIn() {
    setSubmitted(true);
    if (!email || !EMAIL_PATTERN.test(email) || !password) {
      return;
    }

    showLoading();
    try {
      const res: any = await authApi.login({ email, password });
      await login(res.token, res.user);
      showToast('You are successfully logged in');
      setSubmitted(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.log('SignIn error:', err);
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
          <Text style={styles.subText}>Please enter your sign in details.</Text>
        </View>

        <Image source={require('../../assets/images/bgImg.png')} style={styles.bgImage} resizeMode="contain" />

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
          label="Password"
          placeholder="**************"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />

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

        <PrimaryButton title="Sign in" onPress={handleSignIn} style={styles.signInButton} />

        <Text style={styles.accountText}>
          Didn't have any account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
            Sign up
          </Text>
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Forget Password ?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  welcomeBlock: { alignItems: 'flex-start' },
  welcomeText: { fontSize: 28, fontWeight: '700', color: colors.textDarker, marginBottom: 3 },
  subText: { fontSize: 14, color: colors.border },
  bgImage: { height: 200, width: 200, alignSelf: 'center', marginVertical: 20 },
  termsText: { fontSize: 12, lineHeight: 16, textAlign: 'center', color: colors.border, paddingVertical: 30 },
  link: { fontWeight: '700', color: colors.border },
  signInButton: { shadowColor: colors.overlayBlue, shadowOpacity: 1, shadowRadius: 20, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  accountText: { fontSize: 12, textAlign: 'center', color: colors.border, paddingVertical: 20, fontFamily: fontFamilies.poppins.regular },
  forgotPassword: { fontSize: 12, fontWeight: '700', textAlign: 'center', color: colors.border },
});
