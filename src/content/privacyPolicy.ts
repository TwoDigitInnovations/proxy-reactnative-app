import { SUPPORT_EMAIL, type LegalSection } from './legal';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: '1. About This Policy',
    paragraphs: [
      'This Privacy Policy explains what personal data the Proxi mobile application collects, why we collect it, who we share it with, and the choices you have.',
      'It applies to both people who use Proxi to find agencies and book waiting tickets, and to the service providers who publish listings in the app.',
    ],
  },
  {
    heading: '2. Information You Give Us',
    paragraphs: ['When you create an account and use the app, we collect:'],
    bullets: [
      'account details — your name, email address, phone number, and password',
      'your profile photo, if you choose to upload one',
      'booking details — the name, email, phone number, gender, and purpose of visit you supply when reserving a waiting ticket',
      'the agency, date, and time slot you select',
      'messages and requests you send us for support',
    ],
  },
  {
    heading: '3. Information from Service Providers',
    paragraphs: [
      'If you register as a service provider, we additionally collect the business information you publish — service names and descriptions, addresses and map locations, photos, available time slots, and your availability status.',
      'We may also collect verification documents you upload so we can confirm that a listing is genuine before it appears to users.',
    ],
  },
  {
    heading: '4. Location Information',
    paragraphs: [
      'With your permission, Proxi collects your device location so we can show agencies near you and calculate routes. You can refuse or later withdraw this permission in your device settings; features that depend on your position will then be limited.',
      'Your most recent chosen location is stored on your own device so the map can open without waiting for a new fix. When you search for an address, the text you type and the coordinates involved are sent to our mapping provider to return suggestions and routes.',
      'We collect location only while you are using the app. We do not track your location in the background.',
    ],
  },
  {
    heading: '5. Payment Information',
    paragraphs: [
      'When a booking involves a fee, payment is handled by third-party payment providers. Your card, wallet, or mobile money credentials are processed by those providers under their own privacy terms.',
      'We retain a record of the transaction — the method used, the amount, a transaction reference, and whether it succeeded — so we can confirm your ticket and handle refunds and disputes.',
    ],
  },
  {
    heading: '6. Technical Information',
    paragraphs: [
      'To keep you signed in, an authentication token and a copy of your basic account details are stored on your device. We also process technical information such as device type and app version to diagnose faults and improve reliability.',
    ],
  },
  {
    heading: '7. Sensitive Information',
    paragraphs: [
      'Some information you provide may be sensitive. Booking a visit to a hospital or clinic, together with the purpose of visit you enter, can reveal information about your health. We also ask for gender at the time of booking.',
      'We collect this only because the agency needs it to prepare for your visit, we limit who can see it, and we do not use it for advertising or profiling.',
    ],
  },
  {
    heading: '8. How We Use Your Information',
    paragraphs: ['We use the information described above to:'],
    bullets: [
      'create and manage your account and keep you signed in',
      'show you nearby agencies, their crowd levels, and estimated waiting times',
      'calculate routes and travel times to a chosen agency',
      'take bookings, issue waiting tickets, and pass your booking to the agency',
      'process payments and handle refunds and disputes',
      'send booking confirmations, reminders, and service notifications',
      'show you your visit and reservation history',
      'verify service providers and keep listings trustworthy',
      'detect and prevent fraud, abuse, and misuse of the app',
      'diagnose faults, improve the app, and meet our legal obligations',
    ],
  },
  {
    heading: '9. Sharing with Service Providers',
    paragraphs: [
      'When you book a waiting ticket, the agency you selected receives the details needed to serve you — including your name, contact details, gender, purpose of visit, and the date and time of your booking.',
      'That agency is responsible for how it handles your information once it receives it, in line with its own privacy practices and the laws that apply to it.',
    ],
  },
  {
    heading: '10. Other Sharing',
    paragraphs: ['We also share limited information with:'],
    bullets: [
      'mapping and navigation providers, to return address suggestions, map tiles, and routes',
      'payment providers, to authorise and settle transactions',
      'hosting and infrastructure suppliers that run our servers on our behalf',
      'authorities or advisers where we are legally required to disclose information, or to establish or defend legal claims',
    ],
  },
  {
    heading: '11. We Do Not Sell Your Data',
    paragraphs: [
      'We do not sell your personal data, and we do not share it with third parties for their own advertising purposes.',
    ],
  },
  {
    heading: '12. How Long We Keep It',
    paragraphs: [
      'We keep your account information for as long as your account is open. Booking and payment records are kept for as long as needed to provide the service and to meet accounting, tax, and legal obligations.',
      'When information is no longer needed, we delete it or render it anonymous so it can no longer identify you.',
    ],
  },
  {
    heading: '13. Your Rights',
    paragraphs: ['Depending on where you live, you may have the right to:'],
    bullets: [
      'ask what personal data we hold about you and obtain a copy',
      'have inaccurate details corrected',
      'ask us to delete your account and associated data',
      'withdraw a permission you previously granted, such as location or camera access',
      'object to or restrict certain uses of your information',
      'complain to your local data protection authority',
    ],
  },
  {
    heading: '14. Keeping Your Information Secure',
    paragraphs: [
      'Traffic between the app and our servers is encrypted in transit, access to personal data is restricted to those who need it, and payment credentials are handled by specialist payment providers rather than stored by us.',
      'No system can be guaranteed completely secure. Please protect your password, and contact us immediately if you believe your account has been accessed without your permission.',
    ],
  },
  {
    heading: '15. Children',
    paragraphs: [
      'Proxi is not intended for children. We do not knowingly collect personal data from a child. If you believe a child has provided us with information, contact us and we will delete it.',
    ],
  },
  {
    heading: '16. International Transfers',
    paragraphs: [
      'Our servers and some of our suppliers may be located outside your country. Where your information is transferred abroad, we take steps to ensure it remains protected to a comparable standard.',
    ],
  },
  {
    heading: '17. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. The date at the top of this page shows when it was last revised, and material changes will be brought to your attention in the app.',
    ],
  },
  {
    heading: '18. Contact Us',
    paragraphs: [
      `If you have questions about this policy, or want to exercise any of the rights described above, contact us at ${SUPPORT_EMAIL}.`,
    ],
  },
];

// Internal checklist — never rendered. Draft copy, not cleared legal text.
export const PRIVACY_REVIEW_NOTES = [
  'Full review by a qualified privacy lawyer in each launch market before release.',
  'Name the data controller entity, its registered address, and a DPO or privacy contact if required.',
  'Confirm a user-facing privacy contact; SUPPORT_EMAIL currently points at the vendor.',
  'State the legal basis for each purpose if launching under GDPR or an equivalent regime.',
  'Set concrete retention periods in section 12 — currently phrased by purpose, not duration.',
  'Confirm the health-data position in section 7: purpose_of_visit plus a clinic booking may qualify as special-category data requiring explicit consent.',
  'List the actual sub-processors in section 10 (mapping, payments, hosting) once contracts are signed.',
  'Set the minimum age in section 15 to match the launch market, and align with the Terms.',
  'Name the countries data is transferred to and the safeguard used in section 16 (spec Q8).',
  'Align with the Terms, the store data-safety declarations, and the in-app permission prompts.',
  'Host a public web copy — both app stores require a reachable privacy policy URL.',
];
