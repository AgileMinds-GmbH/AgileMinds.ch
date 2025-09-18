import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Us Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold text-white">EduTech</span>
            </div>
            <p className="mb-4">
              EduTech is a leading provider of professional tech education, 
              delivering high-impact training to individuals and organizations 
              across Switzerland.
            </p>
            <p className="mb-6">
              Our mission is to empower professionals with cutting-edge skills 
              for the digital future.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-400" />
                <span>123 Tech Street, 8000 Zürich</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-indigo-400" />
                <a href="tel:+41123456789" className="hover:text-white">
                  +41 12 345 67 89
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-400" />
                <a href="mailto:info@edutech.com" className="hover:text-white">
                  info@edutech.com
                </a>
              </div>
            </div>
          </div>

          {/* Privacy Policy Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Privacy Policy</h3>
            <div className="space-y-2">
              <p>
                We are committed to protecting your personal data and ensuring 
                transparency in our data processing practices.
              </p>
              <div className="space-y-2 mt-4">
                <p className="text-sm">
                  <strong className="text-white">Data Protection:</strong>
                  <br />
                  Your data is securely stored and processed in accordance with 
                  Swiss data protection laws.
                </p>
                <p className="text-sm">
                  <strong className="text-white">Cookie Policy:</strong>
                  <br />
                  We use essential cookies to ensure the basic functionality of 
                  our website and analytics cookies with your consent.
                </p>
                <p className="text-sm">
                  <strong className="text-white">GDPR Compliance:</strong>
                  <br />
                  We adhere to GDPR principles and respect your rights regarding 
                  your personal data.
                </p>
                <p className="text-sm">
                  <strong className="text-white">Contact:</strong>
                  <br />
                  For privacy inquiries: privacy@edutech.com
                </p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Terms & Conditions</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <strong className="text-white">General Terms:</strong>
                <br />
                By using our services, you agree to these terms and conditions.
              </p>
              <p className="text-sm">
                <strong className="text-white">Service Conditions:</strong>
                <br />
                - Course bookings are binding
                <br />
                - Cancellation policy applies
                <br />
                - Payment terms: 30 days
              </p>
              <p className="text-sm">
                <strong className="text-white">User Obligations:</strong>
                <br />
                - Respect intellectual property
                <br />
                - Maintain professional conduct
                <br />
                - Follow course guidelines
              </p>
              <p className="text-sm">
                <strong className="text-white">Liability:</strong>
                <br />
                Our liability is limited to cases of intent and gross negligence.
              </p>
            </div>
          </div>

          {/* Legal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal Information</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <strong className="text-white">Company Details:</strong>
                <br />
                EduTech Switzerland AG
                <br />
                CHE-123.456.789
                <br />
                Commercial Register Zürich
              </p>
              <p className="text-sm">
                <strong className="text-white">Regulatory:</strong>
                <br />
                Licensed educational provider
                <br />
                ISO 9001:2015 certified
              </p>
              <p className="text-sm">
                <strong className="text-white">VAT Number:</strong>
                <br />
                CHE-123.456.789 MWST
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © {currentYear} EduTech Switzerland AG. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms of Service</Link>
              <Link to="/imprint" className="hover:text-white">Imprint</Link>
              <Link to="/admin/login" className="hover:text-white">Admin Login</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}