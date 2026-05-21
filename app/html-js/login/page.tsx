"use client";
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-200">
        
        {/* En-tête de la carte */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
             ISEN Suivi
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Plateforme de suivi pédagogique et d'aide à la décision
          </p>
        </div>

        {/* Formulaire */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
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
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              required
            />
          </div>

          {/* Bouton Se connecter */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition transform active:scale-[0.98] text-sm mt-2"
          >
            Se connecter
          </button>
        </form>

      </div>
      
      <p className="text-xs text-slate-400 mt-6">
        Projet de fin d'année 2025-2026
      </p>
    </div>
  );
}