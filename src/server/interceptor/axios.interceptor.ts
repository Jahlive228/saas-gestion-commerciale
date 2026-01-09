import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { env } from '@/config/env';
import { routes } from '@/config/routes';
import { destroySessionAction, getAccessTokenAction } from '../../services/auth.action';

const apiUrl = env.API_URL;

// Création d'une instance axios
export const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  async (config) => {
    // Récupérer le token depuis la session sécurisée (côté serveur)
    let token: string | null = null;
    
    try {
      token = await getAccessTokenAction();
    } catch (sessionError) {
      console.debug('Session token not available:', sessionError);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data;
      
      console.log({ message, status });
      
      switch (status) {
        case 400:
          console.error('Erreur 400: Requête incorrecte');
          break;
        case 401:
          console.error('Erreur 401: Non autorisé');
          // Token invalide ou expiré - nettoyer la session
          try {
            await destroySessionAction();
          } catch (sessionError) {
            console.warn('Erreur lors de la suppression de la session:', sessionError);
          }
          
          // Rediriger vers la page de connexion côté client
          if (typeof window !== 'undefined') {
            window.location.href = routes.auth.signin;
          }
          break;
        case 403:
          console.error('Erreur 403: Accès interdit');
          break;
        case 404:
          console.error('Erreur 404: Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur 500: Erreur serveur interne');
          break;
        default:
          console.error(`Erreur ${status}: ${error.message}`);
          break;
      }
      
      // Retourner l'erreur formatée pour une gestion cohérente
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: {
            detail: typeof message === 'string' 
              ? message 
              : (message && typeof message === 'object' && 'detail' in message)
                ? message.detail
                : 'Une erreur est survenue',
            status,
            ...(typeof message === 'object' ? message : {}),
          },
        },
      });
    } else if (error.request) {
      console.error('Erreur de requête: Pas de réponse reçue');
      return Promise.reject({
        ...error,
        message: 'Erreur de connexion au serveur',
      });
    } else {
      console.error('Erreur:', error.message);
      return Promise.reject(error);
    }
  }
);
