/**
 * app/components/responsable/ResponsableDashboardContent.tsx
 * 
 * Composant du tableau de bord complet pour responsables pédagogiques
 * 
 * Rôle:
 * - Affiche le tableau de bord complet avec sélecteur de classe, KPIs et graphiques
 * - Intègre la sidebar, header et toute l'interface responsable
 * - Permet une vue d'ensemble des performances d'une classe/groupe
 * 
 * Fonctionnement:
 * - Reçoit les statistiques de groupes via les props
 * - Gère la sélection de classe et l'état du dashboard
 * - Affiche les KPIs, graphiques et sélecteurs pour la classe sélectionnée
 * - Sidebar et header adapté aux responsables avec navigation appropriée
 */

"use client";

import React, { useState } from 'react';
import DashboardCharts from "./DashboardCharts";
import KpiCards from "./KpiCards";
import ClassSelector from "./ClassSelector";

interface ResponsableDashboardContentProps {
  allClasses: Array<{ classId: number; label: string }>;
  currentClassId: number;
  overviewRes: any;
  studentsRisk: any[];
  subjects: any[];
  evolution: any[];
  alertStudents: any[];
}

export default function ResponsableDashboardContent({
  allClasses,
  currentClassId,
  overviewRes,
  studentsRisk,
  subjects,
  evolution,
  alertStudents,
}: ResponsableDashboardContentProps) {
  // États pour l'interactivité des menus et de la sidebar
  const [alerts, setAlerts] = useState([
    { id: 1, type: "Responsable", text: "Analyse des classes en cours.", date: "Récent" },
    { id: 2, type: "Alerte", text: "Nouveaux étudiants à risque détectés.", date: "Récent" }
  ]);

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
        <main className="p-10 flex-1 overflow-auto">
          
          {/* En-tête avec titre et sélecteur de classe */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1E2E24] mb-1">
                Analyse Pédagogique
              </h2>
              <p className="text-[#53665A] text-sm">
                Suivi détaillé des performances de classe
              </p>
            </div>
            <ClassSelector classes={allClasses} />
          </div>

          {!overviewRes.success ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 shadow-sm">
              <p className="text-sm font-medium">
                Impossible de charger les données pour cette classe. Assurez-vous
                qu'elle contient des étudiants inscrits et des notes.
              </p>
            </div>
          ) : (
            <>
              <KpiCards
                studentsRisk={studentsRisk}
                className={overviewRes.data?.className || ""}
                globalAverage={overviewRes.data?.globalAverage ?? null}
              />

              <div className="w-full mb-8">
                <DashboardCharts 
                  subjects={subjects} 
                  evolution={evolution
                    .filter(item => item.moyenne !== null)
                    .map(item => ({
                      ...item,
                      moyenne: item.moyenne as number 
                    }))
                  } 
                />
              </div>

              <section className="mb-8 bg-white rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] overflow-hidden">
                <div className="bg-[#F4F7F5] px-6 py-4 border-b border-[#E2EAE5]">
                  <h2 className="text-lg font-bold text-[#1E2E24] flex items-center gap-2">
                    <span>⚠️</span> Alertes de décrochage en temps réel
                  </h2>
                </div>
                <div className="p-6">
                  {alertStudents.length === 0 ? (
                    <p className="text-green-600 font-semibold text-center py-4">
                      Aucun signalement de décrochage détecté.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {alertStudents.map((student) => (
                        <div
                          key={student.studentId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border rounded-xl border-[#E2EAE5] bg-white hover:bg-[#F4F7F5] transition-colors"
                        >
                          <div>
                            <h4 className="font-bold text-lg text-[#1E2E24]">
                              {student.firstname} {student.surname}
                            </h4>
                            <p className="text-sm font-medium text-[#53665A]">
                              Moyenne : {student.globalAverage?.toFixed(2)} / 20
                            </p>
                            <ul className="list-disc pl-5 text-sm text-red-500 mt-2">
                              {student.flags.map((flag: string, idx: number) => (
                                <li key={idx}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              student.riskLevel === "CRITIQUE"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            Risque {student.riskLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] overflow-hidden">
                <div className="bg-[#F4F7F5] px-6 py-4 border-b border-[#E2EAE5]">
                  <h2 className="text-lg font-bold text-[#1E2E24]">
                    📊 Synthèse statistique par matière
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F7F5] border-b border-[#E2EAE5]">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-[#1E2E24] text-xs uppercase">
                          Matière
                        </th>
                        <th className="px-6 py-4 font-semibold text-[#1E2E24] text-xs uppercase">
                          Moyenne
                        </th>
                        <th className="px-6 py-4 font-semibold text-[#1E2E24] text-xs uppercase">
                          Min
                        </th>
                        <th className="px-6 py-4 font-semibold text-[#1E2E24] text-xs uppercase">
                          Max
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFEA]">
                      {subjects.map((subject) => (
                        <tr key={subject.subjectId} className="hover:bg-[#F4F7F5] transition-colors">
                          <td className="px-6 py-4 font-semibold text-[#1E2E24]">
                            {subject.subjectName}
                          </td>
                          <td className="px-6 py-4 font-bold text-sm text-green-600">
                            {subject.average.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-[#53665A]">
                            {subject.minGrade.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-[#53665A]">
                            {subject.maxGrade.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
  );
}
