
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, handleProfileUpsert } from '@/lib/authHelpers';
import { validateRole } from './types';

export const processUserSession = async (session: any) => {
  try {
    console.log("Processing user data for:", session.user.id);
    
    // Always fetch fresh profile data from the database - critical for role detection
    const profileData = await fetchUserProfile(session.user.id);
    
    // Get metadata from user
    const userMetadata = session.user.user_metadata || {};
    
    console.log("Profile data:", profileData);
    console.log("User metadata:", userMetadata);
    
    // IMPORTANT: Always prioritize profile data over metadata
    // This fixes the role inconsistency issues
    const roleFromProfile = profileData?.account_type;
    const validatedRole = validateRole(roleFromProfile || userMetadata.role || 'user');
    
    console.log("Determined role:", validatedRole);
    
    // Return processed user data
    return {
      user: {
        ...session.user,
        role: validatedRole,
        areaCode: profileData?.area_code || userMetadata.areaCode || '',
        username: profileData?.username || userMetadata.username || '',
      },
      profileData
    };
  } catch (error) {
    console.error("Error processing user data:", error);
    // Return fallback user data
    const roleFromMetadata = session.user.user_metadata?.role || 'user';
    return {
      user: {
        ...session.user,
        role: validateRole(roleFromMetadata),
        areaCode: session.user.user_metadata?.areaCode || '',
        username: session.user.user_metadata?.username || '',
      },
      profileData: null
    };
  }
};

export const ensureUserProfile = async (userId: string, userData: any) => {
  console.log("Ensuring profile exists for:", userId);
  
  try {
    // Check if profile exists
    const profileData = await fetchUserProfile(userId);
    
    if (!profileData) {
      console.log("Profile not found, creating...");
      const userMetadata = userData || {};
      
      // Create profile with delay to ensure auth record is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await handleProfileUpsert(userId, {
        username: userMetadata.username || '',
        role: userMetadata.role || 'user',
        areaCode: userMetadata.areaCode || ''
      });
      
      // Refresh and return user profile
      return await fetchUserProfile(userId);
    }
    
    return profileData;
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return null;
  }
};
