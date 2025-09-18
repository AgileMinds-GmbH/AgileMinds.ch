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

    // Helper function to parse SMTP error details
    const parseSmtpError = (error: any) => {
      const details = {
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response
      };

      // Handle specific SMTP error codes
      switch (error.code) {
        case 'EENVELOPE':
          return {
            type: 'server',
            message: 'SMTP envelope error. Server rejected the sender or recipients.',
            details
          };
        case 'ECONNECTION':
          return {
            type: 'connection',
            message: 'Connection error. The connection was lost or could not be established.',
            details
          };
        case 'ESTREAM':
          return {
            type: 'stream',
            message: 'Stream error. Failed to read or write data.',
            details
          };
        case 'EPROTOCOL':
          return {
            type: 'protocol',
            message: 'Protocol error. Server responded with unexpected sequence.',
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

    try {
      // Test SMTP connection
      await transporter.verify();

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'SMTP configuration is valid and connection successful'
        })
      };
    } catch (smtpError: any) {
      // Handle specific SMTP errors
      let errorMessage = 'SMTP connection failed';
      let errorType = 'unknown';
      let errorDetails = {
        code: smtpError.code,
        command: smtpError.command,
        responseCode: smtpError.responseCode,
        response: smtpError.response,
        tlsError: smtpError.code === 'ETLS' ? smtpError.message : undefined
      };

      // Parse the SMTP error
      const parsedError = parseSmtpError(smtpError);
      errorType = parsedError.type;
      errorMessage = parsedError.message;
      errorDetails = parsedError.details;

      // Additional specific error handling
      if (smtpError.responseCode === 451 && smtpError.response?.includes('STARTTLS')) {
        errorMessage = 'STARTTLS is required. Please enable TLS in your configuration.';
        errorType = 'tls';
      } else if (smtpError.code === 'ECONNREFUSED') {
        errorMessage = 'Could not connect to SMTP server. Please check host and port settings.';
        errorType = 'connection';
      } else if (smtpError.code === 'ETIMEDOUT') {
        errorMessage = 'Connection timed out. Please check host and port settings.';
        errorType = 'connection';
      } else if (smtpError.code === 'ENOTFOUND') {
        errorMessage = 'Host not found. Please check the SMTP host name.';
        errorType = 'dns';
      } else if (smtpError.code === 'EDNS') {
        errorMessage = 'DNS lookup failed. Please check the SMTP host name.';
        errorType = 'dns';
      } else if (smtpError.code === 'EAUTH') {
        errorMessage = 'Authentication failed. Please check username and password.';
        errorType = 'auth';
      } else if (smtpError.code === 'ETLS') {
        errorMessage = 'TLS negotiation failed. Please check TLS settings.';
        errorType = 'tls';
      } else if (smtpError.code === 'ESOCKET') {
        errorMessage = 'Socket error occurred. Please check your connection settings.';
        errorType = 'connection';
      } else if (smtpError.responseCode >= 500 && smtpError.responseCode < 600) {
        errorMessage = 'SMTP server rejected connection. Please check server settings.';
        errorType = 'server';
      }

      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: errorMessage,
          type: errorType,
          details: errorDetails
        })
      };
    }
  } catch (error) {
    console.error('Error testing email config:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to test email configuration';
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        type: 'config'
      })
    };
  }
};

export { handler };