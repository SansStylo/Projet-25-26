/**
 * app/admin/page.tsx
 * 
 * Page administrateur
 * 
 * Rôle:
 * - Affiche l'interface d'administration réservée aux administrateurs
 * - Protégée par requireExactLevel(2) - seuls les admins (level=2) peuvent accéder
 * - Redirige les utilisateurs avec un niveau insuffisant
 * 
 * Fonctionnement:
 * - Vérifie que l'utilisateur est un administrateur (level=2)
 * - Récupère les données de l'utilisateur connecté
 * - Affiche l'interface d'administration
 * - Design cohérent avec le reste de l'application (Tailwind CSS)
 */

import { requireExactLevel } from "@/app/lib/auth";
import { ROLE_LABELS } from "@/app/lib/auth-constants";
import { LogoutButton } from "@/app/components/LogoutButton";

export default async function AdminPage() {
  const user = await requireExactLevel(2);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Espace Admin</h1>
            <p className="text-slate-600">Interface réservée aux administrateurs.</p>
            <p className="text-sm text-slate-500 mt-3">
              Connecté en tant que: <span className="font-semibold text-slate-700">{user.firstname} {user.surname}</span> ({ROLE_LABELS[user.level as 0 | 1 | 2]})
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Gestion des utilisateurs</h2>
            <p className="text-slate-600">Gérez les comptes des enseignants et responsables pédagogiques.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Gestion des classes</h2>
            <p className="text-slate-600">Organisez les classes et les groupes d'étudiants.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Gestion des matières</h2>
            <p className="text-slate-600">Définissez les matières et leurs assignations.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Rapports et statistiques</h2>
            <p className="text-slate-600">Consultez les rapports globaux du système.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
