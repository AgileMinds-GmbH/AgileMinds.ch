import React, { useEffect, useRef } from 'react';
import { X, Clock, User, Calendar, BookOpen, Target, FileText, Award } from 'lucide-react';
import { Course } from '../types';

interface CourseDetailsModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseDetailsModal({ course, isOpen, onClose }: CourseDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const learningObjectives = course.learning_objectives || [
    'Course learning objectives will be added soon'
  ];

  const prerequisites = course.prerequisites || [
    'Course prerequisites will be added soon'
  ];

  const materials = course.materials || [
    'Course materials will be added soon'
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
      aria-labelledby="course-details-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl"
          style={{ opacity: 0, animation: 'fadeIn 0.3s ease-out forwards' }}
        >
          {/* Header with Image */}
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover object-left-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Close details"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-6 text-white">
              <h2 className="text-3xl font-bold">{course.title}</h2>
              <p className="mt-2 flex items-center gap-2">
                <User className="h-5 w-5" />
                {course.instructor}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Course Overview
                  </h3>
                  <p className="mt-2 text-gray-600">{course.description}</p>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Target className="h-5 w-5 text-indigo-600" />
                    Learning Objectives
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Award className="h-5 w-5 text-indigo-600" />
                    Prerequisites
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                        {prerequisite}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Course Materials
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {materials.map((material, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6 lg:border-l lg:border-gray-200 lg:pl-6">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Schedule
                  </h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <div className="font-medium">
                          {new Date(course.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <div className="font-medium">
                          {new Date(course.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p>
                      <span className="text-gray-600">Time:</span>
                      <br />
                      <span className="font-medium">
                        {(() => {
                          const [startTime, endTime] = course.time.split(' - ');
                          const formatTime = (time: string) => {
                            const [hours, minutes] = time.split(':');
                            return `${hours}:${minutes}`;
                          };
                          return `${formatTime(startTime)} - ${formatTime(endTime)}`;
                        })()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    Duration & Format
                  </h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Duration:</span>
                      <br />
                      <span className="font-medium">
                        {(() => {
                          const start = new Date(course.startDate);
                          const end = new Date(course.endDate);
                          const diffTime = Math.abs(end.getTime() - start.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                          return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
                        })()}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Language:</span>
                      <br />
                      <span className="font-medium">
                        {course.language === 'en' ? 'English' : 'German'}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Level:</span>
                      <br />
                      <span className="font-medium capitalize">{course.skillLevel}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-indigo-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                      CHF {course.price}
                    </span>
                    <span className="text-sm text-indigo-600">
                      {course.spotsAvailable} spots left
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}