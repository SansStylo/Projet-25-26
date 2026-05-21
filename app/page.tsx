/**
 * app/page.tsx
 * 
 * Page de connexion (authentification)
 * 
 * Rôle:
 * - Affiche le formulaire de connexion pour l'accès à l'application
 * - Gère l'interaction avec l'utilisateur pour entrer email et mot de passe
 * - Affiche les messages d'erreur en cas d'échec
 * - Soumet les données via la Server Action loginAction
 * 
 * Fonctionnement:
 * - Interface avec carte blanche et design épuré
 * - Champs: email (prof@isen.fr) et mot de passe
 * - Affiche un message d'erreur en rouge si les identifiants sont incorrects
 * - Désactive le bouton et affiche "Connexion en cours..." pendant la soumission
 * - Redirige automatiquement après connexion réussie
 */

"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-200">
        
        {/* En-tête de la carte */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            🎓 ISEN Suivi
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Plateforme de suivi pédagogique et d'aide à la décision
          </p>
        </div>

        {/* Message d'erreur s'il y en a une */}
        {state.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
            ⚠️ {state.error}
          </div>
        )}

        {/* Formulaire connecté à l'action serveur */}
        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              name="email" // Indispensable pour récupérer la valeur côté serveur
              placeholder="prof@isen.fr"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              name="mot_de_passe"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              required
            />
          </div>

          {/* Bouton Se connecter */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-sm transition transform active:scale-[0.98] text-sm mt-2"
          >
            {isPending ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

      </div>
      
      <p className="text-xs text-slate-400 mt-6">
        Projet de fin d'année 2025-2026
      </p>
    </div>
  );
}