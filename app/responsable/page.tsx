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
        <main className="flex-1 overflow-y-auto p-10 bg-[#F4F7F5] dark:bg-[#050A08] transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Colonne de gauche */}
            <section className="lg:col-span-3 bg-white dark:bg-[#0B1511] p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02)] border border-[#E2EAE5] dark:border-emerald-900/30">
              <h2 className="text-xl font-bold mb-[15px] text-[#0F5E3D] dark:text-emerald-400">
                Bienvenue sur l'espace d'analyse global.
              </h2>
              <p className="text-[#53665A] dark:text-emerald-200/60 leading-[1.6]">
                Vous pouvez suivre ici la progression de l'ensemble des promotions, gérer les groupes et analyser les résultats en temps réel.
              </p>
            </section>


          </div>
        </main>
  );
}