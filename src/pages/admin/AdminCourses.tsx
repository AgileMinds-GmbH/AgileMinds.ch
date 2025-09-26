import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/filters/FilterPanel';
import UnifiedCourseForm from '../../components/admin/courses/UnifiedCourseForm';
import AddCourseButton from '../../components/admin/courses/AddCourseButton';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { Pencil, Trash2, Plus, X, Check, AlertCircle, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, Filter, Info, UserPlus, Users, Copy } from 'lucide-react';
import { useGetCourseListQuery } from '../../redux/rtk/course';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseStatus = 'all' | 'draft' | 'published' | 'archived';
type Attendee = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  specialRequirements?: string;
};

export default function AdminCourses() {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus>('all');
  const [searchResults, setSearchResults] = useState<{
    courseId: string;
    matchType: 'course' | 'attendee';
    matchedAttendeeIds?: string[];
  }[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Course | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['all']);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [activeForm, setActiveForm] = useState<{
    type: 'create' | 'edit';
    course?: Course;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Record<string, Attendee[]>>({});
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  const [showDeleteAttendeeConfirm, setShowDeleteAttendeeConfirm] = useState<string | null>(null);
  const { data: courses = [], isLoading: courseLoader } = useGetCourseListQuery({ page: 1, limit: 10 });

  console.log(courses, "courses===>>>")

  // Search functionality
  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const searchLower = term.toLowerCase();
    const results: {
      courseId: string;
      matchType: 'course' | 'attendee';
      matchedAttendeeIds?: string[];
    }[] = [];

    // Search in courses
    courseList.forEach(course => {
      if (
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      ) {
        results.push({
          courseId: course.id,
          matchType: 'course'
        });
      }
    });

    // Search in attendees
    for (const [courseId, courseAttendees] of Object.entries(attendees)) {
      const matchedAttendees = courseAttendees.filter(attendee =>
        attendee.fullName.toLowerCase().includes(searchLower) ||
        attendee.email.toLowerCase().includes(searchLower) ||
        (attendee.specialRequirements || '').toLowerCase().includes(searchLower)
      );

      if (matchedAttendees.length > 0) {
        results.push({
          courseId,
          matchType: 'attendee',
          matchedAttendeeIds: matchedAttendees.map(a => a.id)
        });

        // Load attendees for this course if not already loaded
        if (!attendees[courseId]) {
          loadAttendees(courseId);
        }
      }
    }

    setSearchResults(results);
  };

  // Initialize editing attendee with empty values
  const initializeEditingAttendee = (attendee: Attendee) => {
    setEditingAttendee({
      ...attendee,
      fullName: attendee.fullName || '',
      email: attendee.email || '',
      specialRequirements: attendee.specialRequirements || '',
      paymentStatus: attendee.paymentStatus || 'pending'
    });
  };

  const loadAttendees = async (courseId: string) => {
    try {
      setLoadingAttendees(true);

      const { data, error } = await supabase
        .from('enrollments')
        .select('id, full_name, email, registration_date, payment_status, special_requirements')
        .eq('course_id', courseId)
        .order('registration_date', { ascending: false });

      if (error) throw error;

      // Transform the data to match the component's expected format
      setAttendees(prev => ({
        ...prev,
        [courseId]: data?.map(attendee => ({
          id: attendee.id,
          fullName: attendee.full_name,
          email: attendee.email,
          registrationDate: attendee.registration_date,
          paymentStatus: attendee.payment_status,
          specialRequirements: attendee.special_requirements
        })) || []
      }));
    } catch (err) {
      console.error('Error loading attendees:', err);
      showNotification('error', 'Failed to load attendees');
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleEditAttendee = async (attendee: Attendee) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('enrollments')
        .update({
          full_name: attendee.fullName,
          email: attendee.email,
          payment_status: attendee.paymentStatus,
          special_requirements: attendee.specialRequirements
        })
        .eq('id', attendee.id);

      if (error) throw error;

      // Update local state
      setAttendees(prev => ({
        ...prev,
        [expandedCourseId!]: prev[expandedCourseId!].map(a =>
          a.id === attendee.id ? attendee : a
        )
      }));

      setEditingAttendee(null);
      showNotification('success', 'Attendee updated successfully');
    } catch (err) {
      console.error('Error updating attendee:', err);
      showNotification('error', 'Failed to update attendee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendee = async (attendeeId: string, courseId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', attendeeId);

      if (error) throw error;

      // Update spots available in course
      const { error: updateError } = await supabase
        .from('courses')
        .update({
          spots_available: courseList.find(c => c.id === courseId)!.spots_available + 1
        })
        .eq('id', courseId);

      if (updateError) throw updateError;

      // Update local state
      setAttendees(prev => ({
        ...prev,
        [courseId]: prev[courseId].filter(a => a.id !== attendeeId)
      }));

      setCourseList(prev =>
        prev.map(course =>
          course.id === courseId
            ? { ...course, spots_available: course.spots_available + 1 }
            : course
        )
      );

      setShowDeleteAttendeeConfirm(null);
      showNotification('success', 'Attendee removed successfully');
    } catch (err) {
      console.error('Error deleting attendee:', err);
      showNotification('error', 'Failed to delete attendee');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (courseId: string) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }

    setExpandedCourseId(courseId);
    if (!attendees[courseId]) {
      await loadAttendees(courseId);
    }
  };
  // Initialize price range based on actual course prices
  useEffect(() => {
    if (courseList.length > 0) {
      const prices = courseList.map(course => course.price);
      const max = Math.max(...prices);
      setMaxPrice(max);
      setPriceRange([0, max]);
    }
  }, [courseList]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  // Calculate active filters count
  const activeFiltersCount = [
    searchTerm !== '',
    priceRange[0] !== 0 || (maxPrice > 0 && priceRange[1] !== maxPrice),
    selectedCategories.length > 0,
    dateRange[0] !== '' || dateRange[1] !== '',
    selectedLanguages.length > 0 && !selectedLanguages.includes('all')
  ].filter(Boolean).length;

  // Calculate course counts by status
  const statusCounts = React.useMemo(() => {
    return courseList.reduce((acc, course) => {
      acc[course.status] = (acc[course.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [courseList]);

  const totalCourses = courses.length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
    setDateRange(['', '']);
    setSelectedLanguages(['all']);
  };

  // Handle column sort
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort icon based on column and current sort state
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

  // Filter courses based on search and filter criteria
  const filteredCourseList = React.useMemo(() => {
    let filtered = courses.filter(course => {
      const searchMatch = !searchTerm || searchResults.some(result =>
        result.courseId === course.id
      );

      // Status filtering
      const statusMatch = selectedStatus === 'all' || course.status === selectedStatus;

      // Price range filtering
      const priceMatch = maxPrice === 0 || (course?.price >= priceRange[0] && course?.price <= priceRange[1]);

      // Category filtering
      const categoryMatch = selectedCategories.length === 0 ||
        (course.meta_keywords && course.meta_keywords.some(category =>
          selectedCategories.includes(category)
        ));

      // Date range filtering
      const courseDate = new Date(course.start_date);
      const startDate = dateRange[0] ? new Date(dateRange[0]) : new Date('1970-01-01');
      const endDate = dateRange[1] ? new Date(dateRange[1]) : new Date('2100-12-31');
      const dateMatch = courseDate >= startDate && courseDate <= endDate;

      // Language filtering
      const languageMatch = selectedLanguages.includes('all') ||
        selectedLanguages.includes(course?.language);

      return statusMatch && searchMatch && priceMatch && categoryMatch && dateMatch && languageMatch;
    });

    // Apply sorting if active
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key as keyof Course] < b[sortConfig.key as keyof Course]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof Course] > b[sortConfig.key as keyof Course]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [courseList, selectedStatus, searchResults, priceRange, selectedCategories, dateRange, selectedLanguages, sortConfig, courses]);

  const showNotification = (
    type: 'success' | 'error',
    message: string,
    details?: string,
    duration: number = 5000
  ) => {
    setNotification({ type, message, details });
    setTimeout(() => setNotification(null), duration);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your course catalog
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <AddCourseButton onClick={() => setActiveForm({ type: 'create' })} />
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Course Status</h2>
          </div>
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
                onClick={() => setSelectedStatus(value as CourseStatus)}
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
                    ? totalCourses
                    : statusCounts[value] || 0
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search courses by title, description or attendee details..."
            activeFiltersCount={activeFiltersCount}
            isFilterOpen={isFilterOpen}
            onFilterClick={() => setIsFilterOpen(!isFilterOpen)}
          />

          {/* Filter Panel */}
          <div className={`
            overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
            ${isFilterOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <FilterPanel
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedLanguages={selectedLanguages}
              setSelectedLanguages={setSelectedLanguages}
              onClearAll={clearAllFilters}
              maxPrice={0}
            />
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`
            mt-4 p-4 rounded-md
            ${notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'}
          `}>
            <div className="flex">
              <AlertCircle className={`h-5 w-5 mr-2 ${notification.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`} />
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                  {notification.message}
                </h3>
                {notification.details && (
                  <p className={`mt-1 text-sm ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {notification.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {activeForm && (
            <UnifiedCourseForm
              course={activeForm.type === 'edit' ? activeForm.course : undefined}
              onSuccess={() => {
                setActiveForm(null);
                showNotification('success',
                  activeForm.type === 'create'
                    ? 'Course created successfully'
                    : 'Course updated successfully'
                );
              }}
              onCancel={() => setActiveForm(null)}
            />
          )}
        </div>

        {!activeForm && (
          <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    style={{ minWidth: '400px' }}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Course
                      <span className="text-gray-400">
                        {getSortIcon('title')}
                      </span>
                    </div>
                  </th>
                  <th
                    style={{ minWidth: '200px' }}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('start_date')}
                  >
                    <div className="flex items-center gap-2">
                      Date & Time
                      <span className="text-gray-400">
                        {getSortIcon('start_date')}
                      </span>
                    </div>
                  </th>
                  <th
                    style={{ minWidth: '120px' }}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <span className="text-gray-400">
                        {getSortIcon('status')}
                      </span>
                    </div>
                  </th>
                  <th
                    style={{ minWidth: '150px' }}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('instructor_id')}
                  >
                    <div className="flex items-center gap-2">
                      Spots
                      <span className="text-gray-400">
                        {getSortIcon('spots_available')}
                      </span>
                    </div>
                  </th>
                  <th
                    style={{ minWidth: '120px' }}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-2">
                      Price
                      <span className="text-gray-400">
                        {getSortIcon('price')}
                      </span>
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3" style={{ minWidth: '100px' }}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourseList.map((course) => (
                  <React.Fragment key={course._id}>
                    <tr
                      onClick={() => handleRowClick(course._id)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {expandedCourseId === course._id ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80`}
                              alt={course.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop&q=80`;
                              }}
                            />
                          </div>
                          <div className="max-w-[250px]">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              <div className="mb-2">{course.description || 'No description available'}</div>
                              {course.meta_keywords && course.meta_keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {course.meta_keywords.map((category, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                      {category}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {(() => {
                              const startDate = new Date(course.start_date);
                              const endDate = new Date(course.end_date);
                              return `${startDate.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })} - ${endDate.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}`;
                            })()}
                          </div>
                          <div className="text-gray-500">
                            {(() => {
                              const formatTime = (time: string) => {
                                const [hours, minutes] = time.split(':');
                                return `${hours}:${minutes}`;
                              };
                              return `${formatTime(course.start_time)} - ${formatTime(course.end_time)}`;
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-800' :
                          course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            course.status === 'archived' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden w-24">
                            <div
                              className={`h-full rounded-full ${course.spots_available <= 3
                                ? 'bg-red-500'
                                : course.spots_available <= 7
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                }`}
                              style={{ width: `${((14 - course.spots_available) / 14) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${course.spots_available <= 3
                            ? 'text-red-700'
                            : course.spots_available <= 7
                              ? 'text-yellow-700'
                              : 'text-green-700'
                            }`}>
                            {course.spots_available}/14
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        CHF {course.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(course.id);
                          }}
                          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-indigo-50 group relative"
                          title="View Attendees"
                        >
                          <div className="relative">
                            <Users className="h-5 w-5" />
                            {attendees[course.id] && (
                              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                {attendees[course.id].length}
                              </span>
                            )}
                          </div>
                          <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            View Attendees
                          </span>
                        </button>
                        <button
                          onClick={() => setActiveForm({ type: 'edit', course })}
                          className="inline-flex p-2 text-[#2196F3] hover:text-[#1976D2] transition-colors duration-200 rounded-full hover:bg-blue-50 group relative"
                          aria-label="Edit Course"
                        >
                          <Pencil className="h-5 w-5" />
                          <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Edit Course
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            const courseCopy = {
                              ...course,
                              id: undefined,
                              title: `${course.title} (Copy)`,
                              slug: undefined,
                              spots_available: 14,
                              status: 'draft',
                              created_at: undefined,
                              updated_at: undefined,
                              version: undefined,
                              is_latest: undefined
                            };
                            setActiveForm({ type: 'create', course: courseCopy });
                          }}
                          className="inline-flex p-2 text-[#4CAF50] hover:text-[#388E3C] transition-colors duration-200 rounded-full hover:bg-green-50 group relative"
                          aria-label="Copy Course"
                        >
                          <Copy className="h-5 w-5" />
                          <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Copy Course
                          </span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(course.id)}
                          className="inline-flex p-2 text-[#DC3545] hover:text-[#C82333] transition-colors duration-200 rounded-full hover:bg-red-50 group relative"
                          aria-label="Delete Course"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Delete Course
                          </span>
                        </button>
                      </td>
                    </tr>
                    {expandedCourseId === course._id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="animate-fadeIn">
                            {loadingAttendees ? (
                              <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                              </div>
                            ) : attendees[course.id]?.length > 0 ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    Course Attendees
                                  </h3>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle add attendee
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <UserPlus className="h-4 w-4 mr-1.5" />
                                    Add Attendee
                                  </button>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Registration Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Special Requirements</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {attendees[course.id].map((attendee) => (
                                        <tr key={attendee.id} className="hover:bg-gray-50 group">
                                          <td className={`px-4 py-2 text-sm ${searchResults.some(r =>
                                            r.courseId === course.id &&
                                            r.matchType === 'attendee' &&
                                            r.matchedAttendeeIds?.includes(attendee.id)
                                          )
                                            ? 'bg-yellow-50 font-medium'
                                            : 'text-gray-900'
                                            }`}>
                                            {editingAttendee?.id === attendee.id ? (
                                              <input
                                                type="text"
                                                value={editingAttendee.fullName}
                                                onChange={(e) => setEditingAttendee({
                                                  ...editingAttendee,
                                                  fullName: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                                              />
                                            ) : (
                                              attendee.fullName
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-500">
                                            {editingAttendee?.id === attendee.id ? (
                                              <input
                                                type="email"
                                                value={editingAttendee.email}
                                                onChange={(e) => setEditingAttendee({
                                                  ...editingAttendee,
                                                  email: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                                              />
                                            ) : (
                                              attendee.email
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-500">
                                            {new Date(attendee.registrationDate).toLocaleDateString()}
                                          </td>
                                          <td className="px-4 py-2">
                                            {editingAttendee?.id === attendee.id ? (
                                              <select
                                                value={editingAttendee.paymentStatus}
                                                onChange={(e) => setEditingAttendee({
                                                  ...editingAttendee,
                                                  paymentStatus: e.target.value as 'paid' | 'pending' | 'failed'
                                                })}
                                                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                                              >
                                                <option value="paid">Paid</option>
                                                <option value="pending">Pending</option>
                                                <option value="failed">Failed</option>
                                              </select>
                                            ) : (
                                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${attendee.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : attendee.paymentStatus === 'pending'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                                }`}>
                                                {attendee.paymentStatus}
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-500">
                                            {editingAttendee?.id === attendee.id ? (
                                              <input
                                                type="text"
                                                value={editingAttendee.specialRequirements || ''}
                                                onChange={(e) => setEditingAttendee({
                                                  ...editingAttendee,
                                                  specialRequirements: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                                                placeholder="None"
                                              />
                                            ) : (
                                              attendee.specialRequirements || '-'
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                            {showDeleteAttendeeConfirm === attendee.id ? (
                                              <div className="flex items-center justify-end space-x-2">
                                                <span className="text-sm text-gray-500">Confirm delete?</span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAttendee(attendee.id, course.id);
                                                  }}
                                                  className="p-1 text-green-600 hover:text-green-800"
                                                >
                                                  <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDeleteAttendeeConfirm(null);
                                                  }}
                                                  className="p-1 text-gray-600 hover:text-gray-800"
                                                >
                                                  <X className="h-4 w-4" />
                                                </button>
                                              </div>
                                            ) : editingAttendee?.id === attendee.id ? (
                                              <div className="flex items-center justify-end space-x-2">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditAttendee(editingAttendee);
                                                  }}
                                                  className="p-1 text-green-600 hover:text-green-800"
                                                >
                                                  <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingAttendee(null);
                                                  }}
                                                  className="p-1 text-gray-600 hover:text-gray-800"
                                                >
                                                  <X className="h-4 w-4" />
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="invisible group-hover:visible flex items-center justify-end space-x-2">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    initializeEditingAttendee(attendee);
                                                  }}
                                                  className="p-1 text-indigo-600 hover:text-indigo-800"
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDeleteAttendeeConfirm(attendee.id);
                                                  }}
                                                  className="p-1 text-red-600 hover:text-red-800"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </button>
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by adding an attendee to this course.</p>
                                <div className="mt-6">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle add attendee
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Attendee
                                  </button>
                                </div>
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
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={courseLoader}
                  className={`
                      inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm
                      ${courseLoader
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'text-white bg-indigo-600 hover:bg-indigo-700'
                    }
                    `}
                >
                  {courseLoader ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}