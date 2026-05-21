/**
 * app/dashboard/page.tsx
 * 
 * Page tableau de bord des enseignants
 * 
 * Rôle:
 * - Affiche le tableau de bord principal pour les enseignants
 * - Protégée par le middleware (vérifie le token de session)
 * - Accessible aux utilisateurs authentifiés avec rôle 'enseignant'
 * 
 * Fonctionnement:
 * - Page d'accueil après connexion pour les enseignants
 * - Interface de bienvenue avec section pour contenu futur
 * - Design responsive utilisant Tailwind CSS
 */

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
           Tableau de Bord
        </h1>
        <p className="text-slate-600 mb-8">
          Bienvenue sur ISEN Suivi
        </p>
        
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Contenu à venir
          </h2>
          <p className="text-slate-600">
            
          </p>
        </div>
      </div>
    </div>
  );
}
