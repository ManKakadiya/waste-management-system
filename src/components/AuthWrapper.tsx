
import { useEffect, useCallback } from 'react';
import { AuthContext } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { 
    user, 
    loading, 
    initializeAuth, 
    handleAuthChanges, 
    protectRoutes 
  } = useAuthState();

  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChanges);
    return () => subscription.unsubscribe();
  }, [handleAuthChanges]);

  // Protect routes based on user role
  useEffect(() => {
    if (!loading) {
      protectRoutes(location.pathname);
    }
  }, [protectRoutes, loading, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
