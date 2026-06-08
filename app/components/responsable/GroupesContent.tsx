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
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(
    new Set(groupsStats.map(g => g.classId))
  );
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState<number | null>(null);

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
    <>
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
                    >Voir les étudiants
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

      {/* Modal pour afficher les étudiants */}
      {showStudentModal && selectedGroupForStudents && (
        <StudentsModal
          classId={selectedGroupForStudents}
          onClose={() => setShowStudentModal(false)}
          groupLabel={groupsStats.find(g => g.classId === selectedGroupForStudents)?.label || ''}
        />
      )}
    </>
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
