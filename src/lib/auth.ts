
import { createContext, useContext } from 'react';

export type AuthUser = {
  id: string;
  email?: string;
  username?: string;
  role?: 'user' | 'municipal' | 'ngo';
  areaCode?: string;
} | null;

export type AuthContextType = {
  user: AuthUser;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);
