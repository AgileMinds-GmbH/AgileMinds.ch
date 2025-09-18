import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Course } from '../types';

interface BookingModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: BookingFormData) => void;
}

interface BookingFormData {
  tickets: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequirements: string;
}

export default function BookingModal({ course, isOpen, onClose, onSubmit }: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    tickets: 1,
    fullName: '',
    email: '',
    phone: '',
    specialRequirements: ''
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.tickets || formData.tickets < 1) {
      newErrors.tickets = 'Please select at least 1 ticket';
    }
    if (formData.tickets > course.spotsAvailable) {
      newErrors.tickets = `Only ${course.spotsAvailable} spots available`;
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone.trim() && !/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tickets' ? parseInt(value) || 0 : value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof BookingFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  const totalPrice = formData.tickets * course.price;

  // Calculate duration in days
  const calculateDuration = () => {
    const start = new Date(course.startDate);
    const end = new Date(course.endDate);
    // Add 1 to include both start and end date
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  // Format time to HH:mm
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="booking-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            aria-label="Close booking form"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900" id="booking-modal">
              Book Your Spot
            </h2>
          </div>

          {/* Course Details */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">{course.title}</p>
                <p className="text-gray-600">with {course.instructor}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  CHF {course.price} per person
                </p>
                <p className="text-gray-600">{course.spotsAvailable} spots left</p>
              </div>
              <div>
                <p className="text-gray-600">
                  {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  {formatTime(course.time.split(' - ')[0])} - {formatTime(course.time.split(' - ')[1])}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Duration: {calculateDuration()}</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Tickets */}
              <div>
                <label
                  htmlFor="tickets"
                  className="block text-sm font-medium text-gray-700"
                >
                  Number of Tickets *
                </label>
                <input
                  type="number"
                  id="tickets"
                  name="tickets"
                  min="1"
                  max={course.spotsAvailable}
                  value={formData.tickets}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md px-3 py-2 ${
                    errors.tickets
                      ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-500 shadow-sm'
                      : 'border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm'
                  }`}
                  required
                />
                {errors.tickets && (
                  <p className="mt-1 text-sm text-red-600">
                    <AlertCircle className="mr-1 -mt-1 inline h-4 w-4" />
                    {errors.tickets}
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md px-3 py-2 ${
                    errors.fullName
                      ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-500 shadow-sm'
                      : 'border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm'
                  }`}
                  required
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">
                    <AlertCircle className="mr-1 -mt-1 inline h-4 w-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md px-3 py-2 ${
                    errors.email
                      ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-500 shadow-sm'
                      : 'border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    <AlertCircle className="mr-1 -mt-1 inline h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  Phone Number
                  <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md px-3 py-2 ${
                    errors.phone
                      ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-500 shadow-sm'
                      : 'border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm'
                  }`}
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    <AlertCircle className="mr-1 -mt-1 inline h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Special Requirements */}
              <div>
                <label
                  htmlFor="specialRequirements"
                  className="block text-sm font-medium text-gray-700"
                >
                  Special Requirements
                </label>
                <textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  placeholder="Any dietary requirements or special accommodations..."
                />
              </div>
            </div>

            {/* Total and Actions */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">Total</p>
                  <p className="text-sm text-gray-600">
                    {formData.tickets} {formData.tickets === 1 ? 'ticket' : 'tickets'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">
                    CHF {totalPrice}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isSubmitting ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}