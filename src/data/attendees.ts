import { Attendee } from '../types';

export const attendees: Attendee[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    registrationDate: '2024-03-15',
    paymentStatus: 'paid',
    courseId: '1'
  },
  {
    id: '2',
    fullName: 'Emma Wilson',
    email: 'emma.w@example.com',
    registrationDate: '2024-03-16',
    paymentStatus: 'pending',
    specialRequirements: 'Vegetarian lunch required',
    courseId: '1'
  },
  {
    id: '3',
    fullName: 'Michael Chen',
    email: 'mchen@example.com',
    registrationDate: '2024-03-14',
    paymentStatus: 'paid',
    courseId: '2'
  },
  {
    id: '4',
    fullName: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    registrationDate: '2024-03-17',
    paymentStatus: 'failed',
    courseId: '2'
  }
];