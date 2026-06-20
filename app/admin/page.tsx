/**
 * app/admin/page.tsx
 * * Page administrateur
 * * Rôle:
 * - Affiche l'interface d'administration réservée aux administrateurs
 * - Protégée par requireExactLevel(2) - seuls les admins (level=2) peuvent accéder
 * - Redirige les utilisateurs avec un niveau insuffisant
 * * Fonctionnement:
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
    <main className="flex-1 overflow-y-auto p-10 bg-[#F4F7F5] dark:bg-[#050A08] transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Colonne de gauche */}
        <section className="lg:col-span-3 bg-white dark:bg-[#0B1511] p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02)] border border-[#E2EAE5] dark:border-emerald-900/30">
          <h2 className="text-xl font-bold mb-[15px] text-[#0F5E3D] dark:text-emerald-400">
            Bienvenue sur l'interface d'administrateur.
          </h2>
          <p className="text-[#53665A] dark:text-emerald-200/70 leading-[1.6]">
            Gérez les accès utilisateurs, configurez les promotions et matières et suivez en temps réel l'activité du système.</p>
        </section>
      </div>
    </main>
  );
}