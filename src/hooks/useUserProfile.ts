
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export const useUserProfile = (user: any) => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("Cannot fetch profile: No user ID");
        return null;
      }
      
      try {
        console.log("Fetching profile for user ID:", user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, account_type, area_code')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        if (!data) {
          console.log("No profile found for user:", user.id);
          // Fallback to user metadata if no profile in database
          return {
            username: user.user_metadata?.username || 'User',
            role: user.user_metadata?.role || 'user',
            area_code: user.user_metadata?.areaCode || '',
          };
        } else {
          console.log("Profile fetched successfully:", data);
          return {
            username: data?.username || user.user_metadata?.username || 'User',
            role: data?.account_type || user.user_metadata?.role || 'user',
            area_code: data?.area_code || user.user_metadata?.areaCode || '',
          };
        }
      } catch (error) {
        console.error("Exception in profile fetch:", error);
        // Fallback to user metadata on error
        return {
          username: user?.user_metadata?.username || 'User',
          role: user?.user_metadata?.role || 'user',
          area_code: user?.user_metadata?.areaCode || '',
        };
      }
    },
    enabled: !!user?.id,
    retry: 3,
    staleTime: 60000, // Cache for 1 minute
  });

  const isMunicipalOrNGO = useMemo(() => {
    // Get role from profile if available, otherwise from user object
    const role = profile?.role || user?.user_metadata?.role;
    return role === 'municipal' || role === 'ngo';
  }, [profile?.role, user?.user_metadata?.role]);

  return { profile, isMunicipalOrNGO, isLoading, error };
};
