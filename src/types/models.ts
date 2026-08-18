export type Gender = 'Male' | 'Female' | 'Other';

export interface Category {
  _id: string;
  name: string;
  image: string;
}

export interface ServiceProviderUser {
  _id: string;
  name: string;
  profile?: string;
  phone?: string;
  about_us?: string;
}

export interface ServiceListing {
  _id: string;
  service_name: string;
  service_description?: string;
  service_slot: string[];
  service_photo?: string[];
  address?: string;
  category: string;
  service_location: {
    type: 'Point';
    coordinates: [number, number];
  };
  user: ServiceProviderUser;
  queueCount?: number;
  estimatedWaitMinutes?: number;
  crowdLevel?: 'Low' | 'Moderate' | 'High';
}

export interface Appointment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  purpose_of_visit: string;
  date: string;
  time: string;
  full_date: string;
  status: 'Pending' | 'Completed';
  ticketNumber?: string;
  paymentMethod?: 'Orange Money' | 'PayPal' | 'Stripe' | 'Credit Card';
  paymentAmount?: number;
  transactionId?: string;
  paymentStatus?: 'Completed' | 'Pending';
  service?: string;
  service_ref?: string;
  service_provider?: ServiceProviderUser;
  user?: ServiceProviderUser;
  createdAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profile?: string;
  about_us?: string;
  company?: string;
  role: 'user' | 'provider';
  isAvailable?: boolean;
  document?: string[];
  status?: 'Pending' | 'Verified' | 'Suspended';
  address?: string;
  latitude?: number;
  longitude?: number;
  dob?: string;
  gender?: Gender;
}
