import React from 'react';
import { useTranslation } from 'react-i18next';
import { LegalDocument } from '../../components/LegalDocument';
import { PRIVACY_SECTIONS } from '../../content/privacyPolicy';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <LegalDocument
      field="privacy"
      fallbackSections={PRIVACY_SECTIONS}
      errorLabel={t('Privacy Policy')}
      footer={t(
        'Please also read our Terms & Conditions, which govern your use of the app and the bookings you make through it.',
      )}
    />
  );
}
