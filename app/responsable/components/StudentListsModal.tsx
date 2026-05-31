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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">
            {filterType === 'ALL' ? 'Liste complète des étudiants' : 'Étudiants en situation critique'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold p-1 text-sm bg-gray-200/60 rounded-full h-7 w-7 flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {displayedStudents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun étudiant à afficher.</p>
          ) : (
            displayedStudents.map((student) => (
              <div key={student.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl border-gray-100 bg-gray-50/50">
                <div>
                  <h4 className="font-bold text-gray-900">{student.firstname} {student.surname}</h4>
                  <p className="text-sm text-gray-500">Moyenne générale : <span className="font-bold text-gray-700">{student.globalAverage?.toFixed(2)} / 20</span></p>
                  {student.flags.length > 0 && (
                    <ul className="list-disc pl-5 mt-2 text-xs text-red-500 space-y-0.5">
                      {student.flags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                    </ul>
                  )}
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${student.riskLevel === 'CRITIQUE' ? 'bg-red-100 text-red-700' : student.riskLevel === 'MODERE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{student.riskLevel}</span>
                  <span className="text-xs text-gray-400">Score: {student.riskScore}/100</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl text-sm">Fermer</button>
        </div>

      </div>
    </div>
  );
}