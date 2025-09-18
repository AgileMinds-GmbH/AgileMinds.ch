import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Course } from '../types';

interface FeaturedCoursesCarouselProps {
  courses: Course[];
}

function FeaturedCoursesCarousel({ courses }: FeaturedCoursesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter available courses and sort by start date
  const availableCourses = React.useMemo(() => {
    return courses
      .filter(course => course.spotsAvailable > 0 && course.status === 'published')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [courses]);

  const totalSlides = Math.max(0, availableCourses.length - 2);
  
  const nextSlide = useCallback(() => {
    setCurrentIndex(current => (current + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = () => {
    setCurrentIndex(current => (current - 1 + totalSlides) % totalSlides);
  };

  // Auto-rotation effect
  useEffect(() => {
    if (isPlaying && !isHovered && totalSlides > 1) {
      const interval = setInterval(nextSlide, 7000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isHovered, nextSlide, totalSlides]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === carouselRef.current) {
        if (e.key === 'ArrowLeft') {
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
        } else if (e.key === 'Space') {
          setIsPlaying(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide]);

  if (availableCourses.length < 3) {
    return (
      <div className="text-center text-gray-600 py-8">
        Not enough courses available at the moment.
      </div>
    );
  }

  const visibleCourses = availableCourses.slice(currentIndex, currentIndex + 3);

  return (
    <div
      ref={carouselRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="region"
      aria-label="Featured courses carousel"
    >
      {/* Carousel Content */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {visibleCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                style={{ minWidth: 'calc(33.333% - 1.5rem)' }}
              >
                <div className="relative h-48">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover object-left-top"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      {course.spotsAvailable} spots left
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {course.description.length > 50
                      ? `${course.description.substring(0, 50)}...`
                      : course.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Starts {new Date(course.startDate).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-white/90 shadow-lg text-gray-800 hover:bg-white hover:text-indigo-600 transition-all duration-200 transform hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-white/90 shadow-lg text-gray-800 hover:bg-white hover:text-indigo-600 transition-all duration-200 transform hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 pb-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-full bg-white/90 shadow-lg text-gray-800 hover:text-indigo-600 transition-colors duration-200"
          aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
        <div className="flex gap-2">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                h-2 rounded-full transition-all duration-200
                ${currentIndex === index
                  ? 'w-8 bg-indigo-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentIndex === index ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


export default FeaturedCoursesCarousel