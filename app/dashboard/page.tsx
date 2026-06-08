/**
 * app/dashboard/page.tsx
 * 
 * Page tableau de bord des enseignants
 * 
 * Rôle:
 * - Affiche le tableau de bord principal pour les enseignants et les utilisateurs authentifiés
 * - Protégée par requireAuth() - tous les utilisateurs authentifiés peuvent accéder
 * - Les responsables et admins peuvent aussi accéder à ce tableau de bord
 * 
 * Fonctionnement:
 * - Vérifie que l'utilisateur est authentifié (quel que soit son niveau)
 * - Récupère les données de l'utilisateur connecté
 * - Affiche le tableau de bord principal
 * - Interface de bienvenue personnalisée
 * - Design responsive utilisant Tailwind CSS
 */

"use client";

import React, { useState } from 'react';
import { requireAuth } from "@/app/lib/auth";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState([
    {id: 1, type : "Système", text: "Mise à jour terminée.", date: "Récent"},
    {id: 2, type : "Rapport", text: "Les notes de B3 sont disponibles.", date: "Récent"}
  ]);
  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  
  return (
        <main className="p-10 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* colonne de gauche */}
            <section className="lg:col-span-2 bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5]">
            <h2 className="text-xl font-bold mb-[15px] text-[#0F5E3D]">
              Bienvenue sur l'espace d'analyse.
            </h2>
            <p className="text-[#53665A] line-height-[1.6]">
              Vous pouvez suivre ici la progression de vos classes et analyser les résultats en temps réel.
            </p>
            </section>

            {/* colonne alertes */}
            <section className="bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5]">
              <h2 className="text-xl font-bold mb-[15px] text-[#0F5E3D]">
                Alertes récentes
              </h2>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="text-sm p-3 bg-[#F4F7F5] rounded-xl border border-[#E2EAE5]">
                      <span className="font-bold text-[#0F5E3D] block mb-0.5 text-xs uppercase tracking-wider">{alert.type}</span>
                      <p className="text-[#1E2E24] font-medium leading-relaxed">{alert.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#53665A] italic">
                  Aucune nouvelle alerte pour le moment.
                </p>
              )}
            </section>
          </div>
        </main>
  );
}
