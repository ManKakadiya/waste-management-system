
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast'; 
import { processUserSession, ensureUserProfile } from './userProcessor';
import { useRouteProtection } from './routeProtection';
import { NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validateRole } from './types';

export const useSessionHandlers = (
  setUser: any, 
  setLoading: any, 
  navigate: NavigateFunction
) => {
  const { toast } = useToast();
  const { redirectBasedOnRole } = useRouteProtection();
  
  // Handle initial auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log("Initializing auth...");
      setLoading(true);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log("Session found, user:", session.user.id);
        
        // Process user data from session - always get fresh profile data
        const { user, profileData } = await processUserSession(session);
        setUser(user);
        
        // If profile doesn't exist, create it
        if (!profileData) {
          const refreshedProfile = await ensureUserProfile(session.user.id, session.user.user_metadata);
          
          if (refreshedProfile) {
            // Update user with refreshed profile data
            const roleFromProfile = refreshedProfile.account_type;
            setUser(prevUser => {
              if (!prevUser) return null;
              return {
                ...prevUser,
                role: validateRole(roleFromProfile || prevUser.role || 'user'),
                areaCode: refreshedProfile.area_code || prevUser.areaCode || '',
                username: refreshedProfile.username || prevUser.username || '',
              };
            });
            
            // Redirect based on refreshed role - always use account_type from database
            redirectBasedOnRole(refreshedProfile.account_type);
          }
        } else {
          // We have profile data, redirect based on role from the database
          // This fixes the inconsistent redirection
          redirectBasedOnRole(profileData.account_type);
        }
      } else {
        console.log("No active session found");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, redirectBasedOnRole]);
  
  // Handle auth state changes
  const handleAuthChanges = useCallback((event: string, session: any) => {
    console.log("Auth state changed:", event);
    
    try {
      if (session?.user) {
        console.log("User authenticated:", session.user.id);
        
        // Process user data from session - always get fresh profile data
        processUserSession(session).then(async ({ user, profileData }) => {
          setUser(user);
          
          // Ensure profile exists for new sign-ins
          if (!profileData && event === 'SIGNED_IN') {
            const refreshedProfile = await ensureUserProfile(session.user.id, session.user.user_metadata);
            
            if (refreshedProfile) {
              // Update user with refreshed profile
              const roleFromProfile = refreshedProfile.account_type;
              setUser(prevUser => {
                if (!prevUser) return null;
                return {
                  ...prevUser,
                  role: validateRole(roleFromProfile || prevUser.role || 'user'),
                  areaCode: refreshedProfile.area_code || prevUser.areaCode || '',
                  username: refreshedProfile.username || prevUser.username || '',
                };
              });
              
              // Redirect based on database role
              redirectBasedOnRole(refreshedProfile.account_type);
            }
          } else if (event === 'SIGNED_IN') {
            // Redirect user based on role from database immediately on sign in
            // Critical fix for consistent redirection
            redirectBasedOnRole(profileData?.account_type);
          }
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
      
      // Show toast messages for auth events
      if (event === 'SIGNED_IN') {
        console.log("User signed in");
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "success",
        });
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth page");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
          variant: "info",
        });
        
        // Redirect to auth page unless already there
        if (window.location.pathname !== '/auth') {
          navigate('/auth');
        }
      }
    } catch (error) {
      console.error("Auth state change error:", error);
      setLoading(false);
    }
  }, [setUser, setLoading, redirectBasedOnRole, toast, navigate]);
  
  return { initializeAuth, handleAuthChanges };
};
