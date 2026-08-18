import React from 'react';
import { LegalDocument } from '../../components/LegalDocument';
import { TERMS_SECTIONS } from '../../content/termsAndConditions';

export default function TermsAndConditions() {
  return (
    <LegalDocument
      field="termsAndConditions"
      fallbackSections={TERMS_SECTIONS}
      errorLabel="Terms & Conditions"
      footer="Please also read our Privacy Policy to understand how your personal data, including your location, is handled."
    />
  );
}
