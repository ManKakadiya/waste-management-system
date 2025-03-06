
import { useEffect } from 'react';
import { AuthContext } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { 
    user, 
    loading, 
    initializeAuth, 
    handleAuthChanges, 
    protectMunicipalRoute 
  } = useAuthState();

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

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
