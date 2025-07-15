import { createContext, useContext } from 'react';

interface AuthContextType {
  user: any | null;
  logout: (reason?: string) => Promise<void>;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};