"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getClassReportData } from '@/app/actions';
import { LogoutButton } from '@/app/components/LogoutButton';

interface ClassOption {
  classId: number;
  label: string;
}

interface RapportsContentProps {
  classes: ClassOption[];
}

type RiskLevel = 'FAIBLE' | 'MODERE' | 'CRITIQUE';

const RISK_COLORS: Record<RiskLevel, string> = {
  FAIBLE: 'bg-emerald-100 text-emerald-700',
  MODERE: 'bg-orange-100 text-orange-700',
  CRITIQUE: 'bg-red-100 text-red-700',
};

const RISK_BAR: Record<RiskLevel, string> = {
  FAIBLE: 'bg-emerald-400',
  MODERE: 'bg-orange-400',
  CRITIQUE: 'bg-red-500',
};

export function RapportsContent({ classes }: RapportsContentProps) {
  const pathname = usePathname();
  const [isSidebarReduced, setSidebarReduced] = useState(false);
  const [isHovered, setHoverState] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "Système", text: "Mise à jour terminée.", date: "Récent" },
    { id: 2, type: "Rapport", text: "Les notes de B3 sont disponibles.", date: "Récent" },
  ]);

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClassSelect = async (classId: number) => {
    setSelectedClassId(classId);
    setReportData(null);
    setIsLoading(true);
    const result = await getClassReportData(classId);
    if (result.success) setReportData(result.data);
    setIsLoading(false);
  };

  const exportPdf = () => {
    if (!reportData) return;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const name = `rapport-${reportData.label}-${ts}`.replace(/\s+/g, '_');
    document.title = name;
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #class-report-content, #class-report-content * { visibility: visible !important; }
        #class-report-content {
          position: absolute !important;
          top: 0 !important; left: 0 !important;
          width: 100% !important;
          overflow: visible !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.addEventListener('afterprint', () => {
      document.head.removeChild(style);
      document.title = "Junia'lytics";
    }, { once: true });
    window.print();
  };

  const navItems = [
    { name: 'Groupes', href: '/responsable', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></> },
    { name: 'Matières', href: '/responsable/matieres', icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></> },
    { name: 'Étudiants', href: '/responsable/etudiants', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></> },
    { name: 'Rapports', href: '/responsable/rapports', icon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F7F5] text-[#1E2E24] font-sans antialiased">

      {/* Sidebar */}
      <aside
        className={`bg-[#12261E] text-white flex flex-col py-5 transition-all duration-300 ease-in-out overflow-x-hidden shrink-0 select-none ${(!isSidebarReduced || isHovered) ? 'w-64' : 'w-20'}`}
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
      >
        <div className={`flex items-center gap-4 px-6 pb-7 mb-5 border-b border-white/10 h-13.5 ${(isSidebarReduced && !isHovered) ? 'justify-center px-0! pb-7' : 'justify-start'}`}>
          <button onClick={() => setSidebarReduced(!isSidebarReduced)} className="text-white p-0 bg-transparent border-none cursor-pointer flex items-center justify-center shrink-0 w-6 h-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {(!isSidebarReduced || isHovered) && <div className="text-2xl font-bold whitespace-nowrap">Junia'lytics</div>}
        </div>

        <ul className="list-none p-0 m-0">
          {navItems.map((item, index) => {
            const isActive = item.href === '/responsable' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={index}>
                <Link href={item.href} className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 hover:text-white ${isActive ? 'bg-white/5 text-white! border-[#10B981]!' : ''} ${(isSidebarReduced && !isHovered) ? 'justify-center px-0! py-4' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">{item.icon}</svg>
                  {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col">
          <Link href="/parametres" className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 hover:text-white ${(isSidebarReduced && !isHovered) ? 'justify-center px-0! py-4' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">Paramètres</span>}
          </Link>
          {(!isSidebarReduced || isHovered) && <footer className="px-6 py-4 text-xs text-[#53665A]"><p>Junia'lytics 2026</p></footer>}
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white px-10 py-5 flex justify-between items-center border-b border-[#EAEFEA] shadow-[0_1px_3px_rgba(18,38,30,0.01)] h-18.75">
          <h1 className="text-xl font-semibold text-[#1E2E24]">Rapports</h1>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <button onClick={() => { setShowNotifs(!showNotifs); setShowProfileMenu(false); }} className="w-9 h-9 flex items-center justify-center relative bg-transparent border-none cursor-pointer text-[#53665A] hover:text-[#0F5E3D] transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {alerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#F97316] rounded-full border-2 border-white"></span>}
              </button>
              {showNotifs && (
                <div className="absolute top-[140%] right-0 w-72 bg-white border border-stone-200/80 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E2EAE5] bg-[#F4F7F5] flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-[#1E2E24]">Notifications</h3>
                    {alerts.length > 0 && <button onClick={() => setAlerts([])} className="px-3 py-1.5 border border-stone-200 hover:bg-red-50 hover:text-red-600 text-xs font-bold rounded-lg transition-all bg-white cursor-pointer">Tout supprimer</button>}
                  </div>
                  <ul className="list-none p-0 m-0">
                    {alerts.length > 0 ? alerts.map(a => (
                      <li key={a.id} className="px-4 py-3 text-sm text-[#53665A] border-b border-[#EAEFEA] hover:bg-[#EAEFEA] cursor-pointer">
                        <strong className="text-[#1E2E24]">{a.type}</strong> : {a.text}
                      </li>
                    )) : <li className="px-4 py-3 text-sm text-[#53665A] text-center italic">Aucune notification.</li>}
                  </ul>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifs(false); }}>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-[#718579] font-medium leading-none mb-1">Admin</span>
                  <span className="text-sm text-[#1E2E24] font-semibold leading-none">Responsable Pédagogique</span>
                </div>
                <div className="w-9.5 h-9.5 rounded-full bg-[#0F5E3D] text-white flex items-center justify-center text-sm font-bold border border-[#E2EAE5]">RP</div>
              </div>
              {showProfileMenu && (
                <div className="absolute top-[130%] right-0 bg-white border border-[#E2EAE5] rounded-lg shadow-lg w-45 z-1000 overflow-hidden">
                  <ul className="list-none p-0 m-0 divide-y divide-[#EAEFEA]">
                    <LogoutButton />
                    <li><Link href="/parametres" className="flex items-center gap-2.5 px-4 py-3 text-[#3B4B40] hover:bg-[#F4F7F5] font-medium text-sm transition-colors">Changer de compte</Link></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F4F7F5] p-10">

          {/* Sélecteur de promotion */}
          <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6 mb-8">
            <h2 className="text-sm font-semibold text-[#718579] uppercase tracking-wide mb-3">Sélectionner une promotion</h2>
            <div className="flex flex-wrap gap-3">
              {classes.map((cls) => (
                <button
                  key={cls.classId}
                  onClick={() => handleClassSelect(cls.classId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedClassId === cls.classId
                      ? 'bg-[#0F5E3D] text-white border-[#0F5E3D]'
                      : 'bg-white text-[#1E2E24] border-[#E2EAE5] hover:border-[#10B981] hover:text-[#0F5E3D]'
                  }`}
                >
                  {cls.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rapport */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-12 text-center text-[#718579]">
              Calcul du rapport en cours...
            </div>
          )}

          {!isLoading && reportData && (
            <div>
              {/* Div capturée pour le PDF */}
              <div id="class-report-content" className="space-y-6 bg-[#F4F7F5] p-1">

                {/* KPI cards */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Étudiants', value: reportData.totalStudents, color: 'text-[#1E2E24]' },
                    { label: 'Moyenne générale', value: reportData.classAverage !== null ? `${reportData.classAverage}/20` : '—', color: reportData.classAverage !== null && reportData.classAverage < 10 ? 'text-red-500' : 'text-[#0F5E3D]' },
                    { label: 'Étudiants à risque', value: reportData.atRiskCount, color: reportData.atRiskCount > 0 ? 'text-orange-500' : 'text-[#0F5E3D]' },
                    { label: 'Risque critique', value: reportData.criticalCount, color: reportData.criticalCount > 0 ? 'text-red-500' : 'text-[#0F5E3D]' },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-5">
                      <p className="text-xs text-[#718579] font-medium mb-1">{kpi.label}</p>
                      <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* Moyennes par matière */}
                <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6">
                  <h3 className="text-base font-semibold text-[#1E2E24] mb-4">Moyennes par matière</h3>
                  <div className="space-y-3">
                    {reportData.subjectAverages.map((s: any) => (
                      <div key={s.subjectId} className="flex items-center gap-4">
                        <span className="w-40 text-sm text-[#53665A] font-medium truncate shrink-0">{s.name}</span>
                        <div className="flex-1 bg-[#E2EAE5] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${s.average === null ? '' : s.average < 10 ? 'bg-red-400' : s.average < 12 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                            style={{ width: s.average !== null ? `${(s.average / 20) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[#1E2E24] w-14 text-right shrink-0">
                          {s.average !== null ? `${s.average}/20` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liste des étudiants avec score de risque */}
                <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6">
                  <h3 className="text-base font-semibold text-[#1E2E24] mb-4">Étudiants — Score de risque</h3>
                  <div className="space-y-2">
                    {reportData.studentProfiles.map((student: any) => (
                      <div key={student.studentId} className="flex items-center gap-4 p-3 rounded-lg bg-[#F4F7F5] border border-[#E2EAE5]">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1E2E24] truncate">{student.surname} {student.firstname}</p>
                          <p className="text-xs text-[#718579]">
                            Moyenne : {student.globalAverage !== null ? `${student.globalAverage.toFixed(2)}/20` : '—'}
                          </p>
                        </div>
                        <div className="w-32 shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#E2EAE5] rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${RISK_BAR[student.riskLevel as RiskLevel]}`} style={{ width: `${student.riskScore}%` }} />
                            </div>
                            <span className="text-xs text-[#718579] w-8 text-right shrink-0">{student.riskScore}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${RISK_COLORS[student.riskLevel as RiskLevel]}`}>
                          {student.riskLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bouton export (hors de la zone capturée) */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={exportPdf}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5E3D] hover:bg-[#10B981] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  {`Exporter le rapport ${reportData.label} en PDF`}
                </button>
              </div>
            </div>
          )}

          {!isLoading && !reportData && selectedClassId === null && (
            <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-12 text-center text-[#718579]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A3B8AC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <p className="font-medium">Sélectionnez une promotion pour générer le rapport</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
