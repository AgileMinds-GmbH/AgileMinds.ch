import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, Upload, X, Plus, Edit2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/supabase';

type Course = Database['public']['Tables']['courses']['Row'];

interface UnifiedCourseFormProps {
  course?: Course;
  initialData?: Partial<Course>;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function UnifiedCourseForm({
  course,
  initialData,
  onSuccess,
  onCancel
}: UnifiedCourseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    slug: '',
    price: 1000,
    early_bird_price: undefined,
    early_bird_deadline: undefined,
    description: '',
    thumbnail_url: '',
    duration: '2 days',
    start_time: '09:00',
    end_time: '17:00',
    start_date: '',
    end_date: '',
    spots_available: 14,
    language: 'en',
    skill_level: 'beginner',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    meta_keywords: [], // Will store categories
    learning_objectives: [],
    prerequisites: [],
    materials: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  useEffect(() => {
    if (course) {
      setFormData(course);
      setSelectedCategories(course.meta_keywords || []);
      setLogoPreview(course.logo_url || null);
    } else if (initialData) {
      setFormData(initialData);
      setSelectedCategories(initialData.meta_keywords || []);
      setLogoPreview(initialData.logo_url || null);
    }
  }, [course, initialData]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        if (!file.type.match(/image\/(jpeg|png)/)) {
          setError('Only JPG and PNG files are allowed');
          return;
        }

        // Validate file size (500KB)
        if (file.size > 500 * 1024) {
          setError('Logo size must be less than 500KB');
          return;
        }

        // Show preview
        const objectUrl = URL.createObjectURL(file);
        setLogoPreview(objectUrl);

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `course-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('course-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('course-images')
          .getPublicUrl(filePath);

        // Update form data with new logo URL
        setFormData(prev => ({
          ...prev,
          logo_url: publicUrl
        }));

      } catch (err) {
        console.error('Error uploading logo:', err);
        setError('Failed to upload logo. Please try again.');
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        if (!file.type.match(/image\/(jpeg|png)/)) {
          setError('Only JPG and PNG files are allowed');
          return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
          setError('Image size must be less than 2MB');
          return;
        }

        // Show preview
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `course-thumbnails/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('course-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('course-images')
          .getPublicUrl(filePath);

        // Update form data with new thumbnail URL
        setFormData(prev => ({
          ...prev,
          thumbnail_url: publicUrl
        }));

      } catch (err) {
        console.error('Error uploading image:', err);
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('expertise_areas')
          .select('*')
          .order('name');

        if (error) throw error;
        setAvailableCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      }
    };

    loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      meta_title: title
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      setError('Course title is required');
      return false;
    }

    if (!formData.description?.trim()) {
      setError('Course description is required');
      return false;
    }

    if (!formData.start_date || !formData.end_date) {
      setError('Course dates are required');
      return false;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (startDate > endDate) {
      setError('Start date must be before end date');
      return false;
    }

    if (formData.early_bird_price !== undefined) {
      if (formData.early_bird_price >= formData.price) {
        setError('Early bird price must be less than regular price');
        return false;
      }
      
      if (!formData.early_bird_deadline) {
        setError('Early bird deadline is required when early bird price is set');
        return false;
      }
    }

    if (formData.early_bird_deadline) {
      if (!formData.early_bird_price) {
        setError('Early bird price is required when deadline is set');
        return false;
      }
      
      if (new Date(formData.early_bird_deadline) >= new Date(formData.start_date)) {
        setError('Early bird deadline must be before course start date');
        return false;
      }
    }

    if (formData.spots_available && (formData.spots_available < 1 || formData.spots_available > 14)) {
      setError('Available spots must be between 1 and 14');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (course) {
        // Update existing course
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
            version: (course.version || 0) + 1
          })
          .eq('id', course.id);
          
        if (updateError) throw updateError;

      } else {
        // Create new course
        const { error: insertError } = await supabase
          .from('courses')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="course-form-modal">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close form"
          >
            <X className="h-6 w-6" />
          </button>

    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {course ? 'Edit Course' : 'Create New Course'}
        </h2>
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
            `}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Course Content */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Course Content</h3>
          
          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Objectives
            </label>
            <div className="space-y-2">
              {formData.learning_objectives?.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...(formData.learning_objectives || [])];
                      newObjectives[index] = e.target.value;
                      setFormData(prev => ({ ...prev, learning_objectives: newObjectives }));
                    }}
                    className="flex-1 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter a learning objective"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newObjectives = formData.learning_objectives?.filter((_, i) => i !== index) || [];
                      setFormData(prev => ({ ...prev, learning_objectives: newObjectives }));
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newObjectives = [...(formData.learning_objectives || []), ''];
                  setFormData(prev => ({ ...prev, learning_objectives: newObjectives }));
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Learning Objective
              </button>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            <div className="space-y-2">
              {formData.prerequisites?.map((prerequisite, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={prerequisite}
                    onChange={(e) => {
                      const newPrerequisites = [...(formData.prerequisites || [])];
                      newPrerequisites[index] = e.target.value;
                      setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
                    }}
                    className="flex-1 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter a prerequisite"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPrerequisites = formData.prerequisites?.filter((_, i) => i !== index) || [];
                      setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newPrerequisites = [...(formData.prerequisites || []), ''];
                  setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Prerequisite
              </button>
            </div>
          </div>

          {/* Course Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Materials
            </label>
            <div className="space-y-2">
              {formData.materials?.map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => {
                      const newMaterials = [...(formData.materials || [])];
                      newMaterials[index] = e.target.value;
                      setFormData(prev => ({ ...prev, materials: newMaterials }));
                    }}
                    className="flex-1 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter course material"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newMaterials = formData.materials?.filter((_, i) => i !== index) || [];
                      setFormData(prev => ({ ...prev, materials: newMaterials }));
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newMaterials = [...(formData.materials || []), ''];
                  setFormData(prev => ({ ...prev, materials: newMaterials }));
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course Material
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Logo
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="relative">
                <img
                  src={logoPreview || formData.logo_url || 'https://via.placeholder.com/64'}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="absolute -bottom-2 -right-2 p-1 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 text-gray-600" />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p>Course logo (shown as icon)</p>
                <p>Recommended size: 64x64px</p>
              </div>
            </div>
          </div>
          
          {/* Thumbnail Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Thumbnail
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="relative">
                <img
                  src={imagePreview || formData.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&q=80'}
                  alt=""
                  className="w-48 h-24 object-cover rounded-lg"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="absolute -bottom-2 -right-2 p-1 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 text-gray-600" />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p>JPG or PNG only</p>
                <p>Max size 2MB</p>
                <p>Recommended size: 800x400px</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Categories
            </label>
            <div className="space-y-4">
              {/* Selected Categories */}
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => {
                        const newCategories = selectedCategories.filter((_, i) => i !== index);
                        setSelectedCategories(newCategories);
                        setFormData(prev => ({ ...prev, meta_keywords: newCategories }));
                      }}
                      className="p-0.5 hover:bg-indigo-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !selectedCategories.includes(value)) {
                      const newCategories = [...selectedCategories, value];
                      setSelectedCategories(newCategories);
                      setFormData(prev => ({ ...prev, meta_keywords: newCategories }));
                    }
                  }}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Add a category...</option>
                  {availableCategories
                    .filter(category => !selectedCategories.includes(category.name))
                    .map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Course Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date *
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                Start Time *
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                End Time *
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (CHF) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            {/* Early Bird Pricing */}
            <div className="col-span-2 border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Early Bird Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="early_bird_price" className="block text-sm font-medium text-gray-700">
                    Early Bird Price (CHF)
                  </label>
                  <input
                    type="number"
                    id="early_bird_price"
                    name="early_bird_price"
                    value={formData.early_bird_price || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      if (!value || value < formData.price) {
                        setFormData(prev => ({ ...prev, early_bird_price: value }));
                      }
                    }}
                    min="0"
                    max={formData.price - 0.01}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Must be less than regular price
                  </p>
                </div>

                <div>
                  <label htmlFor="early_bird_deadline" className="block text-sm font-medium text-gray-700">
                    Early Bird Deadline
                  </label>
                  <input
                    type="date"
                    id="early_bird_deadline"
                    name="early_bird_deadline"
                    value={formData.early_bird_deadline || ''}
                    onChange={(e) => {
                      const value = e.target.value || undefined;
                      if (!value || new Date(value) < new Date(formData.start_date)) {
                        setFormData(prev => ({ ...prev, early_bird_deadline: value }));
                      }
                    }}
                    max={formData.start_date}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Must be before course start date
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="spots_available" className="block text-sm font-medium text-gray-700">
                Available Spots *
              </label>
              <input
                type="number"
                id="spots_available"
                name="spots_available"
                value={formData.spots_available}
                onChange={handleChange}
                min="1"
                max="14"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language *
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="en">English</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700">
                Skill Level *
              </label>
              <select
                id="skill_level"
                name="skill_level"
                value={formData.skill_level}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
              Meta Title
            </label>
            <input
              type="text"
              id="meta_title"
              name="meta_title"
              value={formData.meta_title || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

        </div>
      </div>
    </form>
        </div>
      </div>
    </div>
  );
}