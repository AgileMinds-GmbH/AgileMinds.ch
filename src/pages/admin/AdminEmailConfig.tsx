import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, Save, RefreshCw, Clock, XCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SmtpConfig {
  host: string;
  port: string;
  secure: boolean;
  tls_enabled: boolean;
  tls_min_version: string;
  tls_ciphers: string;
  tls_reject_unauthorized: boolean;
  user: string;
  password: string;
  from_email: string;
  from_name: string;
}

interface EmailLog {
  id: string;
  error_type: string;
  error_message: string;
  error_details: any;
  context: string;
  created_at: string;
}

export default function AdminEmailConfig() {
  const [config, setConfig] = useState<SmtpConfig>({
    host: '',
    port: '587',
    secure: false,
    tls_enabled: true,
    tls_min_version: 'TLSv1.2',
    tls_ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
    tls_reject_unauthorized: true,
    user: '',
    password: '',
    from_email: '',
    from_name: ''
  });
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [configTestLoading, setConfigTestLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    loadConfig();
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error loading email logs:', err);
      showNotification('error', 'Failed to load email logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      setNotification(null);

      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .single();

      if (error) {
        // Handle "no rows returned" error gracefully
        if (error.code === 'PGRST116') {
          // Set default values for new installation
          setConfig({
            host: '',
            port: '587',
            secure: false,
            tls_enabled: true,
            tls_min_version: 'TLSv1.2',
            tls_ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
            tls_reject_unauthorized: true,
            user: '',
            password: '',
            from_email: '',
            from_name: 'EduTech'
          });
          return;
        }
        throw error;
      }

      if (data) {
        setConfig({
          host: data.smtp_host || '',
          port: data.smtp_port || '587',
          secure: data.smtp_secure || false,
          tls_enabled: data.smtp_tls_enabled || true,
          tls_min_version: data.smtp_tls_min_version || 'TLSv1.2',
          tls_ciphers: data.smtp_tls_ciphers || 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
          tls_reject_unauthorized: data.smtp_tls_reject_unauthorized !== false,
          user: data.smtp_user || '',
          password: data.smtp_password || '',
          from_email: data.from_email || '',
          from_name: data.from_name || ''
        });
      } else {
        // Set default values if no data exists
        setConfig({
          host: '',
          port: '587',
          secure: false,
          tls_enabled: true,
          tls_min_version: 'TLSv1.2',
          tls_ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
          tls_reject_unauthorized: true,
          user: '',
          password: '',
          from_email: '',
          from_name: ''
        });
      }
    } catch (err: any) {
      console.error('Error loading email config:', err);
      showNotification('error', err.message || 'Failed to load email configuration');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!config.host.trim()) {
        throw new Error('SMTP Host is required');
      }
      if (!config.port.trim()) {
        throw new Error('SMTP Port is required');
      }
      if (!config.user.trim()) {
        throw new Error('SMTP Username is required');
      }
      if (!config.password.trim()) {
        throw new Error('SMTP Password is required');
      }
      if (!config.from_email.trim()) {
        throw new Error('From Email is required');
      }
      if (!config.from_name.trim()) {
        throw new Error('From Name is required');
      }

      // Validate port number
      const port = parseInt(config.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('Invalid SMTP port number');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(config.from_email)) {
        throw new Error('Invalid From Email format');
      }

      const { error } = await supabase
        .from('email_config')
        .upsert({
          id: 1, // Single row
          smtp_host: config.host,
          smtp_port: config.port,
          smtp_secure: config.secure,
          smtp_tls_enabled: config.tls_enabled,
          smtp_tls_min_version: config.tls_min_version,
          smtp_tls_ciphers: config.tls_ciphers,
          smtp_tls_reject_unauthorized: config.tls_reject_unauthorized,
          smtp_user: config.user,
          smtp_password: config.password,
          from_email: config.from_email,
          from_name: config.from_name,
          updated_at: new Date().toISOString()
        });

      if (error) {
        // Log detailed error information
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        // Log error to email_logs table
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            error_type: 'config',
            error_message: error.message,
            error_details: {
              code: error.code,
              details: error.details,
              hint: error.hint
            },
            context: 'config_update',
            created_at: new Date().toISOString()
          });

        if (logError) {
          console.error('Failed to log email error:', logError);
        }

        // Handle specific error cases
        switch (error.code) {
          case '23505': // Unique violation
            throw new Error('Configuration already exists');
          case '23514': // Check violation
            throw new Error('Invalid configuration data');
          case '42501': // Permission denied
            throw new Error('Permission denied. Please check your access rights');
          default:
            throw new Error(`Database error: ${error.message}`);
        }
      }

      showNotification('success', 'Email configuration saved successfully');

      // Refresh logs after successful save
      loadLogs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save email configuration';
      console.error('Error saving email config:', err);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfig = async () => {
    setConfigTestLoading(true);
    try {
      // Validate required fields before testing
      if (!config.host || !config.port || !config.user || !config.password) {
        throw new Error('Please fill in all required SMTP settings');
      }

      const { data: configTest, error: configError } = await supabase.functions.invoke('test-email-config');
      
      if (configError) {
        console.error('Function invocation error:', configError);
        throw new Error('Failed to test email configuration. Please try again.');
      }
      
      if (!configTest.success) {
        let errorMessage = 'Email configuration test failed';
        
        // Provide specific error messages based on error type
        switch (configTest.type) {
          case 'connection':
            errorMessage = configTest.error || 'Could not connect to SMTP server. Please check host and port settings.';
            break;
          case 'dns':
            errorMessage = configTest.error || 'DNS lookup failed. Please check the SMTP host name.';
            break;
          case 'auth':
            errorMessage = configTest.error || 'Authentication failed. Please check username and password.';
            break;
          case 'server':
            errorMessage = configTest.error || 'SMTP server rejected connection. Please check server settings.';
            break;
          case 'config':
            errorMessage = 'Configuration error: ' + configTest.error;
            break;
          case 'unknown':
            errorMessage = configTest.error || 'An unknown error occurred while testing the configuration.';
            break;
          default:
            errorMessage = configTest.error || 'Failed to test email configuration';
        }
        
        // Log detailed error information for debugging
        if (configTest.details) {
          console.error('SMTP Error Details:', configTest.details);
        }

        throw new Error(errorMessage);
      }

      showNotification('success', 'Email configuration is valid and connection successful');
    } catch (err) {
      console.error('Error testing email config:', err);
      showNotification(
        'error',
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while testing the configuration'
      );
    } finally {
      setConfigTestLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showNotification('error', 'Please enter a test email address');
      return;
    }

    setTestLoading(true);
    try {
      // First test the configuration
      const { data: configTest, error: configError } = await supabase.functions.invoke('test-email-config');
      
      if (configError) throw configError;
      
      if (!configTest.success) {
        let errorMessage = 'Email configuration test failed';
        
        // Provide specific error messages based on error type
        switch (configTest.type) {
          case 'connection':
            errorMessage = 'Could not connect to SMTP server. Please check host and port settings.';
            break;
          case 'dns':
            errorMessage = 'DNS lookup failed. Please check the SMTP host name.';
            break;
          case 'auth':
            errorMessage = 'Authentication failed. Please check username and password.';
            break;
          case 'server':
            errorMessage = 'SMTP server rejected connection. Please check server settings.';
            break;
          case 'config':
            errorMessage = 'Configuration error: ' + configTest.error;
            break;
        }
        
        throw new Error(errorMessage);
      }

      // If configuration test passes, send test email
      const { error } = await supabase.functions.invoke('test-email', {
        body: {
          to: testEmail,
          subject: 'Test Email',
          text: 'This is a test email from your EduTech platform.',
          html: `
            <h1>Test Email</h1>
            <p>This is a test email from your EduTech platform.</p>
            <p>If you received this email, your email configuration is working correctly.</p>
          `
        }
      });

      if (error) throw error;
      showNotification('success', 'Test email sent successfully');
    } catch (err) {
      console.error('Error sending test email:', err);
      showNotification('error', err instanceof Error ? err.message : 'Failed to send test email');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Configuration</h1>
            <p className="mt-2 text-sm text-gray-700">
              Configure SMTP settings for sending emails
            </p>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex">
              <AlertCircle className={`h-5 w-5 ${
                notification.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`} />
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* SMTP Host */}
              <div>
                <label htmlFor="host" className="block text-sm font-medium text-gray-700">
                  SMTP Host
                </label>
                <input
                  type="text"
                  id="host"
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* SMTP Port */}
              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                  SMTP Port
                </label>
                <input
                  type="text"
                  id="port"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* SMTP User */}
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                  SMTP Username
                </label>
                <input
                  type="text"
                  id="user"
                  value={config.user}
                  onChange={(e) => setConfig({ ...config, user: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* SMTP Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  SMTP Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* From Email */}
              <div>
                <label htmlFor="from_email" className="block text-sm font-medium text-gray-700">
                  From Email
                </label>
                <input
                  type="email"
                  id="from_email"
                  value={config.from_email}
                  onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* From Name */}
              <div>
                <label htmlFor="from_name" className="block text-sm font-medium text-gray-700">
                  From Name
                </label>
                <input
                  type="text"
                  id="from_name"
                  value={config.from_name}
                  onChange={(e) => setConfig({ ...config, from_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* SSL/TLS Settings */}
            <div className="col-span-2 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Security Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.secure}
                      onChange={(e) => {
                        const secure = e.target.checked;
                        setConfig(prev => ({
                          ...prev,
                          secure,
                          port: secure ? '465' : '587'
                        }));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Use SSL (Port 465)
                      <span className="ml-1 text-xs text-gray-500">
                        Recommended for secure connections
                      </span>
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.tls_enabled}
                      onChange={(e) => setConfig({ ...config, tls_enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Enable STARTTLS
                      <span className="ml-1 text-xs text-gray-500">
                        Required by many SMTP servers
                      </span>
                    </span>
                  </label>
                </div>

                <div>
                  <label htmlFor="tls_min_version" className="block text-sm font-medium text-gray-700">
                    Minimum TLS Version
                  </label>
                  <select
                    id="tls_min_version"
                    value={config.tls_min_version}
                    onChange={(e) => setConfig({ ...config, tls_min_version: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="TLSv1.2">TLS 1.2 (Recommended)</option>
                    <option value="TLSv1.1">TLS 1.1 (Legacy)</option>
                    <option value="TLSv1">TLS 1.0 (Not Recommended)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tls_ciphers" className="block text-sm font-medium text-gray-700">
                    TLS Ciphers
                  </label>
                  <select
                    id="tls_ciphers"
                    value={config.tls_ciphers}
                    onChange={(e) => setConfig({ ...config, tls_ciphers: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4">
                      High Security (Recommended)
                    </option>
                    <option value="HIGH:MEDIUM:LOW:!aNULL:!eNULL:!NULL">
                      Medium Security
                    </option>
                    <option value="ALL">
                      All Ciphers (Not Recommended)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.tls_reject_unauthorized}
                      onChange={(e) => setConfig({ ...config, tls_reject_unauthorized: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Verify SSL/TLS Certificates
                      <span className="ml-1 text-xs text-gray-500">
                        Recommended for security
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleTestConfig}
                disabled={configTestLoading}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${configTestLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                `}
              >
                {configTestLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Test Configuration
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                `}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Configuration
              </button>
            </div>
          </form>

          {/* Test Email Section */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Test Email Configuration
            </h2>
            <div className="flex gap-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="flex-1 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                onClick={handleTestEmail}
                disabled={testLoading}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${testLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                `}
              >
                {testLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test Email
              </button>
            </div>
          </div>
        </div>

        {/* Email Logs */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Email Logs
            </h2>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {showLogs ? 'Hide Logs' : 'Show Logs'}
            </button>
          </div>

          {showLogs && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Context
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">
                          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No email logs found
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {log.context}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`
                              px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${log.error_type === 'connection'
                                ? 'bg-red-100 text-red-800'
                                : log.error_type === 'auth'
                                ? 'bg-yellow-100 text-yellow-800'
                                : log.error_type === 'server'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                              }
                            `}>
                              {log.error_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                              {log.error_message}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}