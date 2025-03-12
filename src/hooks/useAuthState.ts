
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthUser } from '@/lib/auth';
import { useSessionHandlers } from '@/lib/auth/sessionHandlers';
import { useRouteProtection } from '@/lib/auth/routeProtection';

export function useAuthState() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Get session handlers - pass navigate function
  const { initializeAuth, handleAuthChanges } = useSessionHandlers(setUser, setLoading, navigate);
  
  // Get route protection
  const { protectRoutes: protectRoutesBase } = useRouteProtection();
  
  // Wrapper for route protection to pass current user
  const protectRoutes = useCallback((pathname: string) => {
    // Only run route protection if we have loaded the user data
    if (!loading) {
      protectRoutesBase(pathname, user);
    }
  }, [protectRoutesBase, user, loading]);

  return {
    user,
    loading,
    initializeAuth,
    handleAuthChanges,
    protectRoutes
  };
}
