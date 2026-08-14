import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useUi } from '../../context/UiContext';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPassword({ navigation }: Props) {
  const { showLoading, hideLoading, showToast } = useUi();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailError = submitted && !email ? 'Email is required.' : submitted && !EMAIL_PATTERN.test(email) ? 'Invalid your email' : undefined;
  const otpError = submitted && !otp ? 'OTP is required.' : undefined;
  const passwordError = submitted && !password ? 'Password is required.' : undefined;
  const confirmPasswordError = submitted && !confirmPassword ? 'Confirm password is required.' : undefined;

  async function sendOTP() {
    const res: any = await authApi.sendOTP({ email });
    showToast(res?.data?.message ?? 'OTP sent');
    setToken(res?.data?.token ?? '');
    setEmail('');
    setStep(2);
  }

  async function verifyOTP() {
    const res: any = await authApi.verifyOTP({ otp, token });
    showToast(res?.data?.message ?? 'OTP verified');
    setToken(res?.data?.token ?? token);
    setOtp('');
    setStep(3);
  }

  async function changePassword() {
    if (password !== confirmPassword) {
      showToast("Confirm password don't match with password");
      return;
    }
    const res: any = await authApi.changePassword({ password, token });
    showToast(res?.data?.message ?? 'Password changed');
    setPassword('');
    setConfirmPassword('');
    setStep(1);
    navigation.navigate('SignIn');
  }

  async function handleSubmit() {
    setSubmitted(true);
    if (step === 1 && (!email || !EMAIL_PATTERN.test(email))) return;
    if (step === 2 && !otp) return;
    if (step === 3 && (!password || !confirmPassword)) return;

    showLoading();
    try {
      if (step === 1) await sendOTP();
      else if (step === 2) await verifyOTP();
      else await changePassword();
      setSubmitted(false);
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeText}>Forgot password</Text>
        </View>

        <Image source={require('../../assets/images/forgotPasswordBg.png')} style={styles.bgImage} resizeMode="contain" />

        {step === 1 && (
          <TextField
            label="Email"
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={emailError}
          />
        )}

        {step === 2 && (
          <TextField label="OTP" placeholder="**************" value={otp} onChangeText={setOtp} error={otpError} />
        )}

        {step === 3 && (
          <>
            <TextField
              label="Enter Password"
              placeholder="**************"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={passwordError}
            />
            <TextField
              label="Enter Confirm Password"
              placeholder="**************"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={confirmPasswordError}
            />
          </>
        )}

        <PrimaryButton title="Save" onPress={handleSubmit} style={styles.saveButton} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, padding: 20 },
  backButton: { width: 32, height: 32, justifyContent: 'center' },
  backIcon: { fontSize: 28, color: colors.textDarker },
  welcomeBlock: { marginTop: 12 },
  welcomeText: { fontSize: 28, fontWeight: '700', color: colors.textDarker },
  bgImage: { height: 200, width: 200, alignSelf: 'center', marginVertical: 20 },
  saveButton: { marginTop: 30 },
});
