"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import UserProfileHeader from './_components/UserProfileHeader';
import ChangePasswordCard from './_components/ChangePasswordCard';
import { getCurrentUserAction } from './_services/actions';
import { User } from '@/models/auth';

export default function ProfilePage() {
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const result = await getCurrentUserAction();
      
      if (result.success && result.data) {
        return result.data.content;
      } else {
        const errorMessage = result.success ? 'Erreur inconnue' : result.error;
        throw new Error(errorMessage);
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  console.log({user});
  

  // Fonction de callback pour mettre à jour l'utilisateur
  const handleUserUpdate = (updatedUser: User) => {
    console.log(updatedUser);

    //TODO : Ici on pourrait utiliser queryClient.setQueryData pour mettre à jour le cache
    // Pour l'instant, on peut juste refetch
    refetch();
  };

  // Gestion des erreurs
  React.useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  // Configuration du breadcrumb
  const pageTitle = "Mon profil";

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle={pageTitle} />
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">
              Chargement de votre profil...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle={pageTitle} />
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Erreur de chargement
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {error?.message || 'Une erreur est survenue'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-500/10"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle={pageTitle} />

      {/* Description */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gérez vos informations personnelles et paramètres de sécurité
        </p>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-6 ">
        {/* Colonne de gauche - Informations principales */}
        <div className="space-y-6">
          {/* Header avec photo et infos principales */}
          <UserProfileHeader user={user} onUserUpdate={handleUserUpdate} />
          
          {/* Changement de mot de passe */}
          <ChangePasswordCard />
        </div>

      </div>
    </div>
  );
}
