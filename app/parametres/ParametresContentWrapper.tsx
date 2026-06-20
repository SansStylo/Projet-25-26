"use client";

import React, { useState, useEffect } from "react";
import { changePasswordAction, updateThemeAction } from '../actions';
import { useRouter } from "next/navigation";

interface ThemeProps {
  primaryBtn: string;
  activeTab: string;
  accentText: string;
  iconColor: string;
}

export default function ParametresContentWrapper({ theme, userTheme }: { theme: ThemeProps, userTheme: "light" | "dark" }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"theme" | "securite">("theme");
  
  // 1. On initialise DIRECTEMENT avec la valeur de la BDD (on ne lit plus le localStorage ici)
  const [themeMode, setThemeMode] = useState<"light" | "dark">(userTheme);

  // 2. Si l'utilisateur change (nouvelle session), on force le composant à se mettre à jour
  useEffect(() => {
    setThemeMode(userTheme);
  }, [userTheme]);

  // 3. Ce useEffect applique le thème au DOM et garde le localStorage à jour pour le F5
  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  // 4. Le handler de changement au clic
  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setThemeMode(newTheme); 
    
    try {
      await updateThemeAction(newTheme); 
      router.refresh(); 
    } catch (error) {
      setThemeMode(newTheme === "light" ? "dark" : "light");
    }
  };


  
  

  // useEffect(() => {
  //   if (themeMode === "dark") {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  //   localStorage.setItem("theme", themeMode);
  // }, [themeMode]);

  // // ÉTAPE 5 : Le handler de changement propre
  // const handleThemeChange = async (newTheme: "light" | "dark") => {
  //   setThemeMode(newTheme); // Changement visuel INSTANTANÉ à l'écran
    
  //   try {
  //     await updateThemeAction(newTheme); // Sauvegarde en BDD
  //     router.refresh(); // <--- Met à jour les données du serveur en douce (plus besoin de F5 !)
  //   } catch (error) {
  //     // En cas d'erreur réseau, on remet l'ancien thème
  //     setThemeMode(newTheme === "light" ? "dark" : "light");
  //   }
  // };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
    
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      showToast("Les nouveaux mots de passe ne correspondent pas.", "error");
      return;
    }
    setIsSaving(true);
    const res = await changePasswordAction(passData.current, passData.new);
    if (res.success) {
      showToast("Mot de passe modifié avec succès !", "success");
      setPassData({ current: "", new: "", confirm: "" });
    } else {
      showToast(res.error || "Erreur lors de la modification.", "error");
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 md:p-10 flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#050A08] min-h-screen transition-colors duration-300">
      <div className="max-w-5xl bg-white dark:bg-[#0B1511] rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 shadow-[0_4px_20px_rgba(0,0,0,0.015)] mx-auto flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* COLONNE GAUCHE : Menu des onglets */}
        <div className="w-full md:w-64 bg-slate-50/50 dark:bg-[#0A120F] border-r border-[#E2EAE5] dark:border-emerald-900/30 p-4 space-y-1 shrink-0">

          <button
            onClick={() => setActiveTab("theme")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-l-4 text-left ${
                activeTab === "theme" ? theme.activeTab : "border-transparent text-slate-600 dark:text-emerald-200/60 hover:bg-slate-100/80 dark:hover:bg-emerald-900/30"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Thèmes
          </button>

          <button
            onClick={() => setActiveTab("securite")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-l-4 text-left ${
              activeTab === "securite" ? theme.activeTab : "border-transparent text-slate-600 dark:text-emerald-200/60 hover:bg-slate-100/80 dark:hover:bg-emerald-900/30"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Sécurité & Comptes
          </button>
        </div>

        {/* COLONNE DROITE : Zone de formulaire adaptative */}
        <div className="flex-1 p-6 md:p-10">

          {/* ONGLET 2 : Thèmes */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2E24] dark:text-emerald-50 mb-1">Thèmes</h2>
                <p className="text-sm text-slate-500 dark:text-emerald-200/60">Personnalisez le style visuel de la plateforme.</p>
              </div>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1E2E24] dark:text-emerald-50">Thème global de l'interface</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                    {[
                    { label: "Clair", value: "light" },
                    { label: "Sombre", value: "dark" }
                  ].map((t) => (
                    <label 
                      key={t.value} 
                      className={`flex items-center gap-3 border p-3 rounded-xl cursor-pointer transition-colors ${
                        themeMode === t.value 
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500" 
                          : "border-[#E2EAE5] dark:border-emerald-900/50 hover:bg-slate-50 dark:hover:bg-[#0E1B16]"
                      }`}
                      >
                        <input 
                          type="radio" 
                          name="theme" 
                          value={t.value} 
                          checked={themeMode === t.value} 
                          onChange={() => handleThemeChange(t.value as "light" | "dark")}
                          className="text-emerald-600 focus:ring-emerald-500/20" 
                        />
                        <span className="text-sm font-medium capitalize dark:text-emerald-50">
                          {t.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          )}


          {/* ONGLET 3 : SÉCURITÉ */}
          {activeTab === "securite" && (
            <div className="space-y-8 max-h-[650px] overflow-y-auto pr-2">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2E24] dark:text-emerald-50 mb-1">Configuration de la sécurité</h2>
                <p className="text-sm text-slate-500 dark:text-emerald-200/60">Protégez votre compte.</p>
              </div>
              
              <form className="space-y-6" onSubmit={handlePasswordChange}>
                <div className="border-b border-slate-100 dark:border-emerald-900/30 pb-6 space-y-4">
                  <h3 className="text-base font-bold text-[#1E2E24] dark:text-emerald-50">Changement de mot de passe</h3>
                  
                  {/* Mot de passe actuel */}
                  <div className="flex flex-col gap-1.5 max-w-xl">
                    <label className="text-xs font-semibold text-slate-500 dark:text-emerald-200/60">Mot de passe actuel</label>
                    <input 
                      type="password" 
                      required
                      value={passData.current}
                      onChange={(e) => setPassData({...passData, current: e.target.value})}
                      placeholder="••••••••" 
                      className="w-full bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 text-slate-900 dark:text-emerald-50 rounded-xl px-4 py-2 text-sm" 
                    />
                  </div>

                  {/* Nouveau mot de passe */}
                  <div className="flex flex-col gap-1.5 max-w-xl">
                    <label className="text-xs font-semibold text-slate-500 dark:text-emerald-200/60">Nouveau mot de passe</label>
                    <input 
                      type="password" 
                      required
                      value={passData.new}
                      onChange={(e) => setPassData({...passData, new: e.target.value})}
                      placeholder="••••••••" 
                      className="w-full bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 text-slate-900 dark:text-emerald-50 rounded-xl px-4 py-2 text-sm" 
                    />
                  </div>

                  {/* Confirmation */}
                  <div className="flex flex-col gap-1.5 max-w-xl">
                    <label className="text-xs font-semibold text-slate-500 dark:text-emerald-200/60">Confirmation du mot de passe</label>
                    <input 
                      type="password" 
                      required
                      value={passData.confirm}
                      onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                      placeholder="••••••••" 
                      className="w-full bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 text-slate-900 dark:text-emerald-50 rounded-xl px-4 py-2 text-sm" 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${theme.primaryBtn} ${isSaving ? 'opacity-50' : ''}`}
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer la modification"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 border-l-4 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[20000] animate-fadeIn transition-all bg-white dark:bg-[#0E1B16] cursor-pointer ${
          toast.type === "error" ? "border-red-500" : toast.type === "success" ? "border-[#10B981]" : "border-[#F97316]"
        }`} onClick={() => setToast(null)}>
          <div className={`p-2 rounded-full ${
              toast.type === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-500" : toast.type === "success" ? "bg-[#E6F4EE] dark:bg-emerald-900/20 text-[#10B981]" : "bg-[#F97316]/10 text-[#F97316]"
            }`}>
            {toast.type === "error" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            ) : toast.type === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            </div>
          <div>
            <h4 className="text-sm font-bold text-[#1E2E24] dark:text-emerald-50">{toast.type === "success" ? "Succès" : "Erreur"}</h4>
            <p className="text-xs text-[#53665A] dark:text-emerald-200/60 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}