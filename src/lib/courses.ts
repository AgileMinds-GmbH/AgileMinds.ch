import { supabase } from './supabase';
import type { Database } from '../types/supabase';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];

interface EditCourseResult {
  success: boolean;
  message: string;
  course?: Course;
}

export async function editCourse(courseId: string, updates: CourseUpdate): Promise<EditCourseResult> {
  try {
    // Validate course ID
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Get current course data
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch course: ${fetchError.message}`);
    }

    if (!existingCourse) {
      throw new Error('Course not found');
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'start_date', 'end_date', 'price'];
    for (const field of requiredFields) {
      if (updates[field as keyof CourseUpdate] === '') {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }
    }

    // Validate dates
    if (updates.start_date && updates.end_date) {
      const startDate = new Date(updates.start_date);
      const endDate = new Date(updates.end_date);
      
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }
    }

    // Validate enrollment capacity
    if (updates.spots_available !== undefined) {
      const currentEnrollment = await getCurrentEnrollment(courseId);
      if (updates.spots_available < currentEnrollment) {
        throw new Error(`Cannot reduce capacity below current enrollment (${currentEnrollment} students)`);
      }
    }

    // Generate slug if title is being updated
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
    }

    // Add audit fields
    const auditFields = {
      updated_at: new Date().toISOString(),
      version: (existingCourse.version || 0) + 1
    };

    // Update the course
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update({ ...updates, ...auditFields })
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update course: ${updateError.message}`);
    }

    // Log the change
    await logCourseChange(courseId, existingCourse, updates);

    return {
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    };

  } catch (error) {
    console.error('Error updating course:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update course'
    };
  }
}

async function getCurrentEnrollment(courseId: string): Promise<number> {
  const { count, error } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (error) {
    throw new Error(`Failed to get current enrollment: ${error.message}`);
  }

  return count || 0;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function logCourseChange(
  courseId: string,
  oldData: Course,
  newData: CourseUpdate
): Promise<void> {
  const changes = Object.entries(newData).reduce((acc, [key, value]) => {
    if (oldData[key as keyof Course] !== value) {
      acc[key] = {
        old: oldData[key as keyof Course],
        new: value
      };
    }
    return acc;
  }, {} as Record<string, { old: any; new: any }>);

  const { error } = await supabase
    .from('course_audit_logs')
    .insert({
      course_id: courseId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      changes: changes,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to log course change:', error);
  }
}