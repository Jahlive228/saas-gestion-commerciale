import { redirect } from 'next/navigation';
import { SessionManager } from '@/server/session';
import { routes } from '@/config/routes';

export default async function AppPOSPage() {
  const session = await SessionManager.getSession();
  
  if (!session) {
    redirect(routes.auth.signin);
  }

  // TODO: Vérifier que l'utilisateur est VENDEUR ou MAGASINIER
  // Pour l'instant, on affiche juste une page de base

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Point de Vente (POS)</h1>
      <p className="text-gray-600 mb-8">
        Interface de caisse interactive avec mise à jour temps réel du stock
      </p>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm text-gray-500">
          L&apos;interface POS sera implémentée ici avec :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
          <li>Recherche et sélection de produits</li>
          <li>Panier de vente</li>
          <li>Mise à jour temps réel des stocks</li>
          <li>Validation de la transaction</li>
        </ul>
      </div>
    </div>
  );
}
