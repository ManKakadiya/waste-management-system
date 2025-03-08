
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
    console.log("Initializing auth in AuthWrapper");
    initializeAuth();
  }, [initializeAuth]);

  // Set up auth state change listener
  useEffect(() => {
    console.log("Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChanges);
    return () => subscription.unsubscribe();
  }, [handleAuthChanges]);

  // Protect routes based on user role
  useEffect(() => {
    if (!loading) {
      console.log("Protecting routes for path:", location.pathname, "User role:", user?.role);
      protectRoutes(location.pathname);
    }
  }, [protectRoutes, loading, location.pathname, user?.role]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
