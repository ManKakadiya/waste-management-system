
import { useEffect, useRef } from 'react';
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
  const initialProtectionDone = useRef(false);

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

  // Protect routes based on user role - only once after loading completes
  useEffect(() => {
    if (!loading && !initialProtectionDone.current) {
      console.log("Initial route protection for path:", location.pathname, "User role:", user?.role);
      protectRoutes(location.pathname);
      initialProtectionDone.current = true;
    }
  }, [protectRoutes, loading, location.pathname, user?.role]);

  // Update protection on route changes, but only after initial protection is done
  useEffect(() => {
    if (!loading && initialProtectionDone.current) {
      console.log("Route changed, checking protection for:", location.pathname);
      protectRoutes(location.pathname);
    }
  }, [location.pathname, protectRoutes, loading]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
