
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export const useUserProfile = (user: any) => {
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, account_type, area_code')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        return {
          username: data?.username || user.username || 'User',
          role: data?.account_type || user.role || 'user',
          area_code: data?.area_code || user.areaCode || '',
        };
      } catch (error) {
        console.error("Error fetching profile:", error);
        return {
          username: user.username || 'User',
          role: user.role || 'user',
          area_code: user.areaCode || '',
        };
      }
    },
    enabled: !!user?.id,
  });

  const isMunicipalOrNGO = useMemo(() => {
    // Get role from profile if available, otherwise from user object
    const role = profile?.role || user?.role;
    return role === 'municipal' || role === 'ngo';
  }, [profile?.role, user?.role]);

  return { profile, isMunicipalOrNGO };
};
