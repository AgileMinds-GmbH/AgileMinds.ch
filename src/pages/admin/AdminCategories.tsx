import React, { useState, useEffect } from 'react';
import { Plus, X, Check, AlertCircle, Tag, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('expertise_areas')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      setLoading(true);
      
      // Check if category already exists
      const { data: existing, error: checkError } = await supabase
        .from('expertise_areas')
        .select('id')
        .eq('name', newCategory.trim());

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing && existing.length > 0) {
        setNotification({
          type: 'error',
          message: 'Category already exists'
        });
        return;
      }

      const { error } = await supabase
        .from('expertise_areas')
        .insert({ name: newCategory.trim() });

      if (error) throw error;

      setNewCategory('');
      setIsAddingCategory(false);
      loadCategories();
      setNotification({
        type: 'success',
        message: 'Category added successfully'
      });
    } catch (err) {
      console.error('Error adding category:', err);
      setNotification({
        type: 'error',
        message: 'Failed to add category'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('expertise_areas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      setShowDeleteConfirm(null);
      setNotification({
        type: 'success',
        message: 'Category deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting category:', err);
      setNotification({
        type: 'error',
        message: 'Failed to delete category'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage course categories and expertise areas
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex">
              <AlertCircle className={`h-5 w-5 ${
                notification.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`} />
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Form */}
        {isAddingCategory && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="newCategory" className="sr-only">
                  New Category Name
                </label>
                <input
                  type="text"
                  id="newCategory"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || loading}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${loading || !newCategory.trim()
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  }
                `}
              >
                <Check className="h-4 w-4 mr-2" />
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory('');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-900 font-medium">
                    {category.name}
                  </span>
                </div>
                {showDeleteConfirm === category.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Added {new Date(category.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Get started by adding a new category'
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}