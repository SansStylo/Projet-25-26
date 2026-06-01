'use client';

import { useState, useEffect } from 'react';
import { updateTeacherAssignments, updateSubjectAssignments } from '../actions';

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

interface TeacherAssignmentsType {
  subjectId: number;
  teacherId: bigint;
}

interface SubjectAssignmentsType {
  studentId : bigint;
  subjectId : number;
}

interface StudentType {
  studentId: bigint;
  classId: number | null;
  firstname: string;
  surname: string;
}

interface BlocDetailsProps {
  currentSubject: SubjectType;
  users: UsersType[];
  students: StudentType[];
  teacherAssignments: TeacherAssignmentsType[];
  subjectAssignments : SubjectAssignmentsType[];
  onClose: () => void;
  onRefreshAssignments: () => Promise<void>;
}

export default function BlocDetails({ currentSubject, users, students, teacherAssignments, subjectAssignments, onClose, onRefreshAssignments }: BlocDetailsProps) {
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showTeacherSelector, setShowTeacherSelector] = useState(false);

  // Filtrer les enseignants rattachés à cette matière précise
  const assignedTeacherIds = teacherAssignments
    .filter(ta => Number(ta.subjectId) === Number(currentSubject.subjectId))
    .map(ta => ta.teacherId);

  const alreadyAssignedTeachers = users.filter(user => 
    assignedTeacherIds.includes(user.userId)
  );

  const nonAssignedTeachers = users.filter(user => 
    user.level === 0 && !assignedTeacherIds.includes(user.userId)
  );

  // Filtrer les étudiants rattachés à cette matière précise
  const assignedStudentIds = (subjectAssignments || [])
    .filter(sa => Number(sa.subjectId) === Number(currentSubject.subjectId))
    .map(sa => sa.studentId.toString());

  const alreadyAssignedStudents = students.filter(student => assignedStudentIds.includes(student.studentId.toString()));

  const nonAssignedStudents = students.filter(student => !assignedStudentIds.includes(student.studentId.toString()));

  // États pour les sélecteurs (modals)
  const [availableStudents, setAvailableStudents] = useState<StudentType[]>(nonAssignedStudents || []);
  const [availableTeachers, setAvailableTeachers] = useState<UsersType[]>(nonAssignedTeachers || []);
  
  const [selectedStudents, setSelectedStudents] = useState<StudentType[]>(alreadyAssignedStudents || []);
  const [selectedTeachers, setSelectedTeachers] = useState<UsersType[]>(alreadyAssignedTeachers || []);

  // on remet à jour les listes locales par rapport aux nouvelles données reçues du parent
  useEffect(() => {
    setSelectedTeachers(alreadyAssignedTeachers);
    setAvailableTeachers(users.filter(user => user.level === 0 && !assignedTeacherIds.includes(user.userId)));
    setSelectedStudents(alreadyAssignedStudents);
    setAvailableStudents(students.filter(student => !assignedStudentIds.includes(student.studentId.toString())));
  }, [teacherAssignments, subjectAssignments, users, students]);

  // États pour les barres de recherche
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchSelected, setSearchSelected] = useState('');

  // Filtrages dynamiques pour les modals
  const filteredAvailableStudents = availableStudents.filter(student =>
    student.firstname.toLowerCase().includes(searchAvailable.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredAvailableTeachers = availableTeachers.filter(teacher =>
    teacher.firstname.toLowerCase().includes(searchAvailable.toLowerCase()) ||
    teacher.surname.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredSelectedStudents = selectedStudents.filter(student =>
    student.firstname.toLowerCase().includes(searchSelected.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchSelected.toLowerCase())
  );

  const filteredSelectedTeachers = selectedTeachers.filter(teacher =>
    teacher.firstname.toLowerCase().includes(searchSelected.toLowerCase()) ||
    teacher.surname.toLowerCase().includes(searchSelected.toLowerCase())
  );

  // Gestion des transferts (Ajout / Retrait)
  const handleAddStudent = (student: StudentType) => {
    setAvailableStudents(availableStudents.filter(s => s.studentId !== student.studentId));
    setSelectedStudents([...selectedStudents, student]);
  };

  const handleAddTeacher = (teacher: UsersType) => {
    setAvailableTeachers(availableTeachers.filter(s => s.userId !== teacher.userId));
    setSelectedTeachers([...selectedTeachers, teacher]);
  };

  const handleRemoveStudent = (student: StudentType) => {
    setSelectedStudents(selectedStudents.filter(s => s.studentId !== student.studentId));
    setAvailableStudents([...availableStudents, student]);
  };

  const handleRemoveTeacher = (teacher: UsersType) => {
    setSelectedTeachers(selectedTeachers.filter(s => s.userId !== teacher.userId));
    setAvailableTeachers([...availableTeachers, teacher]);
  };

  // Validation Enseignants BDD
  const handleValidateTeachers = async () => {
    try {
      const teacherIds = selectedTeachers.map(t => t.userId);
      await updateTeacherAssignments(currentSubject.subjectId, teacherIds);
      await onRefreshAssignments(); // Met à jour le parent page.tsx
      setShowTeacherSelector(false);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'enregistrement des intervenants.");
    }
  };

  const handleValidateStudents = async () => {
    try {
      const studentIds = selectedStudents.map(s => s.studentId);
      await updateSubjectAssignments(studentIds, currentSubject.subjectId);
      await onRefreshAssignments(); // Met à jour le parent page.tsx
      setShowStudentSelector(false);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'enregistrement des intervenants.");
    }
  };

  return (
    <div className="center absolute w-[95%] h-[95%] inset-0 m-auto bg-slate-100 backdrop-blur-sm z-40 p-10 flex flex-col justify-start items-center rounded-xl shadow-2xl border border-slate-300 overflow-y-auto">
      
      {/* Titre Principal */}
      <h2 className="text-3xl font-bold text-slate-900 mb-6 self-start">{currentSubject.label}</h2>
      
      {/* Section Intervenant */}
      <div className="text-lg font-semibold w-[95%] bg-slate-200 p-4 rounded-lg flex flex-col gap-2 shadow-sm">
        <div className="flex justify-between items-center w-full">
          <span>Intervenants assignés ({alreadyAssignedTeachers.length}) :</span>
          <button 
            onClick={() => setShowTeacherSelector(true)}
            className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors shadow"
          >
            Add Teacher
          </button>
        </div>

        {/*LISTE DYNAMIQUE DES INTERVENANTS DEJA AJOUTES */}
        <div className="bg-white rounded-md border border-slate-300 overflow-hidden text-sm font-normal mt-2">
          {alreadyAssignedTeachers.length === 0 ? (
            <p className="text-gray-400 italic p-3 text-center">Aucun intervenant pour le moment.</p>
          ) : (
            alreadyAssignedTeachers.map((teacher, index) => (
              <div 
                key={teacher.userId.toString()} 
                className={`p-3 flex justify-between items-center ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50 border-y border-slate-100'}`}
              >
                <span className="font-medium text-slate-800">{teacher.firstname} {teacher.surname}</span>
                <span className="text-xs text-slate-500 italic">{teacher.mail}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section Étudiants */}
      <div className="mt-6 text-lg font-semibold w-[95%] bg-slate-200 p-4 rounded-lg flex flex-col gap-2 shadow-sm">
        <div className="flex justify-between items-center w-full">
          <span>Étudiants inscrits : <span className="text-blue-600 font-bold">{selectedStudents.length}</span></span>
          <div className="flex justify-end gap-2">
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

        {/*LISTE DYNAMIQUE DES ETUDIANTS DEJA AJOUTES */}
        <div className="bg-white rounded-md border border-slate-300 overflow-hidden text-sm font-normal mt-2">
          {selectedStudents.length === 0 ? (
            <p className="text-gray-400 italic p-3 text-center">Aucun étudiant inscrit pour le moment.</p>
          ) : (
            selectedStudents.map((student, index) => (
              <div 
                key={student.studentId.toString()} 
                className={`p-3 flex justify-between items-center ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50 border-y border-slate-100'}`}
              >
                <span className="font-medium text-slate-800">{student.firstname} {student.surname}</span>
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                  {student.classId || 'Sans classe'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bouton de fermeture global */}
      <button className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium absolute right-[2%] top-[2%] transition-colors" onClick={onClose}>
        ✕
      </button>

      {/* ========================================================================= */}
      {/* MODAL : LISTE DE SELECTION ETUDIANTS                                      */}
      {/* ========================================================================= */}
      {showStudentSelector && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">Sélection des étudiants pour {currentSubject.label}</h3>
              <button onClick={() => setShowStudentSelector(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">✕</button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              {/* GAUCHE : DISPONIBLES */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">Disponibles ({filteredAvailableStudents.length} restants)</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les disponibles (ex: Alice, B1...)" 
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[250px]">
                  {filteredAvailableStudents.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2">Aucun étudiant trouvé</p>
                  ) : (
                    filteredAvailableStudents.map(student => (
                      <div key={student.studentId.toString()} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm transition-colors">
                        <span className="text-slate-700 font-medium">{student.firstname} {student.surname} <span className="text-xs text-gray-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded ml-1">{student.classId}</span></span>
                        <button onClick={() => handleAddStudent(student)} className="px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded text-xs font-bold transition-all">[+] Ajouter</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DROITE : SÉLECTIONNÉS */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">Sélectionnés ({filteredSelectedStudents.length})</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les sélectionnés..." 
                  value={searchSelected}
                  onChange={(e) => setSearchSelected(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[250px]">
                  {filteredSelectedStudents.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2">Aucun étudiant sélectionné</p>
                  ) : (
                    filteredSelectedStudents.map(student => (
                      <div key={student.studentId.toString()} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm transition-colors">
                        <span className="text-slate-700 font-medium">{student.firstname} {student.surname} <span className="text-xs text-gray-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded ml-1">{student.classId}</span></span>
                        <button onClick={() => handleRemoveStudent(student)} className="px-2 py-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded text-xs font-bold transition-all">[-] Retirer</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center rounded-b-xl">
              <button 
                onClick={handleValidateStudents}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors"
              >
                Valider l'ajout des étudiants ({selectedStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : LISTE DE SELECTION ENSEIGNANTS                                    */}
      {/* ========================================================================= */}
      {showTeacherSelector && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">Sélection des intervenants pour {currentSubject.label}</h3>
              <button onClick={() => setShowTeacherSelector(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">✕</button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              {/* GAUCHE : DISPONIBLES */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">Disponibles ({filteredAvailableTeachers.length} restants)</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les disponibles..." 
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white mb-3"
                />
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[250px]">
                  {filteredAvailableTeachers.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2">Aucun intervenant disponible</p>
                  ) : (
                    filteredAvailableTeachers.map(teacher => (
                      <div key={teacher.userId.toString()} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                        <span className="text-slate-700 font-medium">{teacher.firstname} {teacher.surname}</span>
                        <button onClick={() => handleAddTeacher(teacher)} className="px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded text-xs font-bold transition-all">[+] Ajouter</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DROITE : SÉLECTIONNÉS */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">Sélectionnés ({filteredSelectedTeachers.length})</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les sélectionnés..." 
                  value={searchSelected}
                  onChange={(e) => setSearchSelected(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white mb-3"
                />
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[250px]">
                  {filteredSelectedTeachers.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2">Aucun intervenant sélectionné</p>
                  ) : (
                    filteredSelectedTeachers.map(teacher => (
                      <div key={teacher.userId.toString()} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                        <span className="text-slate-700 font-medium">{teacher.firstname} {teacher.surname}</span>
                        <button onClick={() => handleRemoveTeacher(teacher)} className="px-2 py-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded text-xs font-bold transition-all">[-] Retirer</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center rounded-b-xl">
              <button 
                onClick={handleValidateTeachers}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors"
              >
                Valider l'ajout des intervenants ({selectedTeachers.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}