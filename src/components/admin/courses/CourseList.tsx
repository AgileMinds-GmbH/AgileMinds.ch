import React from 'react';
import { Course } from '../../../types/supabase';
import { Calendar, Clock, DollarSign, Users, Globe } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onViewAttendees: (courseId: string) => void;
}

export default function CourseList({
  courses,
  onEdit,
  onDelete,
  onViewAttendees
}: CourseListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="relative h-48">
            <img
              src={course.thumbnail_url || 'https://via.placeholder.com/400x200'}
              alt={course.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute top-4 right-4">
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${course.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : course.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
                }
              `}>
                {course.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {course.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {course.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                {course.start_time} - {course.end_time}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-2" />
                CHF {course.price}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                {course.spots_available} spots available
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Globe className="h-4 w-4 mr-2" />
                {course.language === 'en' ? 'English' : 'German'}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => onViewAttendees(course.id)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View Attendees
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => onEdit(course)}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(course.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-600 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}