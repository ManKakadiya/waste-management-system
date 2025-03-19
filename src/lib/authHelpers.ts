
import { supabase } from '@/integrations/supabase/client';

// Cache for profiles
const profileCache = new Map();
const CACHE_DURATION = 10000; // 10 seconds

// Safely create or update user profile
export const handleProfileUpsert = async (userId: string, userData: any) => {
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
    
    // Try to create profile with retry on conflicts
    let retryCount = 0;
    const maxRetries = 2; // Reduce number of retries
    let success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        // First check again if username exists to avoid conflicts
        const { data: usernameCheck } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', username)
          .maybeSingle();
          
        if (usernameCheck && usernameCheck.id !== userId) {
          // If username exists but belongs to someone else, append a random suffix
          const randomSuffix = Math.floor(Math.random() * 1000);
          const newUsername = `${username}${randomSuffix}`;
          console.log(`Username ${username} already taken, trying ${newUsername}`);
          
          const { error: upsertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: newUsername,
              account_type: userRole,
              area_code: userAreaCode,
            });
            
          if (!upsertError) {
            success = true;
            console.log(`Profile created with modified username: ${newUsername}`);
            
            // Update cache
            profileCache.set(userId, {
              username: newUsername,
              account_type: userRole,
              area_code: userAreaCode,
              timestamp: Date.now()
            });
          } else {
            console.error("Profile insert error:", upsertError);
          }
        } else {
          // Username doesn't exist or belongs to this user, proceed with insert
          const { error: upsertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: username,
              account_type: userRole,
              area_code: userAreaCode,
            });
            
          if (!upsertError) {
            success = true;
            console.log(`Profile created successfully for user: ${userId}`);
            
            // Update cache
            profileCache.set(userId, {
              username: username,
              account_type: userRole,
              area_code: userAreaCode,
              timestamp: Date.now()
            });
          } else {
            console.error("Profile insert error:", upsertError);
          }
        }
      } catch (error) {
        console.error(`Profile creation attempt ${retryCount + 1} failed:`, error);
      }
      
      retryCount++;
      if (!success && retryCount < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return success;
  } catch (error) {
    console.error("Error in profile upsert:", error);
    return false;
  }
};

// Fetch user profile data with caching
export const fetchUserProfile = async (userId: string) => {
  if (!userId) {
    console.log("No user ID provided, cannot fetch profile");
    return null;
  }
  
  try {
    // Check cache first
    const cached = profileCache.get(userId);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log("Using cached profile for user:", userId);
      return cached;
    }
    
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
    
    if (profileData) {
      // Update cache
      profileCache.set(userId, {
        ...profileData,
        timestamp: Date.now()
      });
    }
    
    return profileData;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Clear cache for a specific user or all users
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
};
