import React from 'react';
import { Mail, Phone, Calendar, BookOpen, Trash2, X, Check } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  price: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: string;
}

interface Attendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  confirmationNumber?: string;
  specialRequirements?: string;
  courses?: Course[];
}

interface GlobalAttendeeListProps {
  attendees: Attendee[];
  onDeleteAttendee: (attendeeId: string) => void;
  onDeleteCourseEnrollment: (attendeeId: string, courseId: string) => void;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (value: string | null) => void;
  showDeleteCourseConfirm: { attendeeId: string; courseId: string; } | null;
  setShowDeleteCourseConfirm: (value: { attendeeId: string; courseId: string; } | null) => void;
  selectedStatus: 'all' | 'published' | 'draft' | 'archived' | 'deleted';
}

export default function GlobalAttendeeList({
  attendees,
  onDeleteAttendee,
  onDeleteCourseEnrollment,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showDeleteCourseConfirm,
  setShowDeleteCourseConfirm,
  selectedStatus
}: GlobalAttendeeListProps) {
  const [expandedAttendeeId, setExpandedAttendeeId] = React.useState<string | null>(null);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attendee
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registration Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Courses
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendees.map((attendee) => (
            <React.Fragment key={attendee.id}>
              <tr 
                onClick={() => setExpandedAttendeeId(
                  expandedAttendeeId === attendee.id ? null : attendee.id
                )}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {attendee.fullName}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {attendee.email}
                        </span>
                        {attendee.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {attendee.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(attendee.registrationDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    attendee.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : attendee.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {attendee.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4" />
                    {(selectedStatus === 'all' 
                      ? attendee.courses?.length 
                      : attendee.courses?.filter(c => c.status === selectedStatus).length) || 0
                    } {attendee.courses?.filter(c => selectedStatus === 'all' || c.status === selectedStatus).length === 1 ? 'course' : 'courses'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {showDeleteConfirm === attendee.id ? (
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm text-gray-500">Delete all enrollments?</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAttendee(attendee.id);
                        }}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(null);
                        }}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(attendee.id);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
              {expandedAttendeeId === attendee.id && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 bg-gray-50">
                    <div className="animate-fadeIn">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        Enrolled Courses
                      </h4>
                      <div className="space-y-4">
                        {attendee.courses
                          ?.filter(course => selectedStatus === 'all' || course.status === selectedStatus)
                          .map((course, courseIndex) => (
                          <div
                            key={`${attendee.id}-${course.id}-${courseIndex}`}
                            className="bg-white p-4 rounded-lg shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">
                                  {course.title}
                                </h5>
                                <div className="mt-1 text-sm text-gray-500">
                                  {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  CHF {course.price}
                                </div>
                                <div className="mt-1">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                    course.status === 'archived' ? 'bg-purple-100 text-purple-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {course.status}
                                  </span>
                                </div>
                                <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  course.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : course.paymentStatus === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {course.paymentStatus}
                                </span>
                                <div className="mt-2">
                                  {showDeleteCourseConfirm?.attendeeId === attendee.id &&
                                   showDeleteCourseConfirm?.courseId === course.id ? (
                                    <div key={`confirm-${attendee.id}-${course.id}`} className="flex items-center justify-end space-x-2">
                                      <span className="text-sm text-gray-500">Delete enrollment?</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteCourseEnrollment(attendee.id, course.id);
                                        }}
                                        className="p-1 text-green-600 hover:text-green-800"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowDeleteCourseConfirm(null);
                                        }}
                                        className="p-1 text-gray-600 hover:text-gray-800"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteCourseConfirm({
                                          attendeeId: attendee.id,
                                          courseId: course.id
                                        });
                                      }}
                                      className="p-1 text-red-600 hover:text-red-800"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {attendee.specialRequirements && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">
                            Special Requirements
                          </h4>
                          <p className="text-sm text-yellow-700">
                            {attendee.specialRequirements}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}