
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

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          try {
            // Fetch user profile data from the profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('username, account_type, area_code')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error("Profile fetch error:", profileError);
            }
            
            // Get role and area code from user metadata as fallback
            const userRole = profileData?.account_type || session.user.user_metadata?.role || 'user';
            const userAreaCode = profileData?.area_code || session.user.user_metadata?.areaCode || '';
            const username = profileData?.username || session.user.user_metadata?.username || '';
            
            // Set user with combined data
            setUser({
              ...session.user,
              role: userRole,
              areaCode: userAreaCode,
              username: username,
            });
            
            // If profile doesn't exist or is missing fields, create/update it
            if (!profileData) {
              const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  username: username,
                  account_type: userRole,
                  area_code: userAreaCode,
                }, { 
                  onConflict: 'id',
                  ignoreDuplicates: false 
                });
              
              if (upsertError) {
                console.error("Profile upsert error:", upsertError);
              }
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
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
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          try {
            // Fetch user profile data from the profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('username, account_type, area_code')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error("Profile fetch error on auth change:", profileError);
            }
            
            // Get role and area code from user metadata as fallback
            const userRole = profileData?.account_type || session.user.user_metadata?.role || 'user';
            const userAreaCode = profileData?.area_code || session.user.user_metadata?.areaCode || '';
            const username = profileData?.username || session.user.user_metadata?.username || '';
            
            // Set user with combined data
            setUser({
              ...session.user,
              role: userRole,
              areaCode: userAreaCode,
              username: username,
            });
            
            // Ensure profile exists with updated data
            if (!profileData) {
              const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  username: username,
                  account_type: userRole,
                  area_code: userAreaCode,
                }, { 
                  onConflict: 'id',
                  ignoreDuplicates: false 
                });
              
              if (upsertError) {
                console.error("Profile upsert error on auth change:", upsertError);
              }
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
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
            variant: "success",
          });
          navigate('/');
        }
        if (event === 'SIGNED_OUT') {
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
        navigate('/auth');
        toast({
          title: "Authentication required",
          description: "Please sign in to access the dashboard.",
          variant: "destructive"
        });
      } else if (user.role !== 'municipal' && user.role !== 'ngo') {
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
