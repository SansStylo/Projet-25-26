"use client";

import { useState } from 'react';
import { getRattrapageData } from '@/app/actions';

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

export default function RattrapagesContent({ classes }: { classes: ClassOption[] }) {
  const [threshold, setThreshold] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classData, setClassData] = useState<{ students: StudentData[]; assessments: AssessmentInfo[] } | null>(null);
  const [isLoadingClass, setIsLoadingClass] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentInfo | null>(null);
  const [rattrapageNotes, setRattrapageNotes] = useState<Record<string, string>>({});

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
    <main className="flex-1 overflow-y-auto bg-[#F4F7F5] p-10 space-y-6">

      {/* Étape 1 — Seuil d'échec */}
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

      {/* Étape 3 — Sélectionner l'évaluation */}
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

      {/* Étape 4 — Tableau de simulation */}
      {!isLoadingClass && classData && selectedAssessment && (
        <div>
          <div id="rattrapage-print" className="bg-white rounded-lg shadow-sm border border-[#EAEFEA] p-6">
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
                        <td className="py-3 pr-4 font-medium text-[#1E2E24]">{row.surname} {row.firstname}</td>
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
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Admis</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">Échec</span>
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
  );
}
