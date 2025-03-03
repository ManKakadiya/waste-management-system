
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile data from the profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, area_code, username')
          .eq('id', session.user.id)
          .single();
        
        // Combine auth user with profile data
        setUser({
          ...session.user,
          role: profileData?.role || session.user.user_metadata?.role || 'user',
          areaCode: profileData?.area_code || session.user.user_metadata?.areaCode,
          username: profileData?.username || session.user.user_metadata?.username,
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch user profile data from the profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, area_code, username')
          .eq('id', session.user.id)
          .single();
        
        // Combine auth user with profile data
        setUser({
          ...session.user,
          role: profileData?.role || session.user.user_metadata?.role || 'user',
          areaCode: profileData?.area_code || session.user.user_metadata?.areaCode,
          username: profileData?.username || session.user.user_metadata?.username,
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);

      if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate('/');
      }
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
        
        // Redirect to auth page unless already there
        if (location.pathname !== '/auth') {
          navigate('/auth');
        }
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
