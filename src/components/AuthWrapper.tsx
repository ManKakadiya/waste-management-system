
import { useEffect } from 'react';
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
    protectMunicipalRoute 
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

  // Protect municipal dashboard route
  useEffect(() => {
    protectMunicipalRoute();
  }, [protectMunicipalRoute]);

  // Handle role-based redirects when auth state changes
  useEffect(() => {
    if (user && !loading) {
      const isMunicipalOrNGO = user.role === 'municipal' || user.role === 'ngo';
      
      // If municipal/NGO user is trying to access user-specific pages
      if (isMunicipalOrNGO && (location.pathname === '/report' || location.pathname === '/track')) {
        console.log('Redirecting municipal/NGO user to dashboard from restricted page');
        navigate('/municipal-dashboard');
      }
      
      // If regular user is trying to access municipal dashboard
      if (!isMunicipalOrNGO && location.pathname === '/municipal-dashboard') {
        console.log('Redirecting regular user from municipal dashboard to home');
        navigate('/');
      }
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
