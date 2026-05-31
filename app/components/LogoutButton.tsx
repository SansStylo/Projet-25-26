/**
 * app/components/LogoutButton.tsx
 * 
 * Composant bouton de déconnexion
 * 
 * Affiche un bouton permettant à l'utilisateur de se déconnecter
 * Utilise la Server Action logoutAction
 */

"use client";

import { logoutAction } from "@/app/actions";

export function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-150 text-sm"
    >
      Se déconnecter
    </button>
  );
}
