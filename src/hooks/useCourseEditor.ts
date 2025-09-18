import { useState } from 'react';
import { editCourse } from '../lib/courses';
import type { Database } from '../types/supabase';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];

interface UseCourseEditorResult {
  loading: boolean;
  error: string | null;
  success: string | null;
  updateCourse: (courseId: string, updates: CourseUpdate) => Promise<void>;
}

export function useCourseEditor(): UseCourseEditorResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateCourse = async (courseId: string, updates: CourseUpdate) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await editCourse(courseId, updates);

      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    updateCourse
  };
}