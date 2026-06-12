"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ThemeProps {
  primaryBtn: string;
  activeTab: string;
  accentText: string;
  iconColor: string;
}

export default function ParametresContentWrapper({ theme }: { theme: ThemeProps }) {
  const [activeTab, setActiveTab] = useState<"accessibilite" | "affichage" | "notifications" | "securite">("accessibilite");

  return (
    <div className="p-6 md:p-10 flex-1 overflow-y-auto bg-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl bg-white rounded-2xl border border-[#E2EAE5] shadow-[0_4px_20px_rgba(0,0,0,0.015)] mx-auto flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* COLONNE GAUCHE : Menu des onglets (Reproduit l'image_889881.png) */}
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-[#E2EAE5] p-4 space-y-1 shrink-0">
          
          <button
            onClick={() => setActiveTab("accessibilite")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-l-4 text-left ${
              activeTab === "accessibilite" ? theme.activeTab : "border-transparent text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <path d="M22 12c-2.5 4-6.5 4-10 4s-7.5 0-10-4c2.5-4 6.5-4 10-4s7.5 0 10 4Z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            Accessibilité
          </button>

          <button
            onClick={() => setActiveTab("affichage")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-l-4 text-left ${
                activeTab === "affichage" ? theme.activeTab : "border-transparent text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Affichage
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-l-4 text-left ${
              activeTab === "notifications" ? theme.activeTab : "border-transparent text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Notifications
          </button>

          <button
            onClick={() => setActiveTab("securite")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-l-4 text-left ${
              activeTab === "securite" ? theme.activeTab : "border-transparent text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Sécurité & Comptes
          </button>
        </div>

        {/* COLONNE DROITE : Zone de formulaire adaptative */}
        <div className="flex-1 p-6 md:p-10">
          
          {/* ONGLET 1 : ACCESSIBILITÉ */}
          {activeTab === "accessibilite" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2E24] mb-1">Accessibilité</h2>
                <p className="text-sm text-slate-500">Options d'assistance visuelle pour l'adaptation des tableaux et graphes.</p>
              </div>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="mode-daltonisme" className="text-sm font-semibold text-[#1E2E24]">Filtre d'accessibilité (Daltonisme)</label>
                  <select id="mode-daltonisme" className="w-full max-w-xl bg-white border border-[#E2EAE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="desactive" defaultValue="desactive">Désactivé (Couleurs par défaut)</option>
                    <option value="deuteranopie">Deutéranopie (Déficit vert)</option>
                    <option value="protanopie">Protanopie (Déficit rouge)</option>
                    <option value="tritanopie">Tritanopie (Déficit bleu)</option>
                  </select>
                  <span className="text-xs text-slate-400">Adapte les couleurs des graphiques complexes (radar, heatmaps, histogrammes).</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="taille-texte" className="text-sm font-semibold text-[#1E2E24]">Échelle du texte (Zoom de police)</label>
                  <select id="taille-texte" className="w-full max-w-xl bg-white border border-[#E2EAE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="90">Petite (90%)</option>
                    <option value="100" defaultValue="100">Standard (100%)</option>
                    <option value="115">Grande (115%)</option>
                    <option value="130">Très grande (130%)</option>
                  </select>
                  <span className="text-xs text-slate-400">Facilite la lecture des grands tableaux de notes sans déformer l'interface.</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" id="contrastes-eleves" className="w-4 h-4 text-emerald-600 border-[#E2EAE5] rounded-sm focus:ring-emerald-500/20" />
                    <span className="text-sm font-semibold text-[#1E2E24]">Activer le mode contrastes élevés</span>
                  </label>
                  <p className="text-xs text-slate-400 pl-7">Force un affichage ultra-contrasté (textes noirs profonds sur fonds blancs purs).</p>
                </div>

                <button type="submit" className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${theme.primaryBtn}`}>
                  Appliquer les filtres
                </button>
              </form>
            </div>
          )}

          {/* ONGLET 2 : AFFICHAGE */}
          {activeTab === "affichage" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2E24] mb-1">Affichage</h2>
                <p className="text-sm text-slate-500">Personnalisez l'espace de travail et les styles visuels de la plateforme.</p>
              </div>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1E2E24]">Thème global de l'interface</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                    {["clair", "sombre", "auto"].map((t) => (
                      <label key={t} className="flex items-center gap-3 border border-[#E2EAE5] p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="radio" name="theme" value={t} defaultChecked={t === "clair"} className="text-emerald-600 focus:ring-emerald-500/20" />
                        <span className="text-sm font-medium capitalize">{t === "auto" ? "Automatique" : `Mode ${t}`}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="densite-tableaux" className="text-sm font-semibold text-[#1E2E24]">Densité des tableaux de données</label>
                  <select id="densite-tableaux" className="w-full max-w-xl bg-white border border-[#E2EAE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="aere" defaultValue="aere">Aéré (Design par défaut)</option>
                    <option value="compact">Compact (Lignes resserrées)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="style-police" className="text-sm font-semibold text-[#1E2E24]">Style de police de caractères</label>
                  <select id="style-police" className="w-full max-w-xl bg-white border border-[#E2EAE5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="sans" defaultValue="sans">Sans-Serif (Police moderne épurée)</option>
                    <option value="serif">Serif (Reposant pour longs textes)</option>
                  </select>
                </div>

                <button type="submit" className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${theme.primaryBtn}`}>
                  Appliquer le thème
                </button>
              </form>
            </div>
          )}

          {/* ONGLET 3 : NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2E24] mb-1">Configuration des notifications d'alertes</h2>
                <p className="text-sm text-slate-500">Ajustez les canaux de communication et les déclencheurs d'alertes pédagogiques.</p>
              </div>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1E2E24]">Gestion des canaux de réception</label>
                  <div className="flex flex-col gap-2.5 mt-1">
                    {["Dans l'application", "Par email"].map((label, idx) => (
                      <label key={idx} className="flex items-center gap-2.5 text-sm font-medium text-[#1E2E24] cursor-pointer">
                        <input type="checkbox" defaultChecked={idx < 2} className="w-4 h-4 text-emerald-600 border-[#E2EAE5] rounded-sm" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="frequence-rapports" className="text-sm font-semibold text-[#1E2E24]">Fréquence des rapports d'alertes</label>
                  <select id="frequence-rapports" className="w-full max-w-xl bg-white border border-[#E2EAE5] rounded-xl px-4 py-2.5 text-sm">
                    <option value="imm">Immédiate (À chaque événement)</option>
                    <option value="soir" defaultValue="soir">Quotidiennement chaque soir</option>
                    <option value="vendredi">Bilan hebdomadaire le vendredi après-midi</option>
                  </select>
                </div>

                <button type="submit" className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${theme.primaryBtn}`}>
                  Enregistrer les alertes
                </button>
              </form>
            </div>
          )}

          {/* ONGLET 4 : SÉCURITÉ */}
          {activeTab === "securite" && (
            <div className="space-y-8 max-h-[650px] overflow-y-auto pr-2">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2E24] mb-1">Configuration de la sécurité</h2>
                <p className="text-sm text-slate-500">Protégez votre compte, suivez vos connexions et gérez les doubles accès.</p>
              </div>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                
                {/* Bloc MDP */}
                <div className="border-b border-slate-100 pb-6 space-y-4">
                  <h3 className="text-base font-bold text-[#1E2E24]">Changement de mot de passe</h3>
                  {["Mot de passe actuel", "Nouveau mot de passe", "Confirmation du mot de passe"].map((label, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 max-w-xl">
                      <label className="text-xs font-semibold text-slate-500">{label}</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white border border-[#E2EAE5] rounded-xl px-4 py-2 text-sm" />
                    </div>
                  ))}
                </div>

                {/* Bloc Sessions actives */}
                <div className="border-b border-slate-100 pb-6 space-y-3">
                  <h3 className="text-base font-bold text-[#1E2E24]">Sessions actives</h3>
                  <div className="space-y-2.5 max-w-xl">
                    <div className="flex justify-between items-center bg-slate-50 p-3 border border-[#E2EAE5] rounded-xl">
                      <div className="text-xs font-medium text-slate-700">
                        <strong>Chrome sur Windows</strong> – Lille 
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">Session actuelle</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 border border-[#E2EAE5] rounded-xl">
                      <div className="text-xs font-medium text-slate-700">
                        <strong>Safari sur iPhone</strong> – Paris <span className="text-slate-400 ml-2">Il y a 2 heures</span>
                      </div>
                      <button type="button" className="text-red-500 bg-transparent border-none text-xs font-bold cursor-pointer hover:underline">Déconnecter</button>
                    </div>
                  </div>
                </div>

                <button type="submit" className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${theme.primaryBtn}`}>
                  Enregistrer la sécurité
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}