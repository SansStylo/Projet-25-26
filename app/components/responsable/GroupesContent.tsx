/**
 * app/components/responsable/GroupesContent.tsx
 * 
 * Composant d'affichage des groupes/classes - Responsables
 * 
 * Rôle:
 * - Affiche la liste des groupes/classes avec leurs statistiques et graphiques
 * - Permet de voir les moyennes, les étudiants et les performances par classe
 * - Sidebar et header pour responsables avec navigation appropriée
 * 
 * Fonctionnement:
 * - Récupère les statistiques des classes via les props
 * - Affiche un graphique en barres des moyennes par classe
 * - Permet de cliquer sur une classe pour voir les étudiants détaillés
 */

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LogoutButton } from "@/app/components/LogoutButton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudentsByClass } from '@/app/actions';

interface GroupStats {
  classId: number;
  label: string;
  studentCount: number;
  globalAverage: number;
  averageBySubject: Array<{
    subjectId: number;
    subjectName: string;
    average: number;
  }>;
}

interface GroupesContentProps {
  groupsStats: GroupStats[];
}

export default function GroupesContent({ groupsStats }: GroupesContentProps) {
  const [isSidebarReduced, setSidebarReduced] = useState(false);
  const [isHovered, setHoverState] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(
    new Set(groupsStats.map(g => g.classId))
  );
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState<number | null>(null);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "Groupes", text: "Analyse des groupes disponible.", date: "Récent" },
    { id: 2, type: "Alerte", text: "Mises à jour automatiques toutes les heures.", date: "Récent" }
  ]);

  const filteredGroups = useMemo(() => {
    return groupsStats.filter(g => selectedGroups.has(g.classId));
  }, [groupsStats, selectedGroups]);

  const toggleGroup = (classId: number) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(classId)) {
      newSelected.delete(classId);
    } else {
      newSelected.add(classId);
    }
    setSelectedGroups(newSelected);
  };

  const toggleAllGroups = () => {
    if (selectedGroups.size === groupsStats.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(groupsStats.map(g => g.classId)));
    }
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
          {[
            { name: 'Groupes', href: '/responsable', active: true, icon: (
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
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
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
          <h1 className="text-xl font-semibold text-[#1E2E24]">Analyse des Groupes</h1>
          
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
                  <span className="text-xs text-[#718579] font-medium leading-none mb-1">Responsable</span>
                  <span className="text-sm text-[#1E2E24] font-semibold leading-none">Pédagogique</span>
                </div>
                <div className="w-[38px] h-[38px] relative shrink-0">
                  <div className="w-full h-full rounded-full bg-[#0F5E3D] text-white flex items-center justify-center text-sm font-bold border border-[#E2EAE5]">
                    RP
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

        {/* Conteneur principal */}
        <main className="p-10 flex-1 overflow-auto">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1E2E24] mb-4">
              Analyse par Groupe
            </h2>
            <p className="text-[#53665A] text-sm mb-6">
              {groupsStats.length} groupe(s) disponible(s)
            </p>

            {/* Filtre */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1E2E24]">Filtrer les groupes</h3>
                <button
                  onClick={toggleAllGroups}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F4F7F5] text-[#0F5E3D] hover:bg-[#E2EAE5] transition-colors"
                >
                  {selectedGroups.size === groupsStats.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {groupsStats.map((group) => (
                  <label key={group.classId} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGroups.has(group.classId)}
                      onChange={() => toggleGroup(group.classId)}
                      className="w-4 h-4 rounded border-[#E2EAE5] text-[#0F5E3D] cursor-pointer"
                    />
                    <span className="text-sm text-[#1E2E24] font-medium truncate">
                      {group.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grille des groupes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div key={group.classId} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] overflow-hidden hover:shadow-[0_10px_40px_rgba(18,38,30,0.05)] transition-shadow">
                  <div className="bg-[#F4F7F5] px-6 py-4 border-b border-[#E2EAE5]">
                    <h3 className="font-bold text-[#1E2E24] text-lg mb-2">{group.label}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#53665A]">
                        <strong>{group.studentCount}</strong> étudiants
                      </span>
                      <span className="text-[#0F5E3D] font-semibold">
                        Moy: <strong>{group.globalAverage.toFixed(2)}</strong>/20
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-xs font-bold text-[#1E2E24] uppercase mb-2">Moyennes par matière</h4>
                    <div className="h-32 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={group.averageBySubject} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAE5" />
                          <XAxis dataKey="subjectName" tick={false} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 20]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(2)}/20`, 'Moyenne']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          />
                          <Bar dataKey="average" fill="#0F5E3D" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedGroupForStudents(group.classId);
                        setShowStudentModal(true);
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-[#0F5E3D] text-white font-semibold text-sm hover:bg-[#0A4A31] transition-colors"
                    >
                      👥 Voir les étudiants
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <div className="bg-[#F4F7F5] text-[#53665A] p-8 rounded-xl text-center">
                <p className="font-medium">Aucun groupe sélectionné</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal pour afficher les étudiants */}
      {showStudentModal && selectedGroupForStudents && (
        <StudentsModal
          classId={selectedGroupForStudents}
          onClose={() => setShowStudentModal(false)}
          groupLabel={groupsStats.find(g => g.classId === selectedGroupForStudents)?.label || ''}
        />
      )}
    </div>
  );
}

// Composant Modal pour afficher les étudiants
function StudentsModal({ classId, onClose, groupLabel }: { classId: number; onClose: () => void; groupLabel: string }) {
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc' | null>(null);

  React.useEffect(() => {
    getStudentsByClass(classId)
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement étudiants:', err);
        setLoading(false);
      });
  }, [classId]);

  const sortedStudents = React.useMemo(() => {
    if (!sortOrder) return students;
    return [...students].sort((a, b) => {
      const aVal = a.globalAverage ?? -1;
      const bVal = b.globalAverage ?? -1;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [students, sortOrder]);

  const cycleSortOrder = () => {
    setSortOrder(prev => prev === null ? 'desc' : prev === 'desc' ? 'asc' : null);
  };

  const sortLabel = sortOrder === 'desc' ? '↓ Note' : sortOrder === 'asc' ? '↑ Note' : 'Trier';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-[#F4F7F5] px-6 py-4 border-b border-[#E2EAE5] flex justify-between items-center gap-3">
          <h2 className="font-bold text-[#1E2E24] text-lg truncate">Étudiants — <span className="text-[#0F5E3D]">{groupLabel}</span></h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={cycleSortOrder}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                sortOrder
                  ? 'bg-[#0F5E3D] text-white border-[#0F5E3D]'
                  : 'bg-white text-[#53665A] border-[#E2EAE5] hover:border-[#0F5E3D] hover:text-[#0F5E3D]'
              }`}
            >
              {sortLabel}
            </button>
            <button onClick={onClose} className="text-[#53665A] hover:text-[#1E2E24] text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-[#53665A]">Chargement...</p>
          ) : sortedStudents.length > 0 ? (
            <div className="space-y-2">
              {sortedStudents.map((student, idx) => (
                <div key={idx} className="p-3 bg-[#F4F7F5] rounded-lg flex justify-between items-center">
                  <span className="font-medium text-[#1E2E24]">{student.firstname} {student.surname}</span>
                  {student.globalAverage != null && (
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      student.globalAverage >= 10 ? 'text-[#0F5E3D] bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {student.globalAverage.toFixed(2)}/20
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#53665A]">Aucun étudiant trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
}
