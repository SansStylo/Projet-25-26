/**
 * app/components/StudentSearchContent.tsx
 * * Composant de recherche et consultation des fiches étudiants - Réutilisable
 * * Rôle:
 * - Interface complète de recherche d'étudiants avec détails et notes
 * - Adapte la sidebar et la navigation selon le rôle (teacher ou responsable)
 * - Gère l'état de la sidebar (collapse), notifications et profil utilisateur
 * - Affiche les matières et notes de l'étudiant sélectionné
 * * Fonctionnement:
 * - Reçoit un prop 'role' pour adapter l'UI et les liens de navigation
 * - Recherche en temps réel via searchStudents() de app/actions.ts
 * - Charge les détails complets d'un étudiant via getStudentDetail()
 * - Génère dynamiquement les items de navigation selon le rôle
 * - Affiche les grades, matières et évaluations de l'étudiant
 */

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { searchStudents, searchStudentsForTeacher, getStudentDetail } from "@/app/actions";
import { LogoutButton } from "@/app/components/LogoutButton";

type UserRole = 'teacher' | 'responsable';

interface StudentSearchContentProps {
  role: UserRole;
  teacherIdStr?: string;
}

type RiskLevel = 'FAIBLE' | 'MODERE' | 'CRITIQUE';

interface RiskProfile {
  riskScore: number;
  riskLevel: RiskLevel;
  flags: string[];
  globalAverage: number | null;
}

// Calcule un score de risque pédagogique (0–100) à partir des notes d'un étudiant.
// Trois règles s'additionnent, puis le niveau est déduit du score final.
function computeRiskProfile(student: any): RiskProfile {
  let totalWeightedGrades = 0;
  let totalWeights = 0;
  // Accumule les notes par matière pour détecter les faiblesses ciblées
  const subjectMap: Record<number, { name: string; total: number; weights: number }> = {};
  let lowGradesCount = 0; // notes < 5/20
  const flags: string[] = []; // raisons lisibles affichées dans la fiche

  // Première passe : ramener chaque note sur 20 et l'accumuler
  (student.grades ?? []).forEach((grade: any) => {
    const assessment = grade.assessment;
    const gradeOn20 = (grade.value / assessment.maxGrade) * 20;

    totalWeightedGrades += gradeOn20 * assessment.weight;
    totalWeights += assessment.weight;

    const sid = assessment.subject.subjectId;
    if (!subjectMap[sid]) subjectMap[sid] = { name: assessment.subject.label, total: 0, weights: 0 };
    subjectMap[sid].total += gradeOn20 * assessment.weight;
    subjectMap[sid].weights += assessment.weight;

    if (gradeOn20 < 5) lowGradesCount++;
  });

  const globalAverage = totalWeights > 0 ? totalWeightedGrades / totalWeights : null;
  let riskScore = 0;

  // Règle A – moyenne générale : principal indicateur de risque (+40 si < 10, +15 si < 12)
  if (globalAverage !== null) {
    if (globalAverage < 10) { riskScore += 40; flags.push(`Moyenne générale critique (${globalAverage.toFixed(2)}/20)`); }
    else if (globalAverage < 12) { riskScore += 15; flags.push(`Moyenne générale fragile (${globalAverage.toFixed(2)}/20)`); }
  }

  // Règle B – matières non validées : +10 points par matière dont la moyenne est < 10
  Object.values(subjectMap).forEach((data) => {
    const avg = data.total / data.weights;
    if (avg < 10) { riskScore += 10; flags.push(`En difficulté en ${data.name} (${avg.toFixed(2)}/20)`); }
  });

  // Règle C – notes catastrophiques : +5 par note < 5/20, plafonné à +20
  if (lowGradesCount > 0) {
    riskScore += Math.min(lowGradesCount * 5, 20);
    flags.push(`${lowGradesCount} note(s) inférieure(s) à 5/20`);
  }

  // Plafonnement entre 0 et 100, puis attribution du niveau
  riskScore = Math.min(Math.max(riskScore, 0), 100);
  const riskLevel: RiskLevel = riskScore >= 60 ? 'CRITIQUE' : riskScore >= 25 ? 'MODERE' : 'FAIBLE';
  return { riskScore, riskLevel, flags, globalAverage };
}

export function StudentSearchContent({ role, teacherIdStr }: StudentSearchContentProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);

  // États pour l'interactivité sidebar/header
  const [isSidebarReduced, setSidebarReduced] = useState(false);
  const [isHovered, setHoverState] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "Système", text: "Mise à jour terminée.", date: "Récent" },
    { id: 2, type: "Rapport", text: "Les notes de B3 sont disponibles.", date: "Récent" }
  ]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const results = role === 'teacher' && teacherIdStr
      ? await searchStudentsForTeacher(query, BigInt(teacherIdStr))
      : await searchStudents(query);
    setSearchResults(results);
    setIsLoading(false);
  };

  const exportStudentPdf = () => {
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const name = `rapport-${selectedStudent.surname}-${selectedStudent.firstname}-${ts}`.replace(/\s+/g, '_');
    document.title = name;
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #student-report-card, #student-report-card * { visibility: visible !important; }
        #student-report-card {
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

  const handleSelectStudent = async (studentId: bigint) => {
    setIsLoading(true);
    const studentDetail = await getStudentDetail(studentId);
    setSelectedStudent(studentDetail);
    if (studentDetail) {
      setRiskProfile(computeRiskProfile(studentDetail));
    } else {
      setRiskProfile(null);
    }
    setIsLoading(false);
  };

  return (
      <div className="flex-1 flex flex-col">

        {/* contenu principal */}
        <main className="flex-1 overflow-y-auto bg-[#F4F7F5] dark:bg-[#050A08] transition-colors duration-300">
          <div className="p-10">

            {/* Barre de recherche */}
            <div className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 p-6 mb-8">
              <input
                type="text"
                placeholder="Rechercher un étudiant par nom ou prénom..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2EAE5] dark:border-emerald-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-[#1E2E24] dark:text-emerald-50 dark:bg-[#0E1B16] placeholder-[#718579] dark:placeholder-emerald-200/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* Colonne gauche : résultats de recherche */}
              <div className="col-span-1">
                <div className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#EAEFEA] dark:border-emerald-900/30 bg-[#F4F7F5] dark:bg-[#0E1B16]">
                    <h3 className="text-sm font-semibold text-[#1E2E24] dark:text-emerald-50">
                      Résultats ({searchResults.length})
                    </h3>
                  </div>

                  {isLoading ? (
                    <div className="p-6 text-center text-[#718579] dark:text-emerald-200/60">
                      <p>Chargement...</p>
                    </div>
                  ) : searchResults.length === 0 && searchQuery.trim().length > 0 ? (
                    <div className="p-6 text-center text-[#718579] dark:text-emerald-200/60">
                      <p>Aucun étudiant trouvé pour "{searchQuery}"</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center text-[#718579] dark:text-emerald-200/60">
                      <p>Commencez à taper pour chercher un étudiant</p>
                    </div>
                  ) : (
                    <ul className="list-none p-0 m-0 max-h-96 overflow-y-auto">
                      {searchResults.map((student) => (
                        <li
                          key={student.studentId}
                          onClick={() => handleSelectStudent(student.studentId)}
                          className={`px-6 py-3 border-b border-[#EAEFEA] dark:border-emerald-900/20 cursor-pointer transition-colors hover:bg-[#10B981]/10 dark:hover:bg-emerald-900/20 ${
                            selectedStudent?.studentId === student.studentId
                              ? 'bg-[#10B981]/20 border-l-4 border-[#10B981] dark:bg-emerald-900/40'
                              : ''
                          }`}
                        >
                          <p className="font-medium text-[#1E2E24] dark:text-emerald-50">
                            {student.surname} {student.firstname}
                          </p>
                          <p className="text-xs text-[#718579] dark:text-emerald-200/60 mt-1">
                            {student.class?.label || 'Aucune classe'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Colonne droite : fiche détaillée */}
              <div className="col-span-2">
                {selectedStudent ? (
                  <div>
                  <div id="student-report-card" className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 overflow-hidden">
                    {/* En-tête de la fiche */}
                    <div className="bg-gradient-to-r from-[#10B981] to-[#0F5E3D] text-white px-6 py-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-3xl font-bold mb-2">
                            {selectedStudent.surname} {selectedStudent.firstname}
                          </h2>
                          <p className="text-[#10B981]/20 text-sm">
                            ID: {selectedStudent.studentId}
                          </p>
                        </div>
                        {riskProfile && (
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              riskProfile.riskLevel === 'CRITIQUE' ? 'bg-red-500 text-white' :
                              riskProfile.riskLevel === 'MODERE' ? 'bg-orange-400 text-white' :
                              'bg-emerald-400 text-white'
                            }`}>
                              {riskProfile.riskLevel === 'CRITIQUE' ? 'Risque critique' :
                               riskProfile.riskLevel === 'MODERE' ? 'Risque modéré' : 'Risque faible'}
                            </span>
                            <span className="text-white/70 text-xs">Score : {riskProfile.riskScore}/100</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contenu de la fiche */}
                    <div className="p-6">
                      {/* Infos principales */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-[#1E2E24] dark:text-emerald-50 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                          </span>
                          Informations Générales
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#F4F7F5] dark:bg-emerald-900/10 rounded-lg p-4">
                            <p className="text-xs text-[#718579] dark:text-emerald-200/60 font-medium">Classe</p>
                            <p className="text-[#1E2E24] dark:text-emerald-50 font-semibold mt-1">
                              {selectedStudent.class?.label || 'Non attribué'}
                            </p>
                          </div>
                          <div className="bg-[#F4F7F5] dark:bg-emerald-900/10 rounded-lg p-4">
                            <p className="text-xs text-[#718579] dark:text-emerald-200/60 font-medium">Nombre de matières</p>
                            <p className="text-[#1E2E24] dark:text-emerald-50 font-semibold mt-1">
                              {selectedStudent.subjectAssignments?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Score de risque */}
                      {riskProfile && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-[#1E2E24] dark:text-emerald-50 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                              </svg>
                            </span>
                            Analyse de risque
                          </h3>
                          <div className="bg-[#F4F7F5] dark:bg-emerald-900/10 rounded-lg p-4 border border-[#E2EAE5] dark:border-emerald-900/30">
                            {/* Barre de progression */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-xs text-[#718579] dark:text-emerald-200/60 font-medium w-20 shrink-0">Score risque</span>
                              <div className="flex-1 bg-[#E2EAE5] dark:bg-emerald-900/30 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all ${
                                    riskProfile.riskLevel === 'CRITIQUE' ? 'bg-red-500' :
                                    riskProfile.riskLevel === 'MODERE' ? 'bg-orange-400' : 'bg-emerald-400'
                                  }`}
                                  style={{ width: `${riskProfile.riskScore}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-[#1E2E24] dark:text-emerald-50 w-12 text-right shrink-0">
                                {riskProfile.riskScore}/100
                              </span>
                            </div>
                            {/* Moyenne générale */}
                            {riskProfile.globalAverage !== null && (
                              <p className="text-xs text-[#718579] dark:text-emerald-200/60 mb-3">
                                Moyenne générale pondérée : <span className="font-semibold text-[#1E2E24] dark:text-emerald-50">{riskProfile.globalAverage.toFixed(2)}/20</span>
                              </p>
                            )}
                            {/* Flags */}
                            {riskProfile.flags.length > 0 ? (
                              <ul className="list-none p-0 m-0 space-y-1">
                                {riskProfile.flags.map((flag, i) => (
                                  <li key={i} className="flex items-center gap-2 text-xs text-[#53665A] dark:text-emerald-200/70">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      riskProfile.riskLevel === 'CRITIQUE' ? 'bg-red-500' :
                                      riskProfile.riskLevel === 'MODERE' ? 'bg-orange-400' : 'bg-emerald-400'
                                    }`} />
                                    {flag}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Aucun signal d'alerte détecté.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Matières suivies */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-[#1E2E24] dark:text-emerald-50 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                          </span>
                          Matières suivies
                        </h3>
                        {selectedStudent.subjectAssignments && selectedStudent.subjectAssignments.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {selectedStudent.subjectAssignments.map((assignment: any) => (
                              <div key={assignment.subjectId} className="bg-[#F4F7F5] dark:bg-emerald-900/10 rounded-lg p-3 border border-[#E2EAE5] dark:border-emerald-900/30">
                                <p className="text-[#1E2E24] dark:text-emerald-100 font-medium text-sm">
                                  {assignment.subject.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[#718579] dark:text-emerald-200/60 text-sm">Aucune matière assignée</p>
                        )}
                      </div>

                      {/* Notes et évaluations */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#1E2E24] dark:text-emerald-50 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                              <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"></polyline>
                            </svg>
                          </span>
                          Notes et Évaluations
                        </h3>
                        {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                          <div className="space-y-3">
                            {selectedStudent.grades.map((grade: any) => (
                              <div key={`${grade.assessmentId}-${grade.studentId}`} className="bg-[#F4F7F5] dark:bg-emerald-900/10 rounded-lg p-4 border border-[#E2EAE5] dark:border-emerald-900/30">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-[#1E2E24] dark:text-emerald-50">
                                      {grade.assessment.label}
                                    </p>
                                    <p className="text-xs text-[#718579] dark:text-emerald-200/60 mt-1">
                                      Matière: {grade.assessment.subject.label}
                                    </p>
                                  </div>
                                  <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    {grade.value}/{grade.assessment.maxGrade}
                                  </span>
                                </div>
                                {grade.feedback && (
                                  <p className="text-xs text-[#53665A] dark:text-emerald-200/70 bg-white dark:bg-[#0E1B16] rounded p-2 mt-2">
                                    {grade.feedback}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[#718579] dark:text-emerald-200/60 text-sm">Aucune note enregistrée</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Bouton export PDF */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={exportStudentPdf}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0F5E3D] dark:bg-emerald-700 hover:bg-[#10B981] dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Exporter en PDF
                    </button>
                  </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A3B8AC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <p className="text-[#718579] dark:text-emerald-200/60 font-medium">Sélectionnez un étudiant pour voir sa fiche complète</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}