"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LogoutButton } from "@/app/components/LogoutButton";
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
  const [isSidebarReduced, setSidebarReduced] = useState(false);
  const [isHovered, setHoverState] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "Responsable", text: "Analyse des classes en cours.", date: "Récent" },
    { id: 2, type: "Alerte", text: "Nouveaux étudiants à risque détectés.", date: "Récent" }
  ]);

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    // structure globale
    <div className="flex min-h-screen bg-[#F4F7F5] text-[#1E2E24] font-sans antialiased">
      
      {/* sidebar */}
      <aside
        className={`bg-[#12261E] text-white flex flex-col py-5 transition-all duration-300 ease-in-out overflow-x-hidden shrink-0 select-none ${
          ((!isSidebarReduced) || isHovered) ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
      >

        {/* en-tête sidebar */}
        <div className={`flex items-center gap-4 px-6 pb-7 mb-5 border-b border-white/10 h-[54px] ${
          (isSidebarReduced && (!isHovered)) ? 'justify-center px-0! pb-7' : 'justify-start'
        }`}>
          <button
            onClick={() => setSidebarReduced(!isSidebarReduced)}
            className="text-[#A3B8AC] hover:text-[#0F5E3D] transition-colors duration-300 p-0 bg-transparent border-none cursor-pointer flex items-center justify-center shrink-0 w-6 h-6"
            style={{ color: 'white' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {((!isSidebarReduced) || isHovered) && (
            <div className="text-2xl font-bold whitespace-nowrap animate-fadeIn">Junia'lytics</div>
          )}
        </div>

        {/* liens de navigation */}
        <ul className="list-none p-0 m-0">
          {[
            { name: 'Groupes', href: '/responsable/groupes', icon: (
              <>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </>
            ) },
            { name: 'Matières', href: '/responsable/matieres', icon: (
              <>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </>
            ) },
            { name: 'Étudiants', href: '/responsable/etudiants', icon: (
              <>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </>
            ) },
            { name: 'Rapports', href: '/responsable/rapports', icon: (
              <>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </>
            ) }
          ].map((item, index) => (
            <li key={index}>
              <Link href={item.href} className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 hover:text-white ${
                item.active ? 'bg-white/5 text-white! border-[#10B981]!' : ''
              } ${(isSidebarReduced && (!isHovered)) ? 'justify-center px-0! py-4' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  {item.icon}
                </svg>
                {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* bas de la sidebar */}
        <div className="mt-auto flex flex-col">
          <Link href="/responsable/parametres"
            className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 hover:text-white ${
              (isSidebarReduced && (!isHovered)) ? 'justify-center px-0! py-4' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">Paramètres</span>}
          </Link>
          {(!isSidebarReduced || isHovered) && (
            <footer className="px-6 py-4 text-xs text-[#53665A]">
              <p>Junia'lytics 2026</p>
            </footer>
          )}
        </div>
      </aside>

      {/* grand conteneur à droite */}
      <div className="flex-1 flex flex-col">

        {/* header */}
        <header className="bg-white px-10 py-5 flex justify-between items-center border-b border-[#EAEFEA] shadow-[0_1px_3px_rgba(18,38,30,0.01)] h-[75px]">
          <h1 className="text-xl font-semibold text-[#1E2E24]">Tableau de bord - Responsable Pédagogique</h1>
          
          {/* conteneur cloche + profil */}
          <div className="flex items-center gap-6">
            
            {/* cloche de notifs */}
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => { setShowNotifs(!showNotifs); setShowProfileMenu(false); }}
                className="w-9 h-9 flex items-center justify-center relative bg-transparent border-none cursor-pointer text-[#53665A] hover:text-[#0F5E3D] transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {/* Pastille d'Alerte sur la cloche */}
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#F97316] rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Menu déroulant des notifs */}
              {showNotifs && (
                <div className="absolute top-[140%] right-0 w-72 bg-white border border-stone-200/80 rounded-xl shadow-[0_10px_30px_rgba(18,38,30,0.05),0_1px_3px_rgba(0,0,0,0.02)] z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E2EAE5] bg-[#F4F7F5] rounded-t-lg flex justify-between items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1E2E24]">Notifications</h3>
                    
                    {alerts.length > 0 && (
                      <button onClick={() => setAlerts([])} 
                        className="px-3 py-1.5 border border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer bg-white">
                        Tout supprimer
                      </button>
                    )}
                  </div>

                  <ul className="list-none p-0 m-0">
                    {alerts.length > 0 ? (
                      alerts.map((alert) => (
                        <li key={alert.id} className="px-4 py-3 text-sm text-[#53665A] border-b border-[#EAEFEA] hover:bg-[#EAEFEA] cursor-pointer">
                          <strong className="text-[#1E2E24]">{alert.type}</strong> : {alert.text}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-[#53665A] text-center italic">
                        Aucune notification.
                      </li>
                    )} 
                  </ul>
                </div>
              )}
            </div>

            {/* Profil utilisateur */}
            <div className="relative">
              <div className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifs(false); }}>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-[#718579] font-medium leading-none mb-1">Responsable</span>
                  <span className="text-sm text-[#1E2E24] font-semibold leading-none">Pédagogique</span>
                </div>
                <div className="w-[38px] h-[38px] relative shrink-0">
                  <div className="w-full h-full rounded-full bg-[#0F5E3D] text-white flex items-center justify-center text-sm font-bold border border-[#E2EAE5]">
                    RP
                  </div>
                </div>
              </div>
              
              {/* Menu déroulant profil (déconnexion) */}
              {showProfileMenu && (
                <div className="absolute top-[130%] right-0 bg-white border border-[#E2EAE5] rounded-lg shadow-[0_10px_25px_-5px_rgba(18,38,30,0.05)] w-[180px] z-[1000] overflow-hidden">
                  <ul className="list-none p-0 m-0 divide-y divide-[#EAEFEA]">
                    <LogoutButton />

                    <li>
                      <Link 
                        href="/parametres" 
                        className="flex items-center gap-2.5 px-4 py-3 text-[#3B4B40] hover:bg-[#F4F7F5] font-medium text-sm transition-colors"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="shrink-0"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Changer de compte
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div> 
        </header>

        {/* Conteneur principal */}
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
      </div>
    </div>
  );
}
