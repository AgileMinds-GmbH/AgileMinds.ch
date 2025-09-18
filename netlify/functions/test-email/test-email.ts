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

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get email config from Supabase
    const { data: config, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .single();

    if (configError) throw configError;
    if (!config) throw new Error('Email configuration not found');

    // Validate SMTP configuration
    if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
      throw new Error('Incomplete SMTP configuration');
    }

    // Parse request body
    const { to, subject, text, html } = JSON.parse(event.body || '');

    // Validate required fields
    if (!to || !subject || !text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
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

    // Send test email
    await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to,
      subject,
      text,
      html
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Test email sent successfully' })
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send test email';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};

export { handler };