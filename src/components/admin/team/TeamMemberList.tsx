import React from 'react';
import { Linkedin, Twitter, Github, Mail, Phone } from 'lucide-react';
import type { Database } from '../../../types/supabase';

type TeamMember = Database['public']['Tables']['team_members']['Row'];

interface TeamMemberListProps {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
}

export default function TeamMemberList({
  members,
  onEdit,
  onDelete
}: TeamMemberListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <div
          key={member.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="relative h-48">
            <img
              src={member.profile_image_url || 'https://via.placeholder.com/400x400'}
              alt={member.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute top-4 right-4">
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${member.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                }
              `}>
                {member.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {member.name}
            </h3>
            <p className="text-sm text-indigo-600 mb-4">{member.title}</p>
            <p className="text-gray-600 mb-4 line-clamp-3">{member.bio}</p>

            <div className="space-y-2 mb-4">
              {member.email && (
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
              )}
              {member.phone && (
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  {member.phone}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 mb-4">
              {member.linkedin_url && (
                <a
                  href={member.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {member.twitter_url && (
                <a
                  href={member.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {member.github_url && (
                <a
                  href={member.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => onEdit(member)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-600 rounded-md hover:bg-indigo-50"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(member.id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-600 rounded-md hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}