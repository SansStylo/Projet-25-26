'use client';

import { useState } from 'react';

interface SubjectType {
  subjectId: number;
  label: string;
}

interface UsersType {
  userId: bigint;
  mail: string;
  firstname: string;
  surname: string;
  level: number;
}

interface BlocDetailsProps {
  currentSubject: SubjectType;
  users : UsersType[];
  students : StudentType[];
  onClose: () => void;    // La fonction pour fermer la vue
}

interface StudentType {
  studentId : bigint;
  classId : string;
  firstname : string;
  surname : string;
}

export default function BlocDetails({ currentSubject, users, students, onClose }: BlocDetailsProps) {
  // 1. État pour afficher ou masquer l'interface d'ajout d'étudiants
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const [availableStudents, setAvailableStudents] = useState<StudentType[]>(students || []);

  const [selectedStudents, setSelectedStudents] = useState<StudentType[]>([])

  const intervenants = users.filter(user => user.level === 0);

  // 3. États pour stocker ce que l'utilisateur tape dans les barres de recherche
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchSelected, setSearchSelected] = useState('');

  // 4. LOGIQUE : Filtrage dynamique des étudiants selon la recherche
  const filteredAvailable = availableStudents.filter(student =>
    student.firstname.toLowerCase().includes(searchAvailable.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredSelected = selectedStudents.filter(student =>
    student.firstname.toLowerCase().includes(searchSelected.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchSelected.toLowerCase())
  );

  // 5. LOGIQUE : Transférer un étudiant de gauche à droite (+)
  const handleAddStudent = (student: StudentType) => {
    setAvailableStudents(availableStudents.filter(s => s.studentId !== student.studentId));
    setSelectedStudents([...selectedStudents, student]);
  };

  // 6. LOGIQUE : Transférer un étudiant de droite à gauche (-)
  const handleRemoveStudent = (student: StudentType) => {
    setSelectedStudents(selectedStudents.filter(s => s.studentId !== student.studentId));
    setAvailableStudents([...availableStudents, student]);
  };

  return (
    <div className="center absolute w-[95%] h-[95%] inset-0 m-auto bg-slate-100 backdrop-blur-sm z-40 p-10 flex flex-col justify-center items-center rounded-xl shadow-2xl border border-slate-300">
      
      {/* Titre Principal */}
      <h2 className="text-3xl font-bold text-slate-900 mb-4 absolute top-[2%] left-[2%]">{currentSubject.label}</h2>
      
      {/* Section Intervenant */}
      <div className="mt-[5%] text-lg font-semibold w-[95%] bg-slate-200 p-4 rounded-lg">
        Intervenant : 
        <div className="mt-2 w-full">
            <select className="p-2 rounded bg-white border border-slate-300 text-sm">
                <option value="">-- Veuillez choisir un intervenant --</option>
                {intervenants.map((prof) => (
                  <option 
                    key={prof.userId.toString()} 
                    value={prof.userId.toString()}
                  >
                    {prof.firstname} {prof.surname}
                  </option>
                ))}
            </select>
        </div>
      </div>

      {/* Section Étudiants */}
      <div className="mt-4 text-lg font-semibold w-[95%] bg-slate-200 p-4 rounded-lg">
        Étudiants inscrits : <span className="text-blue-600 font-bold">{selectedStudents.length}</span>
        <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={() => setShowStudentSelector(true)} 
              className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors shadow"
            >
              Add Student
            </button>
            <button className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors shadow">Add Group</button>
            <button className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors shadow">Add Prom</button>
        </div>
      </div>

      {/* Bouton de fermeture global */}
      <button className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium absolute right-[2%] top-[2%] transition-colors" onClick={onClose}>
        ✕
      </button>


      {/* ========================================================================= */}
      {/* MODAL / OVERLAY : DOUBLE LISTE DE SELECTION (TRANSFER LIST)               */}
      {/* ========================================================================= */}
      {showStudentSelector && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Header du sélecteur */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">Sélection des étudiants pour {currentSubject.label}</h3>
              <button 
                onClick={() => setShowStudentSelector(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Corps de la Transfer List */}
            <div className="p-6 grid grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              
              {/* COLONNE GAUCHE : DISPONIBLES */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700 text-sm">Disponibles ({filteredAvailable.length} restants)</span>
                </div>
                {/* Barre de recherche Gauche */}
                <input 
                  type="text" 
                  placeholder="Filtrer les disponibles (ex: Alice, B1...)" 
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Liste Gauche */}
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[250px]">
                  {filteredAvailable.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2">Aucun étudiant trouvé</p>
                  ) : (
                    filteredAvailable.map(student => (
                      <div key={student.studentId} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm transition-colors">
                        <span className="text-slate-700 font-medium">{student.firstname} <span className="text-xs text-gray-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded ml-1">{student.classId}</span></span>
                        <button 
                          onClick={() => handleAddStudent(student)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded text-xs font-bold transition-all"
                        >
                          [+] Ajouter
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLONNE DROITE : SÉLECTIONNÉS */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700 text-sm">Sélectionnés ({filteredSelected.length})</span>
                </div>
                {/* Barre de recherche Droite */}
                <input 
                  type="text" 
                  placeholder="🔍 Filtrer les sélectionnés..." 
                  value={searchSelected}
                  onChange={(e) => setSearchSelected(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {/* Liste Droite */}
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[250px]">
                  {filteredSelected.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2">Aucun étudiant sélectionné</p>
                  ) : (
                    filteredSelected.map(student => (
                      <div key={student.studentId} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm transition-colors">
                        <span className="text-slate-700 font-medium">{student.firstname} <span className="text-xs text-gray-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded ml-1">{student.classId}</span></span>
                        <button 
                          onClick={() => handleRemoveStudent(student)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded text-xs font-bold transition-all"
                        >
                          [-] Retirer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Pied de page avec bouton Valider */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center rounded-b-xl">
              <button 
                onClick={() => setShowStudentSelector(false)}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors"
              >
                Valider l'ajout des étudiants ({selectedStudents.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}