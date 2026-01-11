import { requireAdmin } from '@/server/auth/require-auth';

export default async function AdminPage() {
  // Vérifie l'authentification et le rôle DIRECTEUR
  const session = await requireAdmin();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Espace Directeur</h1>
      <p className="text-gray-600">
        Gestion de votre commerce : Staff, Stocks, Statistiques
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Équipe</h2>
          <p className="text-gray-600">Gérer les gérants, vendeurs et magasiniers</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Stocks</h2>
          <p className="text-gray-600">Gérer les produits et les stocks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Statistiques</h2>
          <p className="text-gray-600">Voir les performances de votre commerce</p>
        </div>
      </div>
    </div>
  );
}
