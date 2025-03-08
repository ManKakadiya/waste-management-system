
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, handleProfileUpsert } from '@/lib/authHelpers';
import { AuthUser } from '@/lib/auth';

export function useAuthState() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Process user data from session
  const processUserData = useCallback(async (session: any) => {
    try {
      console.log("Processing user data for:", session.user.id);
      
      // Fetch user profile data - critical for role detection
      const profileData = await fetchUserProfile(session.user.id);
      
      // Get metadata from user
      const userMetadata = session.user.user_metadata || {};
      
      console.log("Profile data:", profileData);
      console.log("User metadata:", userMetadata);
      
      // Determine the role - IMPORTANT: prioritize profile data over metadata
      const role = profileData?.account_type || userMetadata.role || 'user';
      console.log("Determined role:", role);
      
      // Set user with combined data, prioritizing profile data over metadata
      setUser({
        ...session.user,
        role: role,
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
      setLoading(true);
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
            
            // Refresh user data after profile creation
            const refreshedProfile = await fetchUserProfile(session.user.id);
            if (refreshedProfile) {
              console.log("Profile created, updating user data with fresh profile");
              setUser(prevUser => ({
                ...(prevUser || {}),
                role: refreshedProfile.account_type || prevUser?.role || 'user',
                areaCode: refreshedProfile.area_code || prevUser?.areaCode || '',
                username: refreshedProfile.username || prevUser?.username || '',
              }));
              
              // Also redirect based on the refreshed role
              redirectBasedOnRole(refreshedProfile.account_type);
            }
          }, 1000);
        } else {
          // We already have profile data, redirect based on that role
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
              
              // Refresh user data after profile creation
              const refreshedProfile = await fetchUserProfile(session.user.id);
              if (refreshedProfile) {
                console.log("Profile created, updating user data with fresh profile");
                setUser(prevUser => ({
                  ...(prevUser || {}),
                  role: refreshedProfile.account_type || prevUser?.role || 'user',
                  areaCode: refreshedProfile.area_code || prevUser?.areaCode || '',
                  username: refreshedProfile.username || prevUser?.username || '',
                }));
                
                // Also redirect based on the refreshed role
                redirectBasedOnRole(refreshedProfile.account_type);
              }
            }, 1000);
          } else if (event === 'SIGNED_IN') {
            // Redirect user based on role immediately on sign in
            const role = profileData?.account_type || session.user.user_metadata?.role || 'user';
            redirectBasedOnRole(role);
          }
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);

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
  }, [processUserData, navigate, toast]);

  // Redirect based on user role
  const redirectBasedOnRole = useCallback((role: string | undefined) => {
    if (role === 'municipal' || role === 'ngo') {
      console.log(`Redirecting ${role} user to dashboard`);
      navigate('/municipal-dashboard');
    } else {
      console.log('Redirecting regular user to home');
      navigate('/');
    }
  }, [navigate]);

  // Unified route protection
  const protectRoutes = useCallback((pathname: string) => {
    if (!user) {
      // If not logged in, only allow access to public routes
      if (['/report', '/track', '/municipal-dashboard', '/profile'].includes(pathname)) {
        console.log("Auth required, redirecting to auth page");
        navigate('/auth');
        toast({
          title: "Authentication required",
          description: "Please sign in to access this page.",
          variant: "destructive"
        });
      }
      return;
    }
    
    const isMunicipalOrNGO = user.role === 'municipal' || user.role === 'ngo';
    console.log("Route protection - User role:", user.role, "Is Municipal/NGO:", isMunicipalOrNGO);
    
    // Protect municipal dashboard from regular users
    if (!isMunicipalOrNGO && pathname === '/municipal-dashboard') {
      console.log("Regular user tried to access municipal dashboard");
      navigate('/');
      toast({
        title: "Access denied",
        description: "Only municipal or NGO accounts can access this dashboard.",
        variant: "destructive"
      });
      return;
    }
    
    // Redirect municipal/NGO users from user-specific pages
    if (isMunicipalOrNGO && (pathname === '/report' || pathname === '/track')) {
      console.log("Municipal/NGO tried to access user page");
      navigate('/municipal-dashboard');
      toast({
        title: "Access restricted",
        description: "Please use the dashboard for your account type.",
        variant: "destructive"
      });
      return;
    }
  }, [user, navigate, toast]);

  return {
    user,
    loading,
    initializeAuth,
    handleAuthChanges,
    protectRoutes
  };
}
