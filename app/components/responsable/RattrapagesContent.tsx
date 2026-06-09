"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getRattrapageData } from '@/app/actions';
import { LogoutButton } from '@/app/components/LogoutButton';

interface ClassOption {
  classId: number;
  label: string;
}

interface StudentGrade {
  assessmentId: string;
  value: number;
  maxGrade: number;
  weight: number;
  subjectId: number;
  subjectName: string;
  assessmentLabel: string;
}

interface StudentData {
  studentId: string;
  firstname: string;
  surname: string;
  grades: StudentGrade[];
}

interface AssessmentInfo {
  assessmentId: string;
  label: string;
  subjectId: number;
  subjectName: string;
  maxGrade: number;
  weight: number;
}

function computeWeightedAverage(grades: StudentGrade[]): number | null {
  let tw = 0, wt = 0;
  for (const g of grades) {
    tw += (g.value / g.maxGrade) * 20 * g.weight;
    wt += g.weight;
  }
  return wt > 0 ? tw / wt : null;
}

function computeSimulatedAverage(
  grades: StudentGrade[],
  assessment: AssessmentInfo,
  rattrapageValue: number
): number | null {
  const rOn20 = (rattrapageValue / assessment.maxGrade) * 20;
  let tw = 0, wt = 0, handled = false;
  for (const g of grades) {
    if (g.assessmentId === assessment.assessmentId) {
      tw += Math.max((g.value / g.maxGrade) * 20, rOn20) * g.weight;
      wt += g.weight;
      handled = true;
    } else {
      tw += (g.value / g.maxGrade) * 20 * g.weight;
      wt += g.weight;
    }
  }
  if (!handled) { tw += rOn20 * assessment.weight; wt += assessment.weight; }
  return wt > 0 ? tw / wt : null;
}

const RATTRAPAGES_ICON = (
  <>
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </>
);

export default function RattrapagesContent({ classes }: { classes: ClassOption[] }) {
  const pathname = usePathname();
  const [isSidebarReduced, setSidebarReduced] = useState(false);
  const [isHovered, setHoverState] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [threshold, setThreshold] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classData, setClassData] = useState<{ students: StudentData[]; assessments: AssessmentInfo[] } | null>(null);
  const [isLoadingClass, setIsLoadingClass] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentInfo | null>(null);
  const [rattrapageNotes, setRattrapageNotes] = useState<Record<string, string>>({});

  const navItems = [
    { name: 'Groupes', href: '/responsable', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></> },
    { name: 'Matières', href: '/responsable/matieres', icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></> },
    { name: 'Étudiants', href: '/responsable/etudiants', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></> },
    { name: 'Rapports', href: '/responsable/rapports', icon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></> },
    { name: 'Rattrapages', href: '/responsable/rattrapages', icon: RATTRAPAGES_ICON },
  ];

  const handleClassSelect = async (classId: number) => {
    setSelectedClassId(classId);
    setSelectedAssessment(null);
    setRattrapageNotes({});
    setClassData(null);
    setIsLoadingClass(true);
    const data = await getRattrapageData(classId);
    setClassData(data);
    setIsLoadingClass(false);
  };

  const handleAssessmentSelect = (assessment: AssessmentInfo) => {
    setSelectedAssessment(prev =>
      prev?.assessmentId === assessment.assessmentId ? null : assessment
    );
    setRattrapageNotes({});
  };

  const exportPdf = () => {
    if (!selectedAssessment || !classData) return;
    const cls = classes.find(c => c.classId === selectedClassId);
    const ts = new Date().toISOString().slice(0, 10);
    document.title = `rattrapages-${cls?.label}-${selectedAssessment.subjectName}-${ts}`.replace(/\s+/g, '_');
    const style = document.createElement('style');
    style.innerHTML = `@media print {
      body * { visibility: hidden !important; }
      #rattrapage-print, #rattrapage-print * { visibility: visible !important; }
      #rattrapage-print { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; }
    }`;
    document.head.appendChild(style);
    window.addEventListener('afterprint', () => {
      document.head.removeChild(style);
      document.title = "Junia'lytics";
    }, { once: true });
    window.print();
  };

  const assessmentsBySubject = classData?.assessments.reduce((acc, a) => {
    if (!acc[a.subjectName]) acc[a.subjectName] = [];
    acc[a.subjectName].push(a);
    return acc;
  }, {} as Record<string, AssessmentInfo[]>) ?? {};

  // Uniquement les étudiants en échec (sous le seuil), triés du plus faible au moins faible
  const failingRows = (classData?.students ?? [])
    .map(student => {
      const currentAvg = computeWeightedAverage(student.grades);
      const existingGrade = selectedAssessment
        ? student.grades.find(g => g.assessmentId === selectedAssessment.assessmentId)
        : null;
      const rattrapageInput = rattrapageNotes[student.studentId];
      const rattrapageValue = rattrapageInput !== undefined && rattrapageInput !== ''
        ? parseFloat(rattrapageInput)
        : null;
      const simulatedAvg =
        rattrapageValue !== null && !isNaN(rattrapageValue) && selectedAssessment
          ? computeSimulatedAverage(student.grades, selectedAssessment, rattrapageValue)
          : null;
      return {
        ...student,
        currentAvg,
        existingGradeRaw: existingGrade ? existingGrade.value : null,
        existingGradeMax: existingGrade ? existingGrade.maxGrade : null,
        simulatedAvg,
        isInEchec: currentAvg !== null && currentAvg < threshold,
      };
    })
    .filter(r => r.isInEchec)
    .sort((a, b) => (a.currentAvg ?? 20) - (b.currentAvg ?? 20));

  const echeccCount = failingRows.length;
  const admisAfterRattrapage = failingRows.filter(r => r.simulatedAvg !== null && r.simulatedAvg >= threshold).length;

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
          <h1 className="text-xl font-semibold text-[#1E2E24]">Simulation de rattrapages</h1>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <button onClick={() => { setShowNotifs(!showNotifs); setShowProfileMenu(false); }} className="w-9 h-9 flex items-center justify-center relative bg-transparent border-none cursor-pointer text-[#53665A] hover:text-[#0F5E3D] transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
              {showNotifs && (
                <div className="absolute top-[140%] right-0 w-72 bg-white border border-stone-200/80 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E2EAE5] bg-[#F4F7F5]">
                    <h3 className="text-sm font-semibold text-[#1E2E24]">Notifications</h3>
                  </div>
                  <ul className="list-none p-0 m-0">
                    <li className="px-4 py-3 text-sm text-[#53665A]">
                      <strong className="text-[#1E2E24]">Info</strong> : Simulation non-destructive — aucune note n'est modifiée.
                    </li>
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

        <main className="flex-1 overflow-y-auto bg-[#F4F7F5] p-10 space-y-6">

          {/* Étape 1 — Seuil d'échec (toujours visible en premier) */}
          <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6">
            <h2 className="text-sm font-semibold text-[#718579] uppercase tracking-wide mb-1">Étape 1 — Seuil d'échec</h2>
            <p className="text-xs text-[#718579] mb-4">Les étudiants dont la moyenne générale est inférieure à ce seuil seront considérés comme en échec.</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={threshold}
                onChange={e => { setThreshold(parseFloat(e.target.value) || 10); setRattrapageNotes({}); }}
                className="w-24 px-3 py-2 border border-[#E2EAE5] rounded-lg text-lg font-bold text-[#1E2E24] focus:outline-none focus:border-[#10B981] text-center"
              />
              <span className="text-base text-[#718579] font-medium">/ 20</span>
              {classData && (
                <span className="ml-2 text-sm text-[#718579]">
                  → <span className="font-semibold text-red-500">{echeccCount}</span> étudiant(s) en échec sur {classData.students.length}
                </span>
              )}
            </div>
          </div>

          {/* Étape 2 — Sélectionner une promotion */}
          <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6">
            <h2 className="text-sm font-semibold text-[#718579] uppercase tracking-wide mb-3">Étape 2 — Sélectionner une promotion</h2>
            <div className="flex flex-wrap gap-3">
              {classes.map(cls => (
                <button
                  key={cls.classId}
                  onClick={() => handleClassSelect(cls.classId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
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

          {isLoadingClass && (
            <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-10 text-center text-[#718579]">
              Chargement des données...
            </div>
          )}

          {/* Étape 3 — Sélectionner l'évaluation (visible dès que la promotion est chargée) */}
          {!isLoadingClass && classData && (
            <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6">
              <h2 className="text-sm font-semibold text-[#718579] uppercase tracking-wide mb-4">Étape 3 — Sélectionner l'évaluation à rattraper</h2>
              {Object.keys(assessmentsBySubject).length === 0 ? (
                <p className="text-sm text-[#718579]">Aucune évaluation trouvée pour cette promotion.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(assessmentsBySubject).map(([subjectName, assessments]) => (
                    <div key={subjectName}>
                      <p className="text-xs font-semibold text-[#718579] uppercase tracking-wide mb-2">{subjectName}</p>
                      <div className="flex flex-wrap gap-2">
                        {assessments.map(a => (
                          <button
                            key={a.assessmentId}
                            onClick={() => handleAssessmentSelect(a)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              selectedAssessment?.assessmentId === a.assessmentId
                                ? 'bg-[#0F5E3D] text-white border-[#0F5E3D]'
                                : 'bg-white text-[#1E2E24] border-[#E2EAE5] hover:border-[#10B981] hover:text-[#0F5E3D]'
                            }`}
                          >
                            {a.label} <span className="opacity-60">/{a.maxGrade}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Étape 4 — Tableau de simulation (uniquement les étudiants en échec) */}
          {!isLoadingClass && classData && selectedAssessment && (
            <div>
              <div id="rattrapage-print" className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6">
                {/* En-tête du tableau */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-base font-semibold text-[#1E2E24]">
                      {selectedAssessment.subjectName} — {selectedAssessment.label}
                    </h2>
                    <p className="text-xs text-[#718579] mt-0.5">
                      Noté sur {selectedAssessment.maxGrade} · Coefficient {selectedAssessment.weight} · La meilleure note est retenue
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {admisAfterRattrapage > 0 && (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        {admisAfterRattrapage} admis après rattrapage
                      </span>
                    )}
                    {Object.values(rattrapageNotes).some(v => v !== '') && (
                      <button
                        onClick={() => setRattrapageNotes({})}
                        className="px-3 py-1.5 text-xs font-medium text-[#718579] border border-[#E2EAE5] rounded-lg hover:bg-[#F4F7F5] transition-colors cursor-pointer"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>

                {failingRows.length === 0 ? (
                  <div className="py-10 text-center text-[#718579]">
                    <p className="font-medium">Aucun étudiant en échec avec ce seuil ({threshold}/20).</p>
                    <p className="text-xs mt-1">Modifiez le seuil à l'étape 1 pour en voir apparaître.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E2EAE5]">
                          <th className="text-left py-2 pr-4 text-xs font-semibold text-[#718579] uppercase tracking-wide">Étudiant</th>
                          <th className="text-center py-2 px-4 text-xs font-semibold text-[#718579] uppercase tracking-wide">Moy. actuelle</th>
                          <th className="text-center py-2 px-4 text-xs font-semibold text-[#718579] uppercase tracking-wide">Note actuelle</th>
                          <th className="text-center py-2 px-4 text-xs font-semibold text-[#718579] uppercase tracking-wide">Note rattrapage</th>
                          <th className="text-center py-2 px-4 text-xs font-semibold text-[#718579] uppercase tracking-wide">Moy. simulée</th>
                          <th className="text-center py-2 pl-4 text-xs font-semibold text-[#718579] uppercase tracking-wide">Résultat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failingRows.map(row => (
                          <tr key={row.studentId} className="border-b border-[#F4F7F5] hover:bg-[#F4F7F5]/60">
                            <td className="py-3 pr-4 font-medium text-[#1E2E24]">
                              {row.surname} {row.firstname}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-red-500">
                                {row.currentAvg !== null ? `${row.currentAvg.toFixed(2)}/20` : '—'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-[#53665A]">
                              {row.existingGradeRaw !== null
                                ? `${row.existingGradeRaw}/${row.existingGradeMax}`
                                : <span className="text-[#A3B8AC]">—</span>
                              }
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={selectedAssessment.maxGrade}
                                  step={0.5}
                                  placeholder="—"
                                  value={rattrapageNotes[row.studentId] ?? ''}
                                  onChange={e => setRattrapageNotes(prev => ({ ...prev, [row.studentId]: e.target.value }))}
                                  className="w-16 px-2 py-1 border border-[#E2EAE5] rounded text-sm text-center focus:outline-none focus:border-[#10B981]"
                                />
                                <span className="text-xs text-[#718579]">/{selectedAssessment.maxGrade}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {row.simulatedAvg !== null ? (
                                <span className={`font-semibold ${row.simulatedAvg >= threshold ? 'text-[#0F5E3D]' : 'text-red-500'}`}>
                                  {row.simulatedAvg.toFixed(2)}/20
                                </span>
                              ) : (
                                <span className="text-[#A3B8AC]">—</span>
                              )}
                            </td>
                            <td className="py-3 pl-4 text-center">
                              {row.simulatedAvg !== null ? (
                                row.simulatedAvg >= threshold ? (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                    Admis
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                    Échec
                                  </span>
                                )
                              ) : (
                                <span className="text-[#A3B8AC]">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={exportPdf}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5E3D] hover:bg-[#10B981] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Exporter la simulation en PDF
                </button>
              </div>
            </div>
          )}

          {!isLoadingClass && !classData && selectedClassId === null && (
            <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-12 text-center text-[#718579]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A3B8AC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <p className="font-medium">Définissez le seuil puis sélectionnez une promotion</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
