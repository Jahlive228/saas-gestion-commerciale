import { redirect } from 'next/navigation';
import { SessionManager } from '@/server/session';
import { routes } from '@/config/routes';

export default async function SuperAdminPage() {
  const session = await SessionManager.getSession();
  
  if (!session) {
    redirect(routes.auth.signin);
  }

  // TODO: Vérifier que l'utilisateur est SUPERADMIN
  // Pour l'instant, on affiche juste une page de base

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Superadmin Dashboard</h1>
      <p className="text-gray-600">
        Vue globale et administration de la plateforme
      </p>
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Cette page sera complétée avec les statistiques agrégées de tous les commerces
        </p>
      </div>
    </div>
  );
}
