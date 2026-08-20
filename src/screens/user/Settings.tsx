import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components/Text';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PageHeader } from '../../components/PageHeader';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Icon, type IconName } from '../../components/Icon';
import type { RootStackParamList, SettingsStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList & RootStackParamList>;

interface MenuItemProps {
  iconName: IconName;
  iconColor: string;
  iconBg: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
}

function SettingsMenuItem({ iconName, iconColor, iconBg, label, subtitle, onPress, isLast }: MenuItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={18} color={iconColor} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.menuLabel}>{label}</Text>
          {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Icon name="chevron-right" size={18} color="#C0C0C0" />
    </TouchableOpacity>
  );
}

export default function Settings() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { userDetail, logout } = useAuth();

  function confirmLogout() {
    Alert.alert(t('Logout'), t('Are you sure you want to log out of your account?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Log Out'), style: 'destructive', onPress: () => logout() },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      t('Delete Account'),
      t('Are you sure you want to delete your account? This action cannot be undone.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Delete'), style: 'destructive', onPress: () => logout() },
      ],
    );
  }

  const initialLetter = userDetail?.name ? userDetail.name.charAt(0).toUpperCase() : 'U';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <PageHeader title={t('Settings')} />

      {/* User Profile Card Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {userDetail?.profile ? (
            <Image source={{ uri: userDetail.profile }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userDetail?.name || t('Customer User')}</Text>
          <Text style={styles.userEmail}>
            {userDetail?.email || userDetail?.phone || t('Account Settings')}
          </Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{t('Customer Account')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.editProfileBtnText}>{t('Edit')}</Text>
        </TouchableOpacity>
      </View>

      {/* Language Preference Section */}
      <LanguageSwitcher />

      {/* Account & App Settings Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeaderTitle}>{t('ACCOUNT & HELP')}</Text>

        <SettingsMenuItem
          iconName="user"
          iconColor="#1D4ED8"
          iconBg="#E8F0FE"
          label={t('Personal Profile')}
          subtitle={t('Manage your personal details and photo')}
          onPress={() => navigation.navigate('Profile')}
        />

        <SettingsMenuItem
          iconName="alert-triangle"
          iconColor="#D97706"
          iconBg="#FEF3C7"
          label={t('Report a Problem')}
          subtitle={t('Submit an issue or support ticket')}
          onPress={() => navigation.navigate('ReportProblem' as never)}
        />

        <SettingsMenuItem
          iconName="file-text"
          iconColor="#7C3AED"
          iconBg="#F3E8FF"
          label={t('Terms & Conditions')}
          subtitle={t('Legal terms of service')}
          onPress={() => navigation.navigate('TermsAndConditions')}
        />

        <SettingsMenuItem
          iconName="shield"
          iconColor="#15803D"
          iconBg="#DCFCE7"
          label={t('Privacy Policy')}
          subtitle={t('Data privacy & security policies')}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          isLast={true}
        />
      </View>

      {/* Danger Zone Actions */}
      <View style={styles.dangerSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout} activeOpacity={0.8}>
          <Icon name="logout" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>{t('Log Out')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteAccount} activeOpacity={0.7}>
          <Text style={styles.deleteText}>{t('Delete Account')}</Text>
        </TouchableOpacity>
      </View>

      {/* App Version Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>
          {t('Proxi Mobile App • Version {{version}}', { version: '1.0.0' })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scroll: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    marginRight: 14,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDarker,
  },
  userEmail: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  editProfileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  sectionCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0A0A0',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDarker,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  dangerSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
