
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
          // Return a default profile with role and area code from user object if available
          return {
            username: user.username || 'User',
            role: user.role || 'user',
            area_code: user.areaCode || '',
          };
        } else {
          console.log("Profile fetched successfully:", data);
          return {
            username: data.username || 'User',
            role: data.account_type || 'user',
            area_code: data.area_code || '',
          };
        }
      } catch (error) {
        console.error("Exception in profile fetch:", error);
        // Instead of throwing error, return fallback data to prevent UI crashes
        return {
          username: user?.username || 'User',
          role: user?.role || 'user',
          area_code: user?.areaCode || '',
        };
      }
    },
    enabled: !!user?.id,
    retry: 1, // Reduce retries to prevent excessive requests
    staleTime: 600000, // Cache for 10 minutes to reduce refetches
    gcTime: 900000, // Keep data in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetching when component remounts
  });

  // Determine municipal/NGO status with fallback to avoid null errors
  const isMunicipalOrNGO = useMemo(() => {
    const role = profile?.role || user?.role || 'user';
    return role === 'municipal' || role === 'ngo';
  }, [profile?.role, user?.role]);

  return { 
    profile, 
    isMunicipalOrNGO, 
    isLoading, 
    error,
    // Add explicit role getter to simplify role checks
    role: profile?.role || user?.role || 'user'
  };
};
