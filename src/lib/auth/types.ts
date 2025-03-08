
import { AuthUser } from '@/lib/auth';

export type AuthStateHook = {
  user: AuthUser;
  loading: boolean;
  initializeAuth: () => Promise<void>;
  handleAuthChanges: (event: string, session: any) => void;
  protectRoutes: (pathname: string) => void;
};

export const validateRole = (role: string): 'user' | 'municipal' | 'ngo' => {
  if (role === 'municipal' || role === 'ngo') {
    return role;
  }
  return 'user';
};

export const isOrganizationUser = (role?: string): boolean => {
  return role === 'municipal' || role === 'ngo';
};
