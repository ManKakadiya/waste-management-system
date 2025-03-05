
import { useEffect, useState } from 'react';
import { AuthContext, AuthUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Safely create or update profile
  const handleProfileUpsert = async (userId: string, userData: any) => {
    try {
      console.log("Upserting profile for:", userId);
      
      // Get role and area code from user metadata as fallback
      const userRole = userData.role || 'user';
      const userAreaCode = userData.areaCode || '';
      const username = userData.username || '';
      
      // Check if profile exists first
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileCheckError) {
        console.error("Error checking profile existence:", profileCheckError);
        return false;
      }
      
      // If profile exists, just return success
      if (existingProfile) {
        console.log("Profile already exists for user:", userId);
        return true;
      }
      
      // Profile doesn't exist, create it
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: username,
          account_type: userRole,
          area_code: userAreaCode,
        });
      
      if (upsertError) {
        console.error("Profile upsert error:", upsertError);
        return false;
      }
      
      console.log("Profile created successfully for user:", userId);
      return true;
    } catch (error) {
      console.error("Error in profile upsert:", error);
      return false;
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, account_type, area_code')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return null;
      }
      
      return profileData;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
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
            
            // If profile doesn't exist, create it
            if (!profileData) {
              console.log("Profile not found, creating...");
              await handleProfileUpsert(session.user.id, {
                username: userMetadata.username || '',
                role: userMetadata.role || 'user',
                areaCode: userMetadata.areaCode || ''
              });
            }
          } catch (error) {
            console.error("Error handling user profile:", error);
            // Still set the user with available data
            setUser({
              ...session.user,
              role: session.user.user_metadata?.role || 'user',
              areaCode: session.user.user_metadata?.areaCode || '',
              username: session.user.user_metadata?.username || '',
            });
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
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      try {
        if (session?.user) {
          console.log("User authenticated:", session.user.id);
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
            
            // Ensure profile exists with updated data
            if (!profileData) {
              console.log("Creating profile after auth change");
              await handleProfileUpsert(session.user.id, {
                username: userMetadata.username || '',
                role: userMetadata.role || 'user',
                areaCode: userMetadata.areaCode || ''
              });
            }
          } catch (error) {
            console.error("Error updating user profile on auth change:", error);
            // Still set the user with available data
            setUser({
              ...session.user,
              role: session.user.user_metadata?.role || 'user',
              areaCode: session.user.user_metadata?.areaCode || '',
              username: session.user.user_metadata?.username || '',
            });
          }
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
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, location.pathname]);

  // Protect municipal dashboard route
  useEffect(() => {
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

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
