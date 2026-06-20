/**
 * app/components/LogoutButton.tsx
 * * Composant bouton de déconnexion
 * * Rôle:
 * - Fournit un bouton de déconnexion sécurisé pour tous les utilisateurs
 * - Supprime la session et le cookie de l'utilisateur
 * * Fonctionnement:
 * - Utilise la Server Action logoutAction pour gérer la déconnexion
 * - Affiche un bouton styled au design de l'application
 * - Redirige vers la page de connexion après déconnexion
 */

"use client";

import { logoutAction } from "@/app/actions";

export function LogoutButton() {
  const handleLogout = async () => {
    // Nettoyage du cache côté client (immédiat)
    localStorage.removeItem("theme");
    document.documentElement.classList.remove("dark");
    // Appel de l'action serveur (qui gère la BDD et la redirection)
    await logoutAction();
  };
  return (
    <li>
      <button
        onClick={() => handleLogout()}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-stone-600 dark:text-emerald-200/60 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-colors text-left bg-transparent border-none outline-none cursor-pointer"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Se déconnecter
      </button>
    </li>
  );
}