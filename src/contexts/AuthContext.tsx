import React, { createContext, useContext, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshError: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/admin/courses');
      } else if (event === 'SIGNED_OUT') {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // If there's a refresh token error and we're not on the login page,
  // automatically sign out the user
  useEffect(() => {
    if (context.refreshError && !window.location.pathname.includes('/admin/login')) {
      context.signOut()
        .then(() => window.location.reload())
        .catch(console.error);
    }
  }, [context.refreshError]);

  return context;
}


export { AuthProvider }

export { useAuth }