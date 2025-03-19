
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast'; 
import { processUserSession, ensureUserProfile } from './userProcessor';
import { useRouteProtection } from './routeProtection';
import { NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validateRole } from './types';

// Debounce helper with immediate option
const debounce = (fn: Function, ms = 300, options = { immediate: false }) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    const callNow = options.immediate && !timeoutId;
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      timeoutId = undefined as any;
      if (!options.immediate) fn(...args);
    }, ms);
    
    if (callNow) fn(...args);
  };
};

// Cache to prevent redundant profile operations
const operationsCache = new Map();

export const useSessionHandlers = (
  setUser: any, 
  setLoading: any, 
  navigate: NavigateFunction
) => {
  const { toast } = useToast();
  const { redirectBasedOnRole } = useRouteProtection();
  
  // Track initialization state
  let isInitializing = false;
  
  // Handle initial auth state with debouncing
  const initializeAuth = useCallback(async () => {
    if (isInitializing) return;
    isInitializing = true;
    
    try {
      console.log("Initializing auth...");
      setLoading(true);
      
      // Check for cached operation
      const cacheKey = 'auth_init';
      if (operationsCache.has(cacheKey)) {
        console.log("Using cached auth init");
        const cachedData = operationsCache.get(cacheKey);
        if (cachedData) {
          setUser(cachedData.user);
          setLoading(false);
          isInitializing = false;
          
          // Update cache expiry
          setTimeout(() => {
            operationsCache.delete(cacheKey);
          }, 10000); // Cache for 10 seconds
          
          return;
        }
      }
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setLoading(false);
        isInitializing = false;
        return;
      }
      
      if (session?.user) {
        console.log("Session found, user:", session.user.id);
        
        // Process user data from session - always get fresh profile data
        const { user, profileData } = await processUserSession(session);
        setUser(user);
        
        // Cache result
        operationsCache.set(cacheKey, { user, profileData });
        
        // Set expiry for cache
        setTimeout(() => {
          operationsCache.delete(cacheKey);
        }, 10000); // Cache for 10 seconds
        
        // If profile doesn't exist, create it
        if (!profileData) {
          const refreshedProfile = await ensureUserProfile(session.user.id, session.user.user_metadata);
          
          if (refreshedProfile) {
            // Update user with refreshed profile data
            const roleFromProfile = refreshedProfile.account_type;
            setUser(prevUser => {
              if (!prevUser) return null;
              return {
                ...prevUser,
                role: validateRole(roleFromProfile || prevUser.role || 'user'),
                areaCode: refreshedProfile.area_code || prevUser.areaCode || '',
                username: refreshedProfile.username || prevUser.username || '',
              };
            });
            
            // Redirect based on refreshed role - always use account_type from database
            redirectBasedOnRole(refreshedProfile.account_type);
          }
        } else {
          // We have profile data, redirect based on role from the database
          // This fixes the inconsistent redirection
          redirectBasedOnRole(profileData.account_type);
        }
      } else {
        console.log("No active session found");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setLoading(false);
      isInitializing = false;
    }
  }, [setUser, setLoading, redirectBasedOnRole]);
  
  // Create debounced versions of handlers
  const debouncedRedirect = useCallback(
    debounce((role: string) => redirectBasedOnRole(role), 500, { immediate: true }),
    [redirectBasedOnRole]
  );
  
  // Handle auth state changes with debouncing
  const handleAuthChanges = useCallback((event: string, session: any) => {
    console.log("Auth state changed:", event);
    
    try {
      if (session?.user) {
        console.log("User authenticated:", session.user.id);
        
        // Process user data from session - always get fresh profile data
        processUserSession(session).then(async ({ user, profileData }) => {
          setUser(user);
          
          // Ensure profile exists for new sign-ins
          if (!profileData && event === 'SIGNED_IN') {
            const refreshedProfile = await ensureUserProfile(session.user.id, session.user.user_metadata);
            
            if (refreshedProfile) {
              // Update user with refreshed profile
              const roleFromProfile = refreshedProfile.account_type;
              setUser(prevUser => {
                if (!prevUser) return null;
                return {
                  ...prevUser,
                  role: validateRole(roleFromProfile || prevUser.role || 'user'),
                  areaCode: refreshedProfile.area_code || prevUser.areaCode || '',
                  username: refreshedProfile.username || prevUser.username || '',
                };
              });
              
              // Redirect based on database role, but immediately on first call
              debouncedRedirect(refreshedProfile.account_type);
            }
          } else if (event === 'SIGNED_IN') {
            // Redirect user based on role from database immediately on sign in
            // Critical fix for consistent redirection, but with immediate first call
            debouncedRedirect(profileData?.account_type);
          }
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
      
      // Show toast messages for auth events
      if (event === 'SIGNED_IN') {
        console.log("User signed in");
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "success",
        });
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth page");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
          variant: "info",
        });
        
        // Redirect to auth page unless already there
        if (window.location.pathname !== '/auth') {
          navigate('/auth');
        }
      }
    } catch (error) {
      console.error("Auth state change error:", error);
      setLoading(false);
    }
  }, [setUser, setLoading, debouncedRedirect, toast, navigate]);
  
  return { initializeAuth, handleAuthChanges };
};
