"use client";

import { useEffect, useState, useRef } from 'react';
import { getSessionAction } from '@/services/auth.action';
import type { Session } from '@/models/auth';

// Cache global pour la session (partagé entre tous les composants)
let globalSession: Session | null = null;
let globalSessionLoading = true;
let sessionPromise: Promise<Session | null> | null = null;

/**
 * Hook pour accéder à la session utilisateur côté client
 * Utilise un cache global pour éviter les requêtes multiples
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(globalSession);
  const [isLoading, setIsLoading] = useState(globalSessionLoading);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Si la session est déjà chargée globalement, l'utiliser
    if (!globalSessionLoading && globalSession !== null) {
      setSession(globalSession);
      setIsLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    // Si une requête est déjà en cours, attendre sa résolution
    if (sessionPromise) {
      sessionPromise.then((sessionData) => {
        if (!hasLoadedRef.current) {
          setSession(sessionData);
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      }).catch(() => {
        if (!hasLoadedRef.current) {
          setSession(null);
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      });
      return;
    }

    // Charger la session une seule fois
    hasLoadedRef.current = false;
    setIsLoading(true);
    
    sessionPromise = (async () => {
      try {
        const sessionData = await getSessionAction();
        globalSession = sessionData;
        globalSessionLoading = false;
        return sessionData;
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        globalSession = null;
        globalSessionLoading = false;
        return null;
      } finally {
        sessionPromise = null;
      }
    })();

    sessionPromise.then((sessionData) => {
      if (!hasLoadedRef.current) {
        setSession(sessionData);
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    });
  }, []);

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
  };
}
