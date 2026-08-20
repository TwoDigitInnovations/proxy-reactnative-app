import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n';
import { colors } from '../theme/colors';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionHeaderTitle}>{t('PREFERENCES')}</Text>
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>{t('App Language')}</Text>
        <View style={styles.languageRow}>
          {LANGUAGES.map(item => {
            const active = language === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                activeOpacity={0.8}
                style={[styles.languageChip, active && styles.languageChipActive]}
                onPress={() => setLanguage(item.code)}>
                <Text style={styles.flagText}>{item.flag}</Text>
                <Text style={[styles.languageChipText, active && styles.languageChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  languageContainer: {
    marginBottom: 4,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 10,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    gap: 6,
  },
  languageChipActive: {
    backgroundColor: colors.primaryAlt,
    borderColor: colors.primaryAlt,
  },
  flagText: {
    fontSize: 16,
  },
  languageChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
  },
  languageChipTextActive: {
    color: colors.white,
  },
});
