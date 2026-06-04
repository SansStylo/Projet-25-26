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
          {(role === 'teacher' ? [
            { name:'Accueil', href: '/dashboard', icon: (
              <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></>
            )},
            { name: 'Étudiants', href: '/dashboard/etudiants', icon: (
              <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>
            )},
            { name: 'Saisie des notes', href: '/dashboard/notes', icon : (
              <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></>
            )},
            {name: 'Rapports', href: '/dashboard/rapports', icon: (
              <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>
            )}
          ] : [
            { name: 'Groupes', href: '/responsable', icon: (
              <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>
            ) },
            { name: 'Matières', href: '/responsable/matieres', icon: (
              <>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </>
            ) },
            { name: 'Étudiants', href: '/responsable/etudiants', icon: (
              <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>
            ) },
            { name: 'Rapports', href: '/responsable/rapports', icon: (
              <>
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </>
            ) }
          ]).map((item, index) => {
            const isActive = item.href === (role === 'teacher' ? '/dashboard' : '/responsable') 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            return (
            <li key={index}>
              <Link href={item.href} className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 hover:text-white ${
                isActive ? 'bg-white/5 text-white! border-[#10B981]!' : ''
              } ${(isSidebarReduced && (!isHovered)) ? 'justify-center px-0! py-4' :''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  {item.icon}
                </svg>
                {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            </li>
            );
          })}
        </ul>

        {/* bas de la sidebar */}
        <div className="mt-auto flex flex-col">
          <Link href="/parametres"
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
          <h1 className="text-xl font-semibold text-[#1E2E24]">
            {role === 'teacher' ? 'Mes Étudiants' : 'Recherche d\'Étudiants'}
          </h1>
          
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
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#F97316] rounded-full border-2 border-white"></span>
                )}
              </button>

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
                  <span className="text-xs text-[#718579] font-medium leading-none mb-1">Enseignant</span>
                  <span className="text-sm text-[#1E2E24] font-semibold leading-none">
                    {role === 'teacher' ? 'Enseignant' : 'Responsable Pédagogique'}
                  </span>
                </div>
                <div className="w-[38px] h-[38px] relative shrink-0">
                  <div className="w-full h-full rounded-full bg-[#0F5E3D] text-white flex items-center justify-center text-sm font-bold border border-[#E2EAE5]">
                    {role === 'teacher' ? 'E' : 'RP'}
                  </div>
                </div>
              </div>
              
              {showProfileMenu && (
                <div className="absolute top-[130%] right-0 bg-white border border-[#E2EAE5] rounded-lg shadow-[0_10px_25px_-5px_rgba(18,38,30,0.05)] w-[180px] z-[1000] overflow-hidden">
                  <ul className="list-none p-0 m-0 divide-y divide-[#EAEFEA]">
                    <LogoutButton />
                    <li>
                      <Link 
                        href="/parametres" 
                        className="flex items-center gap-2.5 px-4 py-3 text-[#3B4B40] hover:bg-[#F4F7F5] font-medium text-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
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
    </div>
  );
}
