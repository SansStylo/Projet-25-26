/**
 * app/responsable/page.tsx
 * 
 * Page responsable pédagogique
 * 
 * Rôle:
 * - Affiche l'interface dédiée aux responsables pédagogiques
 * - Protégée par requireLevel(1) - les responsables (level≥1) et admins peuvent accéder
 * - Redirige les utilisateurs avec un niveau insuffisant
 * 
 * Fonctionnement:
 * - Vérifie que l'utilisateur est au moins responsable pédagogique (level≥1)
 * - Récupère les données de l'utilisateur connecté
 * - Affiche l'interface dédiée aux responsables
 * - Interface réservée aux responsables pédagogiques et admins
 * - Prête pour intégration de composants spécifiques aux responsables
 */

import { requireLevel } from "@/app/lib/auth";
import { ROLE_LABELS } from "@/app/lib/auth-constants";
import { LogoutButton } from "@/app/components/LogoutButton";

export default async function ResponsablePage() {
  const user = await requireLevel(1);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Espace Responsable</h1>
            <p className="text-slate-600">Interface réservée aux responsables pédagogiques.</p>
            <p className="text-sm text-slate-500 mt-3">
              Connecté en tant que: <span className="font-semibold text-slate-700">{user.firstname} {user.surname}</span> ({ROLE_LABELS[user.level as 0 | 1 | 2]})
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Suivi des classes</h2>
            <p className="text-slate-600">Suivez les performances et l'engagement de vos classes.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Rapports pédagogiques</h2>
            <p className="text-slate-600">Accédez aux rapports d'analyse pédagogique détaillés.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Gestion des enseignants</h2>
            <p className="text-slate-600">Supervisez les ressources pédagogiques et les enseignants.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Alertes et notifications</h2>
            <p className="text-slate-600">Consultez les alertes relatives au suivi pédagogique.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
