/**
 * app/components/StudentSearchContent.tsx
 * 
 * Composant de recherche et consultation des fiches étudiants - Réutilisable
 * 
 * Rôle:
 * - Interface complète de recherche d'étudiants avec détails et notes
 * - Adapte la sidebar et la navigation selon le rôle (teacher ou responsable)
 * - Gère l'état de la sidebar (collapse), notifications et profil utilisateur
 * - Affiche les matières et notes de l'étudiant sélectionné
 * 
 * Fonctionnement:
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
import { searchStudents, getStudentDetail } from "@/app/actions";
import { LogoutButton } from "@/app/components/LogoutButton";

type UserRole = 'teacher' | 'responsable';

interface StudentSearchContentProps {
  role: UserRole;
}

export function StudentSearchContent({ role }: StudentSearchContentProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    const results = await searchStudents(query);
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleSelectStudent = async (studentId: bigint) => {
    setIsLoading(true);
    const studentDetail = await getStudentDetail(studentId);
    setSelectedStudent(studentDetail);
    setIsLoading(false);
  };

  return (
      <div className="flex-1 flex flex-col">

        {/* contenu principal */}
        <main className="flex-1 overflow-y-auto bg-[#F4F7F5]">
          <div className="p-10">

            {/* Barre de recherche */}
            <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6 mb-8">
              <input
                type="text"
                placeholder="Rechercher un étudiant par nom ou prénom..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-[#1E2E24] placeholder-[#718579]"
              />
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* Colonne gauche : résultats de recherche */}
              <div className="col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#EAEFEA] bg-[#F4F7F5]">
                    <h3 className="text-sm font-semibold text-[#1E2E24]">
                      Résultats ({searchResults.length})
                    </h3>
                  </div>

                  {isLoading ? (
                    <div className="p-6 text-center text-[#718579]">
                      <p>Chargement...</p>
                    </div>
                  ) : searchResults.length === 0 && searchQuery.trim().length > 0 ? (
                    <div className="p-6 text-center text-[#718579]">
                      <p>Aucun étudiant trouvé pour "{searchQuery}"</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center text-[#718579]">
                      <p>Commencez à taper pour chercher un étudiant</p>
                    </div>
                  ) : (
                    <ul className="list-none p-0 m-0 max-h-96 overflow-y-auto">
                      {searchResults.map((student) => (
                        <li
                          key={student.studentId}
                          onClick={() => handleSelectStudent(student.studentId)}
                          className={`px-6 py-3 border-b border-[#EAEFEA] cursor-pointer transition-colors hover:bg-[#10B981]/10 ${
                            selectedStudent?.studentId === student.studentId
                              ? 'bg-[#10B981]/20 border-l-4 border-[#10B981]'
                              : ''
                          }`}
                        >
                          <p className="font-medium text-[#1E2E24]">
                            {student.surname} {student.firstname}
                          </p>
                          <p className="text-xs text-[#718579] mt-1">
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
                  <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] overflow-hidden">
                    {/* En-tête de la fiche */}
                    <div className="bg-gradient-to-r from-[#10B981] to-[#0F5E3D] text-white px-6 py-8">
                      <h2 className="text-3xl font-bold mb-2">
                        {selectedStudent.surname} {selectedStudent.firstname}
                      </h2>
                      <p className="text-[#10B981]/20 text-sm">
                        ID: {selectedStudent.studentId}
                      </p>
                    </div>

                    {/* Contenu de la fiche */}
                    <div className="p-6">
                      {/* Infos principales */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-[#1E2E24] mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                          </span>
                          Informations Générales
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#F4F7F5] rounded-lg p-4">
                            <p className="text-xs text-[#718579] font-medium">Classe</p>
                            <p className="text-[#1E2E24] font-semibold mt-1">
                              {selectedStudent.class?.label || 'Non attribué'}
                            </p>
                          </div>
                          <div className="bg-[#F4F7F5] rounded-lg p-4">
                            <p className="text-xs text-[#718579] font-medium">Nombre de matières</p>
                            <p className="text-[#1E2E24] font-semibold mt-1">
                              {selectedStudent.subjectAssignments?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Matières suivies */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-[#1E2E24] mb-4 flex items-center gap-2">
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
                              <div key={assignment.subjectId} className="bg-[#F4F7F5] rounded-lg p-3 border border-[#E2EAE5]">
                                <p className="text-[#1E2E24] font-medium text-sm">
                                  {assignment.subject.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[#718579] text-sm">Aucune matière assignée</p>
                        )}
                      </div>

                      {/* Notes et évaluations */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#1E2E24] mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                              <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"></polyline>
                            </svg>
                          </span>
                          Notes et Évaluations
                        </h3>
                        {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {selectedStudent.grades.map((grade: any) => (
                              <div key={`${grade.assessmentId}-${grade.studentId}`} className="bg-[#F4F7F5] rounded-lg p-4 border border-[#E2EAE5]">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-[#1E2E24]">
                                      {grade.assessment.label}
                                    </p>
                                    <p className="text-xs text-[#718579] mt-1">
                                      Matière: {grade.assessment.subject.label}
                                    </p>
                                  </div>
                                  <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    {grade.value}/{grade.assessment.maxGrade}
                                  </span>
                                </div>
                                {grade.feedback && (
                                  <p className="text-xs text-[#53665A] bg-white rounded p-2 mt-2">
                                    {grade.feedback}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[#718579] text-sm">Aucune note enregistrée</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] h-96 flex items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A3B8AC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <p className="text-[#718579] font-medium">Sélectionnez un étudiant pour voir sa fiche complète</p>
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
