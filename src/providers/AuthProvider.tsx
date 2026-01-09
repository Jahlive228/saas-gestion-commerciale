'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@/models/auth';
import type { ReactNode } from 'react';
import { getSessionAction, isAuthenticatedAction } from '@/services/auth.action';

interface AuthContextType {
  user: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider d'authentification simple utilisant les Server Actions
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      
      const [session, authenticated] = await Promise.all([
        getSessionAction(),
        isAuthenticatedAction(),
      ]);

      setUser(session);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated,
        isLoading,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
