
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, handleProfileUpsert } from '@/lib/authHelpers';
import { AuthUser } from '@/lib/auth';

export function useAuthState() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Process user data from session
  const processUserData = useCallback(async (session: any) => {
    try {
      // Fetch user profile data
      const profileData = await fetchUserProfile(session.user.id);
      
      // Get metadata from user
      const userMetadata = session.user.user_metadata || {};
      
      // Set user with combined data
      setUser({
        ...session.user,
        role: profileData?.account_type || userMetadata.role || 'user',
        areaCode: profileData?.area_code || userMetadata.areaCode || '',
        username: profileData?.username || userMetadata.username || '',
      });
      
      return profileData;
    } catch (error) {
      console.error("Error processing user data:", error);
      // Still set the user with available data
      setUser({
        ...session.user,
        role: session.user.user_metadata?.role || 'user',
        areaCode: session.user.user_metadata?.areaCode || '',
        username: session.user.user_metadata?.username || '',
      });
      return null;
    }
  }, []);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log("Initializing auth...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log("Session found, user:", session.user.id);
        
        // Process user data from session
        const profileData = await processUserData(session);
        
        // If profile doesn't exist, create it with delay to ensure auth is complete
        if (!profileData) {
          console.log("Profile not found, creating...");
          const userMetadata = session.user.user_metadata || {};
          
          // Add slight delay to ensure auth record is complete
          setTimeout(async () => {
            await handleProfileUpsert(session.user.id, {
              username: userMetadata.username || '',
              role: userMetadata.role || 'user',
              areaCode: userMetadata.areaCode || ''
            });
          }, 1000);
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
  }, [processUserData]);

  // Handle auth state changes
  const handleAuthChanges = useCallback((event: string, session: any) => {
    console.log("Auth state changed:", event);
    
    try {
      if (session?.user) {
        console.log("User authenticated:", session.user.id);
        
        // Process user data from session
        processUserData(session).then(profileData => {
          // Ensure profile exists with updated data
          if (!profileData && event === 'SIGNED_IN') {
            console.log("Creating profile after auth change");
            const userMetadata = session.user.user_metadata || {};
            
            // Add slight delay to ensure auth record is complete
            setTimeout(async () => {
              await handleProfileUpsert(session.user.id, {
                username: userMetadata.username || '',
                role: userMetadata.role || 'user',
                areaCode: userMetadata.areaCode || ''
              });
            }, 1000);
          }
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);

      if (event === 'SIGNED_IN') {
        console.log("User signed in, redirecting to home");
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "success",
        });
        navigate('/');
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth page");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
          variant: "info",
        });
        
        // Redirect to auth page unless already there
        if (location.pathname !== '/auth') {
          navigate('/auth');
        }
      }
    } catch (error) {
      console.error("Auth state change error:", error);
      setLoading(false);
    }
  }, [processUserData, navigate, toast, location.pathname]);

  // Route protection for municipal dashboard
  const protectMunicipalRoute = useCallback(() => {
    if (!loading && location.pathname === '/municipal-dashboard') {
      if (!user) {
        console.log("No user for municipal dashboard, redirecting to auth");
        navigate('/auth');
        toast({
          title: "Authentication required",
          description: "Please sign in to access the dashboard.",
          variant: "destructive"
        });
      } else if (user.role !== 'municipal' && user.role !== 'ngo') {
        console.log("User role not authorized for municipal dashboard:", user.role);
        navigate('/');
        toast({
          title: "Access denied",
          description: "Only municipal or NGO accounts can access this dashboard.",
          variant: "destructive"
        });
      }
    }
  }, [user, loading, navigate, location.pathname, toast]);

  return {
    user,
    loading,
    initializeAuth,
    handleAuthChanges,
    protectMunicipalRoute
  };
}
