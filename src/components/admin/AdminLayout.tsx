import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, LogOut, Home, Tag, TestTube2, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/admin/courses', label: 'Courses', icon: LayoutGrid },
    { path: '/admin/attendees', label: 'Attendees', icon: Users },
    { path: '/admin/categories', label: 'Categories', icon: Tag },
    { path: '/admin/team', label: 'Team', icon: Users },
    { path: '/admin/email-config', label: 'Email', icon: Mail },
    { path: '/admin/testing', label: 'Testing', icon: TestTube2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold text-indigo-600">
            Admin Dashboard
          </Link>
          
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </Link>
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                    ${isActive(path)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </Link>
              ))}
            </nav>
            
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}