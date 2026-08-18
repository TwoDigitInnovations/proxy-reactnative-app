import React from 'react';
import { LegalDocument } from '../../components/LegalDocument';
import { PRIVACY_SECTIONS } from '../../content/privacyPolicy';

export default function PrivacyPolicy() {
  return (
    <LegalDocument
      field="privacy"
      fallbackSections={PRIVACY_SECTIONS}
      errorLabel="Privacy Policy"
      footer="Please also read our Terms & Conditions, which govern your use of the app and the bookings you make through it."
    />
  );
}
