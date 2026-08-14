import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

const LANGUAGES: { code: 'en' | 'fr'; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

function SettingsRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function SettingsProvider() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  useEffect(() => {
    AsyncStorage.getItem('language').then(stored => {
      if (stored === 'en' || stored === 'fr') setLanguage(stored);
    });
  }, []);

  async function selectLanguage(code: 'en' | 'fr') {
    setLanguage(code);
    await AsyncStorage.setItem('language', code);
  }

  function confirmLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => logout() },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <PageHeader title="Settings" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.languageRow}>
          {LANGUAGES.map(item => (
            <TouchableOpacity
              key={item.code}
              style={[styles.languageChip, language === item.code && styles.languageChipActive]}
              onPress={() => selectLanguage(item.code)}>
              <Text style={[styles.languageChipText, language === item.code && styles.languageChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SettingsRow label="Profile" onPress={() => navigation.navigate('ProfileProvider')} />
        <SettingsRow label="My Service" onPress={() => navigation.navigate('MyServiceProvider')} />
        <SettingsRow label="Terms and Conditions" onPress={() => navigation.navigate('TermsAndConditions')} />
        <SettingsRow label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={confirmLogout}>
          <Text style={styles.dangerText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDeleteAccount} style={styles.deleteRow}>
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { fontSize: 13, color: colors.gray, marginBottom: 10 },
  languageRow: { flexDirection: 'row', gap: 10 },
  languageChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  languageChipActive: { backgroundColor: colors.primaryAlt, borderColor: colors.primaryAlt },
  languageChipText: { fontSize: 13, color: colors.textDark },
  languageChipTextActive: { color: colors.white },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundLightAlt,
  },
  rowLabel: { fontSize: 15, color: colors.textDark },
  chevron: { fontSize: 20, color: colors.border },
  deleteRow: { marginTop: 16 },
  dangerText: { fontSize: 15, color: 'red', fontWeight: '600' },
});
