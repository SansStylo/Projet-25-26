/**
 * app/dashboard/page.tsx
 * 
 * Page tableau de bord des enseignants
 * 
 * Rôle:
 * - Affiche le tableau de bord principal pour les enseignants et les utilisateurs authentifiés
 * - Protégée par requireAuth() - tous les utilisateurs authentifiés peuvent accéder
 * - Les responsables et admins peuvent aussi accéder à ce tableau de bord
 * 
 * Fonctionnement:
 * - Vérifie que l'utilisateur est authentifié (quel que soit son niveau)
 * - Récupère les données de l'utilisateur connecté
 * - Affiche le tableau de bord principal
 * - Interface de bienvenue personnalisée
 * - Design responsive utilisant Tailwind CSS
 */

import { requireAuth } from "@/app/lib/auth";
import { ROLE_LABELS } from "@/app/lib/auth-constants";
import { LogoutButton } from "@/app/components/LogoutButton";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Tableau de Bord
            </h1>
            <p className="text-slate-600 mb-2">
              Bienvenue sur ISEN Suivi
            </p>
            <p className="text-sm text-slate-500">
              Connecté en tant que: <span className="font-semibold text-slate-700">{user.firstname} {user.surname}</span> ({ROLE_LABELS[user.level as 0 | 1 | 2]})
            </p>
          </div>
          <LogoutButton />
        </div>
        
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
