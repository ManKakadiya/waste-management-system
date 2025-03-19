
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, handleProfileUpsert } from '@/lib/authHelpers';
import { validateRole } from './types';

// Track ongoing profile operations to prevent redundant calls
const ongoingOperations = new Map();

export const processUserSession = async (session: any) => {
  try {
    console.log("Processing user data for:", session.user.id);
    
    // Check if there's already an ongoing operation for this user
    if (ongoingOperations.has(session.user.id)) {
      console.log("Operation already in progress for user:", session.user.id);
      const cached = ongoingOperations.get(session.user.id);
      if (cached) return cached;
    }
    
    // Set promise to track ongoing operation
    const operationPromise = (async () => {
      try {
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
      } finally {
        // Clear operation after completion (with small delay to prevent immediate re-fetch)
        setTimeout(() => {
          ongoingOperations.delete(session.user.id);
        }, 2000);
      }
    })();
    
    // Store the promise
    ongoingOperations.set(session.user.id, operationPromise);
    
    // Return the result
    return await operationPromise;
  } catch (error) {
    console.error("Error in process user session:", error);
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

// Debounce profile creation to prevent redundant calls
let profileCreationTimers = new Map();

export const ensureUserProfile = async (userId: string, userData: any) => {
  console.log("Ensuring profile exists for:", userId);
  
  // Check if there's already a timer for this user
  if (profileCreationTimers.has(userId)) {
    console.log("Profile creation already scheduled for:", userId);
    clearTimeout(profileCreationTimers.get(userId));
  }
  
  try {
    // Check if profile exists
    const profileData = await fetchUserProfile(userId);
    
    if (!profileData) {
      console.log("Profile not found, creating...");
      const userMetadata = userData || {};
      
      // Create a promise that resolves when the profile is created
      const createProfile = () => new Promise(async (resolve) => {
        try {
          // Create profile with delay to ensure auth record is complete
          await new Promise(r => setTimeout(r, 1000));
          
          const success = await handleProfileUpsert(userId, {
            username: userMetadata.username || '',
            role: userMetadata.role || 'user',
            areaCode: userMetadata.areaCode || ''
          });
          
          if (success) {
            // Refresh and return user profile
            const newProfile = await fetchUserProfile(userId);
            resolve(newProfile);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error creating profile:", error);
          resolve(null);
        } finally {
          profileCreationTimers.delete(userId);
        }
      });
      
      // Set a timer to create the profile with a slight delay to prevent hammering the server
      const timer = setTimeout(createProfile, 1000);
      profileCreationTimers.set(userId, timer);
      
      // Wait for the profile creation to complete
      return await createProfile();
    }
    
    return profileData;
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    profileCreationTimers.delete(userId);
    return null;
  }
};
