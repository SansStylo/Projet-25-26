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
 * - Affiche un message d'erreur si les identifiants sont incorrects
 * - Désactive le bouton et affiche "Connexion en cours..." pendant la soumission
 * - Redirige automatiquement après connexion réussies
 */

"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F7F5] text-[#1E2E24] font-sans antialiased p-6 sm:p-12 selection:bg-emerald-700/10 relative overflow-hidden">
      
      {/* losange vert sapin au centre */}
      <div className="absolute top-0 right-0 w-[55vw] translate-x-12 h-full bg-gradient-to-br from-[#12261E] to-[#1C4E35] pointer-events-none transform origin-top-right -skew-x-12 hidden xl:block z-0 border-l-4 border-emerald-800/10"/>
        
      {/* En-tête avec nom de l'appli et num de version*/}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-700 rounded-full lg:bg-emerald-400" />
          <h1 className="text-sm font-black tracking-widest uppercase text-stone-900">
            Junia'lytics
          </h1>
        </div>
        <span className="text-[11px] font-bold tracking-widest text-[#53665A] lg:text-[#53665A] xl:text-emerald-100/60 uppercase">
          V1.0
        </span>
      </header>  
      
      {/* Zone centrale*/}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-8 items-center my-auto z-10 relative py-12">
        
        {/* Colonne de gauche : connexion */}
        <div className="text-center xl:text-left xl:col-span-4 xl:pr-4 space-y-6 max-w-md mx-auto xl:mx-0 z-10">
          <span className="text-xs font-bold tracking-widest text-emerald-800 uppercase block">
            Plateforme Pédagogique
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1E2E24] leading-[1.1]">
            L'analyse de données au service de la <span className="font-serif italic text-emerald-700 font-normal">pédagogie</span>.
          </h2>
          <p className="text-[#53665A] text-sm sm:text-base leading-relaxed font-medium">
            Simplifiez le suivi de vos classes, centralisez vos évaluations et identifiez instantanément les besoins de vos étudiants.
          </p>
        </div>
        


        {/* Colonne de droite : formulaire de connexion */}
        <div className="xl:col-span-5 xl:col-start-8 w-full max-w-md bg-white p-6 sm:p-10 rounded-2xl shadow-[0_20px_50px_rgba(28,78,53,0.03)] border border-stone-200/60 mx-auto xl:mx-0 z-10">
          
          <div className="mb-8 text-center sm:text-left">
            <h3 className="text-xl font-bold tracking-tight text-[#1E2E24]">
              Espace de connexion
            </h3>
            <p className="text-stone-400 text-xs mt-1 font-medium">
              Saisissez vos accès académiques Junia pour continuer.
            </p>
          </div>

          {/* Message d'erreur s'il y en a une */}
          {state.error && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-900 text-xs rounded-xl font-semibold flex items-center gap-3 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>{state.error}</span>
            </div>
          )}


        {/* Formulaire connecté à l'action serveur */}
        <form action={formAction} className="space-y-5">
          
          {/* Champ email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ">
              Adresse email
            </label>
            <input
              type="email"
              name="email" // Indispensable pour récupérer la valeur côté serveur
              placeholder="prof@isen.fr"
              className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 outline-none transition text-sm font-medium"
              required
            />
          </div>

          {/* Champ mot de passe */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Mot de passe
              </label>
              <a href="#oublie" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
                Mot de passe oublié?
              </a>
            </div>
            <input
              id="password"
              type="password"
              name="mot_de_passe"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 outline-none transition text-sm font-medium"
              required
            />
          </div>

          {/* Bouton Se connecter */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold rounded-xl shadow-md shadow-emerald-700/5 transition duration-150 active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed">
              {isPending ? (
                <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              "Connexion en cours..."
              </>
            ) : ("Se connecter")}
            </button>
          </div>
        </form>
        </div>
      </main>
    
      {/* Pied de page */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row gap-2 justify-between items-center text-[10px] text-stone-400 font-bold tracking-widest pt-6 border-t border-stone-200/40 z-10 relative">
        <span>JUNIA HEI-ISEN-ISA</span>
        <span>ANNÉE SCOLAIRE 2025-2026</span>
      </footer>
      
    </div>
  );
}