"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Durée de validité des données en cache (5 minutes)
            staleTime: 5 * 60 * 1000,
            // Durée de conservation en cache (10 minutes)
            gcTime: 10 * 60 * 1000,
            // Retry automatique des requêtes échouées
            retry: (failureCount, error: unknown) => {
              // Ne pas retry pour les erreurs 401, 403, 404
              const axiosError = error as { response?: { status: number } };
              if (axiosError?.response?.status === 401) return false;
              if (axiosError?.response?.status === 403) return false;
              if (axiosError?.response?.status === 404) return false;
              
              // Retry maximum 3 fois pour les autres erreurs
              return failureCount < 3;
            },
            // Refetch quand la fenêtre devient active
            refetchOnWindowFocus: false,
            // Refetch à la reconnexion
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry automatique des mutations échouées
            retry: (failureCount, error: unknown) => {
              // Ne pas retry pour les erreurs client (4xx)
              const axiosError = error as { response?: { status: number } };
              if (axiosError?.response?.status && 
                  axiosError.response.status >= 400 && 
                  axiosError.response.status < 500) {
                return false;
              }
              
              // Retry maximum 2 fois pour les erreurs serveur
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools uniquement en développement */}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  );
}
