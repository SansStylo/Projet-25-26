"use client";

import React, { useState } from 'react';

export default function AccueilResponsable() {
  // On force le rôle "responsable" puisque nous sommes dans l'espace responsable
  const role = 'responsable'; 
  
  // Alertes pour l'accueil
  const [alerts] = useState([
    { id: 1, type: "Baisse de niveau", text: "La moyenne générale du groupe CIR2 a baissé de 1.5 points ce mois-ci." },
    { id: 2, type: "Absences", text: "Taux d'absence inhabituel détecté pour la promotion M1 Informatique." }
  ]);

  return (
        <main className="flex-1 overflow-y-auto p-10 bg-[#F4F7F5]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Colonne de gauche */}
            <section className="lg:col-span-2 bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02)] border border-[#E2EAE5]">
              <h2 className="text-xl font-bold mb-[15px] text-[#0F5E3D]">
                Bienvenue sur l'espace d'analyse global.
              </h2>
              <p className="text-[#53665A] leading-[1.6]">
                Vous pouvez suivre ici la progression de l'ensemble des promotions, gérer les groupes et analyser les résultats en temps réel.
              </p>
            </section>

            {/* Colonne de droite */}
            <section className="bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02)] border border-[#E2EAE5]">
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
                <p className="text-[#53665A] italic">Aucune nouvelle alerte pour le moment.</p>
              )}
            </section>

          </div>
        </main>
  );
}