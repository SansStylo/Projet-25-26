/**
 * app/components/responsable/StudentListsModal.tsx
 * * Composant modal d'affichage des listes d'étudiants par niveau de risque
 * * Rôle:
 * - Affiche un modal avec les listes d'étudiants catégorisés par niveau de risque (FAIBLE, MODERE, CRITIQUE)
 * - Permet d'identifier rapidement les étudiants qui ont besoin d'aide
 * - Intégré dans les KpiCards pour une exploration détaillée
 * * Fonctionnement:
 * - Reçoit les profils d'étudiants avec scores et drapeaux de risque
 * - Affiche les étudiants triés par niveau de risque avec couleurs visuelles
 * - Chaque étudiant affiche sa moyenne globale et son score de risque
 */

'use client';

interface StudentProfile {
  studentId: string;
  firstname: string;
  surname: string;
  globalAverage: number | null;
  riskScore: number;
  riskLevel: 'FAIBLE' | 'MODERE' | 'CRITIQUE';
  flags: string[];
}

interface StudentListsModalProps {
  students: StudentProfile[];
  isOpen: boolean;
  onClose: () => void;
  filterType: 'ALL' | 'CRITIQUE';
}

export default function StudentListsModal({ students, isOpen, onClose, filterType }: StudentListsModalProps) {
  if (!isOpen) return null;

  const criticalStudents = students.filter(s => s.riskLevel === 'CRITIQUE');
  const displayedStudents = filterType === 'ALL' ? students : criticalStudents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0B1511] rounded-2xl shadow-xl border border-gray-100 dark:border-emerald-900/30 w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden transition-colors">
        
        <div className="px-6 py-4 border-b border-gray-100 dark:border-emerald-900/30 flex items-center justify-between bg-gray-50 dark:bg-[#0E1B16]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-emerald-50">
            {filterType === 'ALL' ? 'Liste complète des étudiants' : 'Étudiants en situation critique'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 dark:text-emerald-200/50 hover:text-gray-600 dark:hover:text-emerald-200 font-bold p-1 text-sm bg-gray-200/60 dark:bg-emerald-900/40 rounded-full h-7 w-7 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {displayedStudents.length === 0 ? (
            <p className="text-gray-500 dark:text-emerald-200/60 text-center py-4">Aucun étudiant à afficher.</p>
          ) : (
            displayedStudents.map((student) => (
              <div key={student.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl border-gray-100 dark:border-emerald-900/30 bg-gray-50/50 dark:bg-emerald-900/10">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-emerald-50">{student.firstname} {student.surname}</h4>
                  <p className="text-sm text-gray-500 dark:text-emerald-200/60">
                    Moyenne générale : <span className="font-bold text-gray-700 dark:text-emerald-100">{student.globalAverage?.toFixed(2)} / 20</span>
                  </p>
                  {student.flags.length > 0 && (
                    <ul className="list-disc pl-5 mt-2 text-xs text-red-500 dark:text-red-400 space-y-0.5">
                      {student.flags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                    </ul>
                  )}
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    student.riskLevel === 'CRITIQUE' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' 
                      : student.riskLevel === 'MODERE' 
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' 
                      : 'bg-green-100 text-green-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}>
                    {student.riskLevel}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-emerald-200/50">Score: {student.riskScore}/100</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-emerald-900/30 flex justify-end bg-gray-50 dark:bg-[#0E1B16]">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 dark:bg-emerald-900/50 hover:bg-gray-300 dark:hover:bg-emerald-900 text-gray-700 dark:text-emerald-100 font-medium rounded-xl text-sm transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}