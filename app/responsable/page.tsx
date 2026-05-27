/**
 * app/responsable/page.tsx
 * 
 * Page responsable pédagogique
 * 
 * Rôle:
 * - Affiche l'interface dédiée aux responsables pédagogiques
 * - Protégée par le proxy (vérifie le token de session)
 * - Accessible uniquement aux utilisateurs avec le rôle 'responsable_pedagogique'
 * 
 * Fonctionnement:
 * - Interface réservée aux responsables pédagogiques
 * - Page de bienvenue avec titre et description
 * - Prête pour intégration de composants spécifiques aux responsables
 */

export default function ResponsablePage() {
  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2"> Espace Responsable</h1>
        <p className="text-slate-600">Interface réservée aux responsables pédagogiques.</p>
      </div>
    </div>
  );
}
