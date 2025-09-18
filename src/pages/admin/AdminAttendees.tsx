import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, AlertCircle, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, Mail, Phone, Calendar, BookOpen, Trash2, X, Check } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import GlobalAttendeeList from '../../components/admin/attendees/GlobalAttendeeList';

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

interface Course {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  price: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: string;
}

export default function AdminAttendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAttendeeId, setExpandedAttendeeId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Attendee | '';
    direction: 'asc' | 'desc';
  }>({ key: 'registrationDate', direction: 'desc' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft' | 'archived' | 'deleted'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteCourseConfirm, setShowDeleteCourseConfirm] = useState<{
    attendeeId: string;
    courseId: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateAttendee = async (updatedAttendee: Attendee) => {
    try {
      setLoading(true);
      
      // Update all enrollments for this attendee
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          full_name: updatedAttendee.fullName,
          email: updatedAttendee.email,
          phone: updatedAttendee.phone,
          payment_status: updatedAttendee.paymentStatus,
          special_requirements: updatedAttendee.specialRequirements
        })
        .eq('full_name', attendees.find(a => a.id === updatedAttendee.id)?.fullName)
        .eq('email', attendees.find(a => a.id === updatedAttendee.id)?.email);

      if (updateError) throw updateError;

      // Update local state
      setAttendees(prev => prev.map(attendee => 
        attendee.id === updatedAttendee.id ? updatedAttendee : attendee
      ));

      showNotification('success', 'Attendee updated successfully');
    } catch (err) {
      console.error('Error updating attendee:', err);
      showNotification('error', 'Failed to update attendee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourseEnrollment = async (attendeeId: string, courseId: string) => {
    try {
      setLoading(true);
      
      // Find the enrollment record
      const { data: enrollment, error: findError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('full_name', attendees.find(a => a.id === attendeeId)?.fullName)
        .eq('email', attendees.find(a => a.id === attendeeId)?.email)
        .single();

      if (findError) throw findError;
      if (!enrollment) throw new Error('Enrollment not found');

      // Get current spots_available
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('spots_available')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      if (!courseData) throw new Error('Course not found');

      // Delete the enrollment
      const { error: deleteError } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollment.id);

      if (deleteError) throw deleteError;

      // Update spots available in course
      const { error: updateError } = await supabase
        .from('courses')
        .update({ spots_available: supabase.rpc('increment', { spots: courseData.spots_available }) })
        .eq('id', courseId);

      if (updateError) throw updateError;

      // Update local state
      setAttendees(prev => prev.map(attendee => {
        if (attendee.id === attendeeId) {
          return {
            ...attendee,
            courses: attendee.courses?.filter(course => course.id !== courseId) || []
          };
        }
        return attendee;
      }));

      showNotification('success', 'Course enrollment deleted successfully');
    } catch (err) {
      console.error('Error deleting course enrollment:', err);
      showNotification('error', 'Failed to delete course enrollment');
    } finally {
      setLoading(false);
      setShowDeleteCourseConfirm(null);
    }
  };

  const handleDeleteAttendee = async (attendeeId: string) => {
    try {
      setLoading(true);
      
      const attendee = attendees.find(a => a.id === attendeeId);
      if (!attendee) throw new Error('Attendee not found');

      // Delete all enrollments for this attendee
      const { error: deleteError } = await supabase
        .from('enrollments')
        .delete()
        .eq('full_name', attendee.fullName)
        .eq('email', attendee.email);

      if (deleteError) throw deleteError;

      // Update spots available for all affected courses
      const courseIds = attendee.courses?.map(c => c.id) || [];
      if (courseIds.length > 0) {
        // Get current spots_available for each course
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, spots_available')
          .in('id', courseIds);

        if (coursesError) throw coursesError;
        if (!coursesData) throw new Error('Courses not found');

        // Update each course's spots_available
        const updatePromises = coursesData.map(course => supabase
          .from('courses')
          .update({ spots_available: course.spots_available + 1 })
          .eq('id', course.id)
        );

        await Promise.all(updatePromises);
      }

      // Update local state
      setAttendees(prev => prev.filter(a => a.id !== attendeeId));
      showNotification('success', 'Attendee deleted successfully');
    } catch (err) {
      console.error('Error deleting attendee:', err);
      showNotification('error', 'Failed to delete attendee');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  useEffect(() => {
    loadAttendees();
  }, []);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get all courses with their status
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, status');

      if (coursesError) throw coursesError;

      const courseStatusMap = new Map(
        coursesData?.map(course => [course.id, course.status]) || []
      );

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          full_name,
          email,
          phone,
          confirmation_number,
          registration_date,
          payment_status,
          special_requirements,
          courses (
            id,
            title,
            start_date,
            end_date,
            price
          )
        `)
        .order('registration_date', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      // Group enrollments by full name + email combination
      const attendeeMap = new Map<string, Attendee>();
      
      enrollments?.forEach(enrollment => {
        // Create unique key using full name and email
        const attendeeKey = `${enrollment.full_name}:::${enrollment.email}`;
        const course = enrollment.courses ? {
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          startDate: enrollment.courses.start_date,
          endDate: enrollment.courses.end_date,
          price: enrollment.courses.price,
          paymentStatus: enrollment.payment_status,
          status: courseStatusMap.get(enrollment.courses.id) || 'draft'
        } : null;

        if (attendeeMap.has(attendeeKey)) {
          // Update existing attendee
          const existingAttendee = attendeeMap.get(attendeeKey)!;
          if (course) {
            existingAttendee.courses = [...existingAttendee.courses || [], course];
          }
          // Update registration date if newer
          if (new Date(enrollment.registration_date) > new Date(existingAttendee.registrationDate)) {
            existingAttendee.registrationDate = enrollment.registration_date;
          }
          // Merge special requirements if different
          if (enrollment.special_requirements && 
              enrollment.special_requirements !== existingAttendee.specialRequirements) {
            existingAttendee.specialRequirements = [
              existingAttendee.specialRequirements,
              enrollment.special_requirements
            ].filter(Boolean).join('; ');
          }
          // Update payment status priority: failed > pending > paid
          if (enrollment.payment_status === 'failed' || 
              (enrollment.payment_status === 'pending' && existingAttendee.paymentStatus === 'paid')) {
            existingAttendee.paymentStatus = enrollment.payment_status as 'paid' | 'pending' | 'failed';
          }
        } else {
          // Create new attendee entry
          attendeeMap.set(attendeeKey, {
            id: enrollment.id, // Use first enrollment ID
            fullName: enrollment.full_name,
            email: enrollment.email,
            confirmationNumber: enrollment.confirmation_number,
            phone: enrollment.phone || '',
            registrationDate: enrollment.registration_date,
            paymentStatus: enrollment.payment_status as 'paid' | 'pending' | 'failed',
            specialRequirements: enrollment.special_requirements,
            courses: course ? [course] : []
          });
        }
      });

      // Convert map to array and sort by registration date
      const consolidatedAttendees = Array.from(attendeeMap.values())
        .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
      
      setAttendees(consolidatedAttendees);

    } catch (err) {
      console.error('Error loading attendees:', err);
      setError('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Attendee) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const filteredAttendees = React.useMemo(() => {
    let filtered = [...attendees];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(attendee => {
        // First apply status filter
        if (selectedStatus !== 'all') {
          const hasMatchingCourse = attendee.courses?.some(
            course => course.status === selectedStatus
          );
          if (!hasMatchingCourse) return false;
        }

        // Then apply search filter
        return (
        attendee.fullName.toLowerCase().includes(searchLower) ||
        attendee.email.toLowerCase().includes(searchLower) ||
        attendee.phone.includes(searchLower) ||
        (attendee.specialRequirements || '').toLowerCase().includes(searchLower) ||
        attendee.courses?.some(course => 
          course.title.toLowerCase().includes(searchLower)
        )
        );
      });
    } else if (selectedStatus !== 'all') {
      // Apply only status filter if no search term
      filtered = filtered.filter(attendee =>
        attendee.courses?.some(course => course.status === selectedStatus)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [attendees, searchTerm, sortConfig, selectedStatus]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage course attendees and their enrollments
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { value: 'all', label: 'All Courses', color: 'gray' },
              { value: 'published', label: 'Published', color: 'green' },
              { value: 'draft', label: 'Draft', color: 'yellow' },
              { value: 'archived', label: 'Archived', color: 'purple' },
              { value: 'deleted', label: 'Deleted', color: 'red' }
            ].map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setSelectedStatus(value as typeof selectedStatus)}
                className={`
                  flex items-center justify-between px-4 py-2 rounded-lg border
                  transition-colors duration-200
                  ${selectedStatus === value
                    ? `bg-${color}-50 border-${color}-200 text-${color}-700`
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="font-medium">{label}</span>
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${selectedStatus === value
                    ? `bg-${color}-100`
                    : 'bg-gray-100'
                  }
                `}>
                  {value === 'all'
                    ? attendees.length
                    : attendees.filter(a => 
                        a.courses?.some(c => c.status === value)
                      ).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search attendees by name, email, phone or course..."
            activeFiltersCount={0}
            isFilterOpen={isFilterOpen}
            onFilterClick={() => setIsFilterOpen(!isFilterOpen)}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Attendees Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendees...</p>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No attendees found</p>
          </div>
        ) : (
          <GlobalAttendeeList
            attendees={filteredAttendees}
            onDeleteAttendee={handleDeleteAttendee}
            onDeleteCourseEnrollment={handleDeleteCourseEnrollment}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            showDeleteCourseConfirm={showDeleteCourseConfirm}
            setShowDeleteCourseConfirm={setShowDeleteCourseConfirm}
            selectedStatus={selectedStatus}
            onUpdateAttendee={handleUpdateAttendee}
          />
        )}
      </div>
    </div>
  );
}