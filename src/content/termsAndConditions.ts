import { SUPPORT_EMAIL, type LegalSection } from './legal';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: '1. Acceptance of These Terms',
    paragraphs: [
      'These Terms & Conditions govern your use of the Proxi mobile application and the services provided through it. By creating an account, booking a waiting ticket, or otherwise using the app, you confirm that you have read, understood, and agree to be bound by these Terms.',
      'If you do not agree with any part of these Terms, please do not use the app.',
    ],
  },
  {
    heading: '2. What Proxi Does',
    paragraphs: [
      'Proxi helps you locate service agencies — including banks, telecommunications offices, hospitals, clinics, and administrative centres — view how busy they currently are, plan a route to them, and reserve a waiting ticket in advance.',
      'Proxi is an intermediary platform. We are not the agency you visit, and we do not provide the banking, medical, telecommunications, or administrative services delivered at those locations. Your visit is governed by the policies of the agency itself.',
    ],
  },
  {
    heading: '3. Eligibility and Your Account',
    paragraphs: [
      'You must be legally capable of entering into a binding agreement in your country of residence to use Proxi. You are responsible for the accuracy of the information you provide and for keeping your login credentials confidential.',
      'You are responsible for all activity that occurs under your account. Tell us promptly if you believe your account has been used without your permission.',
    ],
  },
  {
    heading: '4. Service Provider Accounts',
    paragraphs: [
      'Agencies and service providers who publish listings on Proxi hold a separate account type and may be asked to supply verification documents. Provider accounts may be marked pending, verified, or suspended.',
      'Providers are responsible for the accuracy of the information they publish, including addresses, available services, opening times, and bookable slots, and for honouring the tickets booked through the app while their listing is shown as available.',
    ],
  },
  {
    heading: '5. Queue Information and Waiting Times Are Estimates',
    paragraphs: [
      'Crowd levels, queue counts, and estimated waiting times shown in the app are indicative only. They are derived from information supplied by service providers, their systems, and booking activity, and they can change at any moment.',
      'We do not guarantee that any figure shown will match the conditions you find on arrival, and no estimate constitutes a promise that you will be served within a particular time.',
    ],
  },
  {
    heading: '6. Routes and Navigation',
    paragraphs: [
      'Routes, distances, and travel times are generated using third-party mapping services and are provided for guidance only. Always follow road signs, traffic laws, and your own judgement. Never interact with the app while driving.',
    ],
  },
  {
    heading: '7. Booking a Waiting Ticket',
    paragraphs: [
      'When you book, you select an agency, a date, and an available time slot, and provide the details needed for your visit. A confirmed booking is identified by a ticket number shown in the app.',
      'A booking reserves your place in the queue for the selected slot. It is not a guarantee of a fixed appointment time, and the agency may adjust the order of service to reflect operational needs, emergencies, or priority cases.',
      'Please arrive in good time. Late arrival may mean your place is passed over.',
    ],
  },
  {
    heading: '8. Fees and Payment',
    paragraphs: [
      'Booking a waiting ticket may be subject to a service fee. The amount and currency that apply to your booking are displayed in the app before you confirm and pay.',
      'Payments are processed by third-party payment providers. Your payment details are handled by those providers under their own terms; we do not store your full card or wallet credentials.',
      'A ticket is confirmed only once payment has been successfully authorised. If authorisation fails, no ticket is issued.',
    ],
  },
  {
    heading: '9. Changes, Cancellations, and Refunds',
    paragraphs: [
      'The cancellation window and refund terms that apply to a booking are those presented to you in the app at the time you book.',
      'If an agency cancels, closes unexpectedly, or is unable to serve you at the booked slot, contact us and we will review your booking for a refund or rebooking.',
      'Any service fee may be non-refundable where you fail to attend a booked slot without cancelling, to the extent permitted by applicable law.',
    ],
  },
  {
    heading: '10. Location Data and Permissions',
    paragraphs: [
      'Proxi requests access to your device location to find nearby agencies and calculate routes. You may decline or later withdraw this permission in your device settings; parts of the app that depend on your position will then be limited.',
      'The app may also request camera and photo library access so you can upload a profile picture or supporting documents. How we handle personal data is described in our Privacy Policy.',
    ],
  },
  {
    heading: '11. Acceptable Use',
    paragraphs: ['When using Proxi, you agree not to:'],
    bullets: [
      'book tickets you do not intend to use, or book repeatedly to obstruct others',
      'submit false, misleading, or fraudulent information, including another person’s details',
      'use the app for any unlawful purpose, or to harass agency staff or other users',
      'attempt to gain unauthorised access to the app, our servers, or another user’s account',
      'copy, scrape, resell, or commercially exploit the app or its content without our written permission',
      'interfere with the operation of the app or attempt to circumvent its security features',
    ],
  },
  {
    heading: '12. Third-Party Services',
    paragraphs: [
      'Proxi relies on third-party services, including mapping and navigation providers and payment gateways. Your use of those features may also be subject to the terms of the relevant provider. We are not responsible for the availability, accuracy, or performance of third-party services.',
    ],
  },
  {
    heading: '13. Availability of the App',
    paragraphs: [
      'We aim to keep Proxi available and accurate, but we do not guarantee uninterrupted or error-free operation. Access may be suspended for maintenance, updates, or reasons beyond our control, including network and third-party outages.',
      'We may add, change, or withdraw features at any time.',
    ],
  },
  {
    heading: '14. Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by applicable law, Proxi is provided on an “as is” and “as available” basis, without warranties of any kind.',
      'We are not liable for indirect or consequential loss, including wasted journeys, missed appointments, lost time, or loss of opportunity arising from reliance on estimated queue or travel information, from the conduct of an agency, or from your inability to access the app.',
      'Nothing in these Terms excludes liability that cannot lawfully be excluded.',
    ],
  },
  {
    heading: '15. Suspension and Termination',
    paragraphs: [
      'You may stop using Proxi and request deletion of your account at any time.',
      'We may suspend or terminate access where these Terms are breached, where use is fraudulent or unlawful, or where required to protect users, agencies, or the service. Bookings associated with a suspended account may be cancelled.',
    ],
  },
  {
    heading: '16. Changes to These Terms',
    paragraphs: [
      'We may update these Terms from time to time. The date at the top of this page shows when they were last revised, and material changes will be brought to your attention in the app. Continuing to use Proxi after an update means you accept the revised Terms.',
    ],
  },
  {
    heading: '17. Contact Us',
    paragraphs: [
      `If you have questions about these Terms, about a booking, or about a payment, contact us at ${SUPPORT_EMAIL}.`,
    ],
  },
];

export const TERMS_REVIEW_NOTES = [
  'Full review by a qualified lawyer in each launch market before release.',
  'Name the operating legal entity and its registered address (section 1 and 17).',
  'Confirm a user-facing support address; SUPPORT_EMAIL currently points at the vendor.',
  'Set the minimum age of use — section 3 defers to local contractual capacity (spec Q8).',
  'Fix the service fee, currency, and refund policy; section 8 and 9 currently defer to what the app displays at booking (spec Q3, Q5).',
  'Add a governing-law and dispute-resolution clause once the launch market is settled (spec Q4).',
  'Confirm consumer-protection carve-outs for the launch market — statutory cancellation rights may override section 9.',
  'Align section 10 with the final Privacy Policy, and with the store data-safety declarations.',
  'Decide whether providers need separate provider-specific terms rather than section 4.',
];
