import { Database } from './supabase';

export interface Attendee {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialRequirements?: string;
  registrationDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  confirmationNumber?: string;
}

export type DbEnrollment = Database['public']['Tables']['enrollments']['Row'];