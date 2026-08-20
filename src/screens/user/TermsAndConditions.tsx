import React from 'react';
import { useTranslation } from 'react-i18next';
import { LegalDocument } from '../../components/LegalDocument';
import { TERMS_SECTIONS } from '../../content/termsAndConditions';

export default function TermsAndConditions() {
  const { t } = useTranslation();
  return (
    <LegalDocument
      field="termsAndConditions"
      fallbackSections={TERMS_SECTIONS}
      errorLabel={t('Terms & Conditions')}
      footer={t(
        'Please also read our Privacy Policy to understand how your personal data, including your location, is handled.',
      )}
    />
  );
}
