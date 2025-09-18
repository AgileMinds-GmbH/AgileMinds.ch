import { Course } from '../types';

interface BookingFormData {
  tickets: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequirements: string;
}

const generateConfirmationNumber = (): string => {
  return `BK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

export const sendBookingEmails = async (course: Course, booking: BookingFormData): Promise<string> => {
  const confirmationNumber = generateConfirmationNumber();
  
  try {
    const response = await fetch('/.netlify/functions/send-booking-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course,
        booking,
        confirmationNumber
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send confirmation emails');
    }

    return confirmationNumber;
  } catch (error) {
    console.error('Error sending emails:', error);
    throw new Error('Failed to send confirmation emails');
  }
};