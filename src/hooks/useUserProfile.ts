
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
        } else {
          console.log("Profile fetched successfully:", data);
        }
        
        return {
          username: data?.username || user.username || 'User',
          role: data?.account_type || user.role || 'user',
          area_code: data?.area_code || user.areaCode || '',
        };
      } catch (error) {
        console.error("Exception in profile fetch:", error);
        return {
          username: user.username || 'User',
          role: user.role || 'user',
          area_code: user.areaCode || '',
        };
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 60000, // Cache for 1 minute
  });

  const isMunicipalOrNGO = useMemo(() => {
    // Get role from profile if available, otherwise from user object
    const role = profile?.role || user?.role;
    return role === 'municipal' || role === 'ngo';
  }, [profile?.role, user?.role]);

  return { profile, isMunicipalOrNGO, isLoading, error };
};
