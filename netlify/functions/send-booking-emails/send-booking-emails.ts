import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

interface Course {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  time: string;
  duration: string;
  instructor: string;
  price: number;
}

interface BookingFormData {
  tickets: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequirements: string;
}

interface EmailData {
  course: Course;
  booking: BookingFormData;
  confirmationNumber: string;
}

interface SmtpError {
  code: string;
  command?: string;
  responseCode?: number;
  response?: string;
}

// Helper function to parse SMTP errors
const parseSmtpError = (error: any): { type: string; message: string; details: SmtpError } => {
  const details: SmtpError = {
    code: error.code,
    command: error.command,
    responseCode: error.responseCode,
    response: error.response
  };

  switch (error.code) {
    case 'EENVELOPE':
      return {
        type: 'server',
        message: 'SMTP server rejected the sender or recipients',
        details
      };
    case 'ECONNECTION':
      return {
        type: 'connection',
        message: 'Connection error. Could not establish connection to SMTP server',
        details
      };
    case 'EAUTH':
      return {
        type: 'auth',
        message: 'Authentication failed. Please check SMTP credentials',
        details
      };
    case 'ETLS':
      return {
        type: 'tls',
        message: 'TLS negotiation failed. Please check TLS settings',
        details
      };
    case 'ECONNREFUSED':
      return {
        type: 'connection',
        message: 'Connection refused. Please check SMTP host and port',
        details
      };
    case 'ETIMEDOUT':
      return {
        type: 'connection',
        message: 'Connection timed out. Please check SMTP host and port',
        details
      };
    case 'ENOTFOUND':
      return {
        type: 'dns',
        message: 'Host not found. Please check SMTP hostname',
        details
      };
    default:
      return {
        type: 'unknown',
        message: error.message || 'Unknown SMTP error occurred',
        details
      };
  }
};

// Helper function to log email errors
const logEmailError = async (error: any, context: string) => {
  const parsedError = parseSmtpError(error);
  
  try {
    await supabase
      .from('email_logs')
      .insert({
        error_type: parsedError.type,
        error_message: parsedError.message,
        error_details: parsedError.details,
        context,
        created_at: new Date().toISOString()
      });
  } catch (logError) {
    console.error('Failed to log email error:', logError);
  }

  return parsedError;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(price);
};

// Create transporter with email config
const createTransporter = async () => {
  try {
    const { data: config, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .single();

    if (configError) throw configError;
    if (!config) throw new Error('Email configuration not found');

    return nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port),
      secure: config.smtp_secure || false,
      tls: {
        enabled: config.smtp_tls_enabled !== false,
        minVersion: config.smtp_tls_min_version || 'TLSv1.2',
        ciphers: config.smtp_tls_ciphers || 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
        rejectUnauthorized: config.smtp_tls_reject_unauthorized !== false
      },
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
};

const sendCustomerEmail = async ({ course, booking, confirmationNumber }: EmailData): Promise<void> => {
  const totalPrice = booking.tickets * course.price;
  
  try {
    const transporter = await createTransporter();
    const { data: config } = await supabase
      .from('email_config')
      .select('from_email, from_name')
      .single();

    await transporter.sendMail({
      from: `"${config?.from_name || 'EduTech'}" <${config?.from_email}>`,
      to: booking.email,
      subject: `Booking Confirmation - ${course.title}`,
      text: `
Dear ${booking.fullName},

Thank you for booking your spot in "${course.title}"!

Booking Details:
---------------
Confirmation Number: ${confirmationNumber}
Booking Date: ${new Date().toLocaleDateString()}

Course Information:
------------------
Course: ${course.title}
Date: ${formatDate(course.startDate)} - ${formatDate(course.endDate)}
Time: ${course.time}
Duration: ${course.duration}
Instructor: ${course.instructor}

Your Booking:
------------
Number of Tickets: ${booking.tickets}
Total Price: ${formatPrice(totalPrice)}

Next Steps:
-----------
1. You will receive an invoice separately
2. Please arrive 15 minutes before the start time
3. Bring your laptop and any required materials
4. The venue address and additional details will be sent one week before the course

If you have any questions, please don't hesitate to contact us.

Best regards,
The EduTech Team
    `
    });
  } catch (error) {
    const parsedError = await logEmailError(error, 'customer_confirmation');
    throw new Error(`Failed to send customer confirmation email: ${parsedError.message}`);
  }
};

const sendAdminEmail = async ({ course, booking, confirmationNumber }: EmailData): Promise<void> => {
  const totalPrice = booking.tickets * course.price;
  
  try {
    const transporter = await createTransporter();
    const { data: config } = await supabase
      .from('email_config')
      .select('from_email, from_name')
      .single();

    await transporter.sendMail({
      from: `"${config?.from_name || 'EduTech'}" <${config?.from_email}>`,
      to: 'admin@yourdomain.com', // Replace with your admin email
      subject: `New Course Booking - ${course.title}`,
      text: `
New Course Booking Notification

Booking Reference: ${confirmationNumber}
Timestamp: ${new Date().toLocaleString()}

Course Details:
--------------
Title: ${course.title}
Date: ${formatDate(course.startDate)} - ${formatDate(course.endDate)}
Time: ${course.time}
Instructor: ${course.instructor}

Customer Information:
-------------------
Name: ${booking.fullName}
Email: ${booking.email}
Phone: ${booking.phone}
Number of Tickets: ${booking.tickets}
Total Price: ${formatPrice(totalPrice)}
Special Requirements: ${booking.specialRequirements || 'None'}

System Information:
-----------------
Course ID: ${course.id}
Booking Platform: Web
    `
    });
  } catch (error) {
    const parsedError = await logEmailError(error, 'admin_notification');
    throw new Error(`Failed to send admin notification email: ${parsedError.message}`);
  }
};

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { course, booking, confirmationNumber } = JSON.parse(event.body || '');

    // Validate required data
    if (!course || !booking || !confirmationNumber) {
      throw new Error('Missing required data');
    }

    // Send both emails
    await Promise.all([
      sendCustomerEmail({ course, booking, confirmationNumber }),
      sendAdminEmail({ course, booking, confirmationNumber })
    ]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Emails sent successfully' })
    };
  } catch (error) {
    console.error('Error sending emails:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send emails';
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: errorMessage,
        success: false
      })
    };
  }
};