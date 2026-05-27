/**
 * app/admin/page.tsx
 * 
 * Page administrateur
 * 
 * Rôle:
 * - Affiche l'interface d'administration réservée aux administrateurs
 * - Protégée par le proxy (vérifie le token de session)
 * - Accessible uniquement aux utilisateurs avec le rôle 'administrateur'
 * 
 * Fonctionnement:
 * - Page simple avec titre et description
 * - Prête à recevoir les composants d'administration
 * - Design cohérent avec le reste de l'application (Tailwind CSS)
 */

export default function AdminPage() {
  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2"> Espace Admin</h1>
        <p className="text-slate-600">Interface réservée aux administrateurs.</p>
      </div>
    </div>
  );
}
