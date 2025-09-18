import React, { useState } from 'react';
import { trainers } from '../../data/trainers';
import { Trainer } from '../../types';
import { Pencil, Trash2, Plus, X, Check, AlertCircle, Upload, Linkedin, Twitter, Github } from 'lucide-react';

export default function AdminTeam() {
  const [teamList, setTeamList] = useState<Trainer[]>(trainers);
  const [editingMember, setEditingMember] = useState<Trainer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const emptyMember: Trainer = {
    id: '',
    name: '',
    credentials: '',
    expertise: [],
    bio: '',
    image: '',
    social: {}
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|png)/)) {
        showNotification('error', 'Only JPG and PNG files are allowed');
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showNotification('error', 'Image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (member: Trainer) => {
    try {
      if (!member.name || !member.credentials || !member.image) {
        throw new Error('Please fill in all required fields');
      }

      if (member.bio && member.bio.length > 500) {
        throw new Error('Bio must be less than 500 characters');
      }

      if (isCreating) {
        const newMember = {
          ...member,
          id: Math.random().toString(36).substr(2, 9)
        };
        setTeamList([...teamList, newMember]);
        showNotification('success', 'Team member added successfully');
      } else {
        setTeamList(teamList.map(m => m.id === member.id ? member : m));
        showNotification('success', 'Team member updated successfully');
      }
      setEditingMember(null);
      setIsCreating(false);
      setImagePreview(null);
    } catch (error) {
      showNotification('error', (error as Error).message);
    }
  };

  const handleDelete = (id: string) => {
    setTeamList(teamList.filter(member => member.id !== id));
    setShowDeleteConfirm(null);
    showNotification('success', 'Team member deleted successfully');
  };

  const TeamMemberForm = ({ member, onSave, onCancel }: {
    member: Trainer;
    onSave: (member: Trainer) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(member);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const expertise = e.target.value.split(',').map(item => item.trim());
      setFormData(prev => ({
        ...prev,
        expertise
      }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [name]: value
        }
      }));
    };

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Credentials *</label>
            <input
              type="text"
              name="credentials"
              value={formData.credentials}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Profile Image *</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="relative">
                <img
                  src={imagePreview || formData.image}
                  alt=""
                  className="w-24 h-24 rounded-lg object-cover"
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
                JPG or PNG only. Max size 2MB.
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Expertise (comma-separated) *</label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise.join(', ')}
              onChange={handleExpertiseChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              value={formData.social.linkedin || ''}
              onChange={handleSocialChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
            <input
              type="url"
              name="twitter"
              value={formData.social.twitter || ''}
              onChange={handleSocialChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
            <input
              type="url"
              name="github"
              value={formData.social.github || ''}
              onChange={handleSocialChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your team profiles
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                setEditingMember(emptyMember);
                setIsCreating(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`
            mt-4 p-4 rounded-md
            ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
          `}>
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Member Form */}
        {editingMember && (
          <div className="mt-6">
            <TeamMemberForm
              member={editingMember}
              onSave={handleSave}
              onCancel={() => {
                setEditingMember(null);
                setIsCreating(false);
                setImagePreview(null);
              }}
            />
          </div>
        )}

        {/* Team List */}
        {!editingMember && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expertise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Social Links
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamList.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={member.image}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.credentials}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          {member.social.linkedin && (
                            <a
                              href={member.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <Linkedin className="h-5 w-5" />
                            </a>
                          )}
                          {member.social.twitter && (
                            <a
                              href={member.social.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <Twitter className="h-5 w-5" />
                            </a>
                          )}
                          {member.social.github && (
                            <a
                              href={member.social.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <Github className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {showDeleteConfirm === member.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-gray-600">Delete?</span>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingMember(member);
                                setIsCreating(false);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
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
        )}
      </div>
    </div>
  );
}