"use client";

import { useEffect, useState } from 'react';
import { getSessionAction } from '@/services/auth.action';
import type { Session } from '@/models/auth';

/**
 * Hook pour accéder à la session utilisateur côté client
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const sessionData = await getSessionAction();
        setSession(sessionData);
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
  };
}
