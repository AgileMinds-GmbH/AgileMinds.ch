import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/filters/FilterPanel';
import BookingModal from '../components/BookingModal';
import CourseDetailsModal from '../components/CourseDetailsModal';
import { sendBookingEmails } from '../services/emailService';
import { AlertCircle, Loader } from 'lucide-react';
import { useGetCourseListQuery } from '../redux/rtk/course';
import { BookingFormData, Course } from '../types/course';


export default function Courses() {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const PAGE_SIZE = 6;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 4000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['all']);
  const [showEarlyBirdOnly, setShowEarlyBirdOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [detailsCourse, setDetailsCourse] = useState<Course | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { data: courses, isLoading: courseLoader } = useGetCourseListQuery({ page: 1, limit: 10 });

  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [
    searchTerm,
    priceRange,
    selectedCategories,
    dateRange,
    selectedLanguages,
    showEarlyBirdOnly
  ]);

  // Debounce search term changes

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!selectedCourse) return;

    setIsLoading(true);
    try {
      // Generate confirmation number first
      const confirmationNumber = await sendBookingEmails(selectedCourse, formData);

      // Create an array of enrollment records based on number of tickets
      const enrollments = Array(formData.tickets).fill({
        course_id: selectedCourse.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        special_requirements: formData.specialRequirements,
        payment_status: 'pending',
        confirmation_number: confirmationNumber
      });

      // Insert multiple enrollments into database
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert(enrollments);

      if (enrollmentError) throw enrollmentError;

      setNotification({
        type: 'success',
        message: `Booking confirmed! Confirmation number: ${confirmationNumber}. Check your email for details.`
      });
      setSelectedCourse(null);
    } catch (error) {
      console.error('Booking error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to process booking. Please try again or contact support.'
      });
    } finally {
      setIsLoading(false);
    }

    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  // Load saved language preference
  React.useEffect(() => {
    const savedLanguages = localStorage.getItem('preferredLanguages');
    if (savedLanguages) {
      setSelectedLanguages(JSON.parse(savedLanguages));
    }
  }, []);

  // Save language preference
  React.useEffect(() => {
    localStorage.setItem('preferredLanguages', JSON.stringify(selectedLanguages));
  }, [selectedLanguages]);

  // Calculate active filters count
  const activeFiltersCount = [
    searchTerm !== '',
    priceRange[0] !== 0 || priceRange[1] !== 1000,
    selectedCategories.length > 0,
    dateRange[0] !== '' || dateRange[1] !== '',
    selectedLanguages.length > 0 && !selectedLanguages.includes('all'),
    showEarlyBirdOnly
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 11000]);
    setSelectedCategories([]);
    setDateRange(['', '']);
    setSelectedLanguages(['all']);
    setShowEarlyBirdOnly(false);
  };

  const filteredCourses = React.useMemo(() => {
    const allCourses = courses?.map(dbCourse => ({
      id: dbCourse.id,
      title: dbCourse.title,
      description: dbCourse.description,
      thumbnail: dbCourse.thumbnail_url,
      logo: dbCourse.logo_url,
      learning_objectives: dbCourse.learning_objectives || [],
      prerequisites: dbCourse.prerequisites || [],
      early_bird_price: dbCourse.early_bird_price ? Number(dbCourse.early_bird_price) : undefined,
      early_bird_deadline: dbCourse.early_bird_deadline ? dbCourse.early_bird_deadline : undefined,
      materials: dbCourse.materials || [],
      duration: dbCourse.duration,
      time: `${dbCourse.start_time} - ${dbCourse.end_time}`,
      startDate: dbCourse.start_date,
      endDate: dbCourse.end_date,
      price: Number(dbCourse.price),
      instructor: dbCourse.instructor_id || 'TBA',
      spotsAvailable: dbCourse.spots_available,
      categories: dbCourse.meta_keywords || [],
      language: dbCourse.language as 'en' | 'de',
      skillLevel: dbCourse.skill_level as 'beginner' | 'intermediate' | 'advanced',
      status: dbCourse?.status as 'published' | 'unpublished' | 'expired' | 'deleted'
    }));

    const filtered = allCourses?.filter(course => {
      const searchMatch = !searchTerm ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categories.some(cat => cat?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        course.title.toLowerCase().includes('ai for product owner');

      const priceMatch = course.price >= priceRange[0] && course.price <= priceRange[1];

      const categoryMatch = selectedCategories.length === 0 ||
        course.categories.some(cat => selectedCategories.includes(cat));

      const courseDate = new Date(course.startDate);
      const startDate = dateRange[0] ? new Date(dateRange[0]) : new Date('1970-01-01');
      const endDate = dateRange[1] ? new Date(dateRange[1]) : new Date('2100-12-31');
      const dateMatch = courseDate >= startDate && courseDate <= endDate;

      const languageMatch = selectedLanguages.includes('all') ||
        selectedLanguages.includes(course.language);

      // Early bird filter - check if course has an active early bird price
      const earlyBirdMatch = !showEarlyBirdOnly || (
        course.early_bird_price &&
        course.early_bird_deadline &&
        course.early_bird_price < course.price &&
        new Date() < new Date(course.early_bird_deadline)
      );

      // Show all courses regardless of status
      return searchMatch && priceMatch && categoryMatch && dateMatch && languageMatch && earlyBirdMatch;
    });

    const sortedCourses = filtered?.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    });
    // Return all filtered courses
    return sortedCourses;
  }, [searchTerm, priceRange, selectedCategories, dateRange, selectedLanguages, showEarlyBirdOnly, courses]);

  // Handle loading more courses
  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {/* Search and Filter Header */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search courses by title, description, or category..."
            activeFiltersCount={activeFiltersCount}
            isOpen={isFilterOpen}
            onFilterClick={() => setIsFilterOpen(!isFilterOpen)}
          />

          {/* Filter Panel Container */}
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
              showEarlyBirdOnly={showEarlyBirdOnly}
              setShowEarlyBirdOnly={setShowEarlyBirdOnly}
              onClearAll={clearAllFilters} maxPrice={0} />
          </div>

          {/* Course Grid */}
          <div className="transition-[margin] duration-300 ease-in-out">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Loaded Classes <span className="text-gray-500 font-normal">({filteredCourses?.length} {filteredCourses?.length === 1 ? 'course' : 'courses'})</span>
                {courseLoader && <Loader className="inline-block ml-2 h-5 w-5 animate-spin text-indigo-600" />}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses?.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="relative h-48">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover object-left-top transform transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                        <img
                          src={course.logo}
                          alt=""
                          className="w-18 h-18 object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        <button
                          onClick={() => setDetailsCourse(course)}
                          className="group relative flex items-center gap-1 text-left hover:text-indigo-600 transition-colors duration-200"
                          aria-label={`View details for ${course.title}`}
                        >
                          <span className="relative">
                            {course.title}
                            <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-indigo-600 transition-all duration-200 group-hover:w-full" />
                          </span>
                        </button>
                      </h2>
                      <span className={`
                      px-2 py-1 rounded-md text-sm font-medium
                      ${course.language === 'en'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }
                    `}>
                        {course.language === 'en' ? 'English' : 'German'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.categories.map(category => (
                        <span
                          key={category}
                          className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                        >
                          {category}
                        </span>
                      ))}
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {course.skillLevel}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <div className="font-medium">
                            {(() => {
                              const start = new Date(course.startDate);
                              const end = new Date(course.endDate);
                              const startDay = start.getDate();
                              const endDay = end.getDate();
                              const month = start.toLocaleString('default', { month: 'long' });
                              const year = start.getFullYear();
                              return `${startDay}.-${endDay}. ${month} ${year}`;
                            })()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Time:</span>
                          <div className="font-medium">
                            {(() => {
                              const [startTime, endTime] = course.time.split(' - ');
                              const formatTime = (time: string) => {
                                const [hours, minutes] = time.split(':');
                                return `${hours}:${minutes}`;
                              };
                              return `${formatTime(startTime)} - ${formatTime(endTime)}`;
                            })()}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Availability:</span>
                          <div className="mt-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full"
                                  style={{ width: `${(course.spotsAvailable / 14) * 100}%` }}
                                />
                              </div>
                              <span className={`whitespace-nowrap font-medium ${course.spotsAvailable <= 5 ? 'text-red-600' : 'text-indigo-700'
                                }`}>
                                {course.spotsAvailable}/14 spots left
                              </span>
                              {course.spotsAvailable < 10 && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-sm">
                                  ✓ Guaranteed Execution
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        {course.early_bird_price && new Date() < new Date(course.early_bird_deadline) ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-emerald-600">
                                CHF {course.early_bird_price}
                              </span>
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                                Early Bird
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-gray-500 line-through">
                                CHF {course.price}
                              </span>
                              <span className="text-emerald-600 font-medium">
                                Save {Math.round((1 - course.early_bird_price / course.price) * 100)}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Until {new Date(course.early_bird_deadline).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-indigo-600">
                            CHF {course.price}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
                //</div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-8 text-center p-4 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 inline-block mr-2" />
                {error}
              </div>
            )}

            {/* Load More Section */}
            {initialLoadComplete && filteredCourses?.length >= PAGE_SIZE * (page + 1) && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className={`
                    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg min-w-[200px]
                    ${isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }
                    transition-colors duration-200
                  `}
                >
                  {isLoading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    'Load More Courses'
                  )}
                </button>
              </div>
            )}

            {/* No More Courses Message */}
            {initialLoadComplete && filteredCourses?.length < PAGE_SIZE * (page + 1) && !isLoading && filteredCourses.length > 0 && (
              <div className="mt-8 text-center text-gray-600">
                No more courses to load
              </div>
            )}

            {/* Empty State */}
            {initialLoadComplete && filteredCourses?.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg ${notification.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{notification.message}</p>
          </div>
        </div>
      )}
      {selectedCourse && (
        <BookingModal
          course={selectedCourse}
          isOpen={true}
          onClose={() => setSelectedCourse(null)}
          onSubmit={handleBookingSubmit}
        />
      )}
      {detailsCourse && (
        <CourseDetailsModal
          course={detailsCourse}
          isOpen={true}
          onClose={() => setDetailsCourse(null)}
        />
      )}
    </div>
  );
}
