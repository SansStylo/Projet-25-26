/**
 * app/components/responsable/MatieresContent.tsx
 * 
 * Composant d'affichage des matières - Responsables
 * 
 * Rôle:
 * - Affiche la liste des matières avec leurs statistiques de performance
 * - Permet de voir les moyennes par matière et identifier les difficultés
 * - Sidebar et header pour responsables avec navigation appropriée
 * 
 * Fonctionnement:
 * - Récupère les statistiques des matières via les props
 * - Affiche un graphique en barres des moyennes par matière (colorié par performance)
 * - Permet de cliquer sur une matière pour voir les étudiants détaillés
 */

"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStudentsBySubject } from '@/app/actions';

interface MatiereStats {
  subjectId: number;
  name: string;
  totalGrades: number;
  average: number;
  minGrade: number;
  maxGrade: number;
  classCount: number;
}

interface MatieresContentProps {
  matieresStats: MatiereStats[];
}

export default function MatieresContent({ matieresStats }: MatieresContentProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<Set<number>>(
    new Set(matieresStats.map(m => m.subjectId))
  );
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedSubjectForStudents, setSelectedSubjectForStudents] = useState<number | null>(null);

  const filteredMatieres = useMemo(() => {
    return matieresStats.filter(m => selectedSubjects.has(m.subjectId));
  }, [matieresStats, selectedSubjects]);

  const toggleSubject = (subjectId: number) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedSubjects(newSelected);
  };

  const toggleAllSubjects = () => {
    if (selectedSubjects.size === matieresStats.length) {
      setSelectedSubjects(new Set());
    } else {
      setSelectedSubjects(new Set(matieresStats.map(m => m.subjectId)));
    }
  };

  return (
      <>
        <main className="p-10 flex-1 overflow-auto"> 
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1E2E24] mb-4">
              Analyse par Matière
            </h2>
            <p className="text-[#53665A] text-sm mb-6">
              {matieresStats.length} matière(s) disponible(s)
            </p>

            {/* Filtre */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1E2E24]">Filtrer les matières</h3>
                <button
                  onClick={toggleAllSubjects}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F4F7F5] text-[#0F5E3D] hover:bg-[#E2EAE5] transition-colors"
                >
                  {selectedSubjects.size === matieresStats.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {matieresStats.map((matiere) => (
                  <label key={matiere.subjectId} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.has(matiere.subjectId)}
                      onChange={() => toggleSubject(matiere.subjectId)}
                      className="w-4 h-4 rounded border-[#E2EAE5] text-[#0F5E3D] cursor-pointer"
                    />
                    <span className="text-sm text-[#1E2E24] font-medium truncate">
                      {matiere.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grille des matières */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatieres.map((matiere) => (
                <div key={matiere.subjectId} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] overflow-hidden hover:shadow-[0_10px_40px_rgba(18,38,30,0.05)] transition-shadow">
                  <div className="bg-[#F4F7F5] px-6 py-4 border-b border-[#E2EAE5]">
                    <h3 className="font-bold text-[#1E2E24] text-lg mb-2">{matiere.name}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#53665A]">
                        <strong>{matiere.totalGrades}</strong> notes
                      </span>
                      <span className="text-[#0F5E3D] font-semibold">
                        {matiere.classCount} groupe(s)
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="h-28 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Min', value: matiere.minGrade },
                            { name: 'Moy.', value: matiere.average },
                            { name: 'Max', value: matiere.maxGrade },
                          ]}
                          margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAE5" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 20]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(2)}/20`]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          />
                          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            <Cell fill="#F97316" />
                            <Cell fill="#0F5E3D" />
                            <Cell fill="#3B82F6" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSubjectForStudents(matiere.subjectId);
                        setShowStudentModal(true);
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-[#0F5E3D] text-white font-semibold text-sm hover:bg-[#0A4A31] transition-colors"
                    >Voir les étudiants
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMatieres.length === 0 && (
              <div className="bg-[#F4F7F5] text-[#53665A] p-8 rounded-xl text-center">
                <p className="font-medium">Aucune matière sélectionnée</p>
              </div>
            )}
          </div>
        </main>

      {/* Modal pour afficher les étudiants */}
      {showStudentModal && selectedSubjectForStudents && (
        <StudentsModal
          subjectId={selectedSubjectForStudents}
          onClose={() => setShowStudentModal(false)}
          subjectName={matieresStats.find(m => m.subjectId === selectedSubjectForStudents)?.name || ''}
        />
      )}
    </>
  );
}

// Composant Modal pour afficher les étudiants
function StudentsModal({ subjectId, onClose, subjectName }: { subjectId: number; onClose: () => void; subjectName: string }) {
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc' | null>(null);

  React.useEffect(() => {
    getStudentsBySubject(subjectId)
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement étudiants:', err);
        setLoading(false);
      });
  }, [subjectId]);

  const sortedStudents = React.useMemo(() => {
    if (!sortOrder) return students;
    return [...students].sort((a, b) => {
      const aVal = a.grade ?? -1;
      const bVal = b.grade ?? -1;
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
          <h2 className="font-bold text-[#1E2E24] text-lg truncate">Étudiants — <span className="text-[#0F5E3D]">{subjectName}</span></h2>
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
                  {student.grade != null && (
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      student.grade >= 10 ? 'text-[#0F5E3D] bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {student.grade.toFixed(2)}/20
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
