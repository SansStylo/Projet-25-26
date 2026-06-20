/**
 * app/components/ProfilButton.tsx
 * * Composant bouton de profil
 * * Rôle:
 * - Fournit un bouton pour accéder au profil de l'utilisateur
 * * Fonctionnement:
 * - Redirige vers l'interface de profil
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfilButton() {
  const pathname = usePathname();
  const profilHref = "/profil";


  return (

    <Link
      href={profilHref}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-stone-600 dark:text-emerald-200/60 hover:bg-[#F4F7F5] dark:hover:bg-emerald-900/30 hover:text-stone-900 dark:hover:text-emerald-50 font-medium text-sm transition-colors text-left bg-transparent border-none outline-none cursor-pointer"
    >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Mon profil
    </Link>
  );
}