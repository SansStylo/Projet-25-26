/**
 * app/components/LogoutButton.tsx
 * 
 * Composant bouton de déconnexion
 * 
 * Rôle:
 * - Fournit un bouton de déconnexion sécurisé pour tous les utilisateurs
 * - Supprime la session et le cookie de l'utilisateur
 * 
 * Fonctionnement:
 * - Utilise la Server Action logoutAction pour gérer la déconnexion
 * - Affiche un bouton styled au design de l'application
 * - Redirige vers la page de connexion après déconnexion
 */

"use client";

import { logoutAction } from "@/app/actions";

export function LogoutButton() {
  return (
    <li>
      <button
        onClick={() => logoutAction()}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-[#3B4B40] hover:bg-[#F4F7F5] font-medium text-sm transition-colors text-left bg-transparent border-none outline-none cursor-pointer"
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