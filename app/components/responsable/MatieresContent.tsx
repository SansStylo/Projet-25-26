/**
 * app/components/responsable/MatieresContent.tsx
 * * Composant d'affichage des matières - Responsables
 * * Rôle:
 * - Affiche la liste des matières avec leurs statistiques de performance
 * - Permet de voir les moyennes par matière et identifier les difficultés
 * - Sidebar et header pour responsables avec navigation appropriée
 * * Fonctionnement:
 * - Récupère les statistiques des matières via les props
 * - Affiche un graphique en barres des moyennes par matière (colorié par performance)
 * - Permet de cliquer sur une matière pour voir les étudiants détaillés
 */

"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
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
  teacherId?: string;
}

export default function MatieresContent({ matieresStats, teacherId }: MatieresContentProps) {
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
        <main className="p-10 flex-1 overflow-auto bg-[#F4F7F5] dark:bg-[#050A08] transition-colors duration-300"> 
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1E2E24] dark:text-emerald-50 mb-4">
              Analyse par Matière
            </h2>
            <p className="text-[#53665A] dark:text-emerald-200/60 text-sm mb-6">
              {matieresStats.length} matière(s) disponible(s)
            </p>

            {/* Filtre */}
            <div className="bg-white dark:bg-[#0B1511] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] dark:border-emerald-900/30 p-6 mb-8 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1E2E24] dark:text-emerald-50">Filtrer les matières</h3>
                <button
                  onClick={toggleAllSubjects}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F4F7F5] dark:bg-emerald-900/20 text-[#0F5E3D] dark:text-emerald-300 hover:bg-[#E2EAE5] dark:hover:bg-emerald-900/40 transition-colors"
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
                      className="w-4 h-4 rounded border-[#E2EAE5] dark:border-emerald-800 text-[#0F5E3D] dark:checked:bg-emerald-600 cursor-pointer"
                    />
                    <span className="text-sm text-[#1E2E24] dark:text-emerald-100 font-medium truncate">
                      {matiere.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grille des matières */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatieres.map((matiere) => (
                <div key={matiere.subjectId} className="bg-white dark:bg-[#0B1511] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] dark:border-emerald-900/30 overflow-hidden hover:shadow-[0_10px_40px_rgba(18,38,30,0.05)] transition-shadow">
                  <div className="bg-[#F4F7F5] dark:bg-[#0E1B16] px-6 py-4 border-b border-[#E2EAE5] dark:border-emerald-900/30">
                    <h3 className="font-bold text-[#1E2E24] dark:text-emerald-50 text-lg mb-2">{matiere.name}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#53665A] dark:text-emerald-200/60">
                        <strong>{matiere.totalGrades}</strong> notes
                      </span>
                      <span className="text-[#0F5E3D] dark:text-emerald-400 font-semibold">
                        {matiere.classCount} groupe(s)
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-28 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: 'Stats',
                              min: matiere.minGrade,
                              average: matiere.average,
                              max: matiere.maxGrade,
                            }
                          ]}
                          margin={{ top: 15, right: 5, left: -30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAE5" />
                          <XAxis dataKey="name" hide tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 20]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            content={() => null} 
                            cursor={false}
                          />
                          <Bar dataKey="min" name="Min" fill="#F97316" radius={[3, 3, 0, 0]}>
                            <LabelList dataKey="min" position="top" fontSize={10} fontWeight="bold" fill="#C2410C" formatter={(v: any) => Number(v).toFixed(1)} />
                          </Bar>
                          <Bar dataKey="average" name="Moyenne" fill="#0F5E3D" radius={[3, 3, 0, 0]}>
                            <LabelList dataKey="average" position="top" fontSize={10} fontWeight="bold" fill="#0F5E3D" formatter={(v: any) => Number(v).toFixed(1)} />
                          </Bar>
                          <Bar dataKey="max" name="Max" fill="#3B82F6" radius={[3, 3, 0, 0]}>
                            <LabelList dataKey="max" position="top" fontSize={10} fontWeight="bold" fill="#1D4ED8" formatter={(v: any) => Number(v).toFixed(1)} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubjectForStudents(matiere.subjectId);
                        setShowStudentModal(true);
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-[#0F5E3D] dark:bg-emerald-700 text-white font-semibold text-sm hover:bg-[#0A4A31] dark:hover:bg-emerald-600 transition-colors"
                    >Voir les étudiants
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMatieres.length === 0 && (
              <div className="bg-[#F4F7F5] dark:bg-emerald-900/10 text-[#53665A] dark:text-emerald-200/60 p-8 rounded-xl text-center">
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
          teacherId={teacherId}
        />
      )}
    </>
  );
}

interface StudentsModalProps {
  subjectId: number;
  onClose: () => void;
  subjectName: string;
  teacherId?: string;
}

// Composant Modal pour afficher les étudiants
function StudentsModal({ subjectId, onClose, subjectName, teacherId }: StudentsModalProps) {
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc' | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        let data;
        if (teacherId) {
          // Si prof, on utilise la version prof
          const { getTeacherStudentsBySubject } = await import('@/app/actions');
          data = await getTeacherStudentsBySubject(subjectId, BigInt(teacherId));
        } else {
          // Sinon, respo
          data = await getStudentsBySubject(subjectId);
        }
        setStudents(data);
      } catch (err) {
        console.error('Erreur chargement étudiants:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subjectId, teacherId]);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0B1511] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-[#F4F7F5] dark:bg-[#0E1B16] px-6 py-4 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center gap-3">
          <h2 className="font-bold text-[#1E2E24] dark:text-emerald-50 text-lg truncate">Étudiants — <span className="text-[#0F5E3D] dark:text-emerald-400">{subjectName}</span></h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={cycleSortOrder}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                sortOrder
                  ? 'bg-[#0F5E3D] dark:bg-emerald-700 text-white border-[#0F5E3D]'
                  : 'bg-white dark:bg-[#0B1511] text-[#53665A] dark:text-emerald-200 border-[#E2EAE5] dark:border-emerald-800 hover:border-[#0F5E3D]'
              }`}
            >
              {sortLabel}
            </button>
            <button onClick={onClose} className="text-[#53665A] dark:text-emerald-200 hover:text-[#1E2E24] dark:hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-[#53665A] dark:text-emerald-200/50">Chargement...</p>
          ) : sortedStudents.length > 0 ? (
            <div className="space-y-2">
              {sortedStudents.map((student, idx) => (
                <div key={idx} className="p-3 bg-[#F4F7F5] dark:bg-emerald-900/20 rounded-lg flex justify-between items-center border border-transparent dark:border-emerald-900/10">
                  <span className="font-medium text-[#1E2E24] dark:text-emerald-50">{student.surname} {student.firstname}</span>
                  {student.grade != null && (
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      student.grade >= 10 
                        ? 'text-[#0F5E3D] bg-green-50 dark:text-emerald-300 dark:bg-emerald-900/40' 
                        : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                    }`}>
                      {student.grade.toFixed(2)}/20
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#53665A] dark:text-emerald-200/50">Aucun étudiant trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
}