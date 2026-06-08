/**
 * app/html-js/detail_teaching.tsx
 * 
 * Composant d'affichage détaillé des données - Debug
 * 
 * Rôle:
 * - Affiche les détails des données (sujets, utilisateurs, étudiants)
 * - Permet de visualiser la structure des données stockées en BDD
 * - Utile pour le débogage et le test en développement
 * 
 * Fonctionnement:
 * - Reçoit les données des sujets, utilisateurs, et étudiants via props
 * - Affiche chaque enregistrement avec ses propriétés
 * - Interface pour visualiser et naviguer dans les données
 */

'use client';

import { useState, useEffect } from 'react';
import { updateTeacherAssignments, updateSubjectAssignments, updateStudentAssignments, addGroup, addClass } from '../actions';
import { Student } from '@prisma/client';

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

interface StudentAssignmentsType {
  studentId : bigint;
  groupId : bigint;
}

interface StudentType {
  studentId: bigint;
  classId: number | null;
  firstname: string;
  surname: string;
}

interface GroupType{
  groupId : bigint;
  label : string;
}

interface ClassesType{
  classId: number;
  label: string;
}

interface BlocDetailsProps {
  currentSubject: SubjectType;
  users: UsersType[];
  students: StudentType[];
  groups : GroupType[];
  classes : ClassesType[];
  teacherAssignments: TeacherAssignmentsType[];
  subjectAssignments : SubjectAssignmentsType[];
  studentAssignments : StudentAssignmentsType[];
  onClose: () => void;
  onRefreshAssignments: () => Promise<void>;
}

export default function BlocDetails({ currentSubject, users, students, groups, classes, teacherAssignments, subjectAssignments, studentAssignments, onClose, onRefreshAssignments }: BlocDetailsProps) {
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showTeacherSelector, setShowTeacherSelector] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showClassCreator, setShowClassCreator] = useState(false);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  
  // NOUVEAU : États pour la modal de sélection par groupe
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const [newGroupName, setNewGroupName] = useState('');
  const [newClassName, setNewClassName] = useState('');

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

  // NOUVEAU : Fonction pour ajouter tous les étudiants des groupes sélectionnés (sans doublons)
  const handleAddGroupsStudents = () => {
    // 1. Trouver tous les étudiants appartenant aux groupes cochés/sélectionnés
    const studentsInGroups = students.filter(student => 
      studentAssignments.some(sa => 
        sa.studentId.toString() === student.studentId.toString() && 
        selectedGroupIds.includes(sa.groupId.toString())
      )
    );

    // 2. Filtrer pour ne garder que ceux qui ne sont pas DÉJÀ dans selectedStudents (évite les doublons)
    const currentSelectedIds = selectedStudents.map(s => s.studentId.toString());
    const uniqueStudentsToAdd = studentsInGroups.filter(
      student => !currentSelectedIds.includes(student.studentId.toString())
    );

    if (uniqueStudentsToAdd.length === 0) {
      alert("Tous les étudiants de ces groupes sont déjà inscrits ou sélectionnés !");
      setShowGroupSelector(false);
      setSelectedGroupIds([]);
      return;
    }

    // 3. Mettre à jour la liste des sélectionnés globales
    setSelectedStudents([...selectedStudents, ...uniqueStudentsToAdd]);

    // 4. Les retirer de la liste des étudiants individuels "Disponibles" pour garder la cohérence globale
    const addedIds = uniqueStudentsToAdd.map(s => s.studentId.toString());
    setAvailableStudents(availableStudents.filter(s => !addedIds.includes(s.studentId.toString())));

    // 5. Reset et fermeture de la modal
    setShowGroupSelector(false);
    setSelectedGroupIds([]);
  };

  // Fonction pour ajouter tous les étudiants des classes sélectionnées (sans doublons)
const handleAddClassesStudents = () => {
  // 1. Trouver tous les étudiants appartenant aux classes cochées/sélectionnées
  const studentsInClasses = students.filter(student => 
    student.classId !== null && selectedClassIds.includes(student.classId)
  );

  // 2. Filtrer pour ne garder que ceux qui ne sont pas DÉJÀ dans selectedStudents (évite les doublons)
  const currentSelectedIds = selectedStudents.map(s => s.studentId.toString());
  const uniqueStudentsToAdd = studentsInClasses.filter(
    student => !currentSelectedIds.includes(student.studentId.toString())
  );

  if (uniqueStudentsToAdd.length === 0) {
    alert("Tous les étudiants de ces classes sont déjà inscrits ou sélectionnés !");
    setShowClassSelector(false);
    setSelectedClassIds([]);
    return;
  }

  // 3. Mettre à jour la liste des sélectionnés globales
  setSelectedStudents([...selectedStudents, ...uniqueStudentsToAdd]);

  // 4. Les retirer de la liste des étudiants individuels "Disponibles" pour garder la cohérence globale
  const addedIds = uniqueStudentsToAdd.map(s => s.studentId.toString());
  setAvailableStudents(availableStudents.filter(s => !addedIds.includes(s.studentId.toString())));

  // 5. Reset et fermeture de la modal
  setShowClassSelector(false);
  setSelectedClassIds([]);
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

const handleCreateGroup = async () => {
  const trimmedName = newGroupName.trim();

  if (selectedStudents.length === 0) {
    alert("Impossible de créer un groupe vide. Veuillez sélectionner des étudiants dans le cours d'abord.");
    return;
  }

  const groupAlreadyExists = groups?.some(group => group.label.toLowerCase() === trimmedName.toLocaleLowerCase());
  
  if (groupAlreadyExists){
    alert("Nom de groupe déjà existant");
    return;
  }
  
  try {
    const studentIds = selectedStudents.map(s => s.studentId);

    await addGroup(trimmedName, studentIds);
    await onRefreshAssignments();

    // On ferme la modal et on reset le champ
    setShowGroupCreator(false);
    setNewGroupName('');
    
    alert(`Le groupe "${trimmedName}" a bien été créé avec ses ${studentIds.length} étudiant(s) !`);
  } catch (error) {
    console.error(error);
    alert("Une erreur est survenue lors de la création du groupe");
  }
}

const handleCreateClass = async () => {
  const trimmedName = newClassName.trim();

  if (selectedStudents.length === 0) {
    alert("Impossible de créer une classe vide. Veuillez sélectionner des étudiants dans le cours d'abord.");
    return;
  }

  const classAlreadyExists = classes?.some(c => c.label.toLowerCase() === trimmedName.toLocaleLowerCase());
  
  if (classAlreadyExists){
    alert("Nom de classe déjà existant");
    return;
  }
  
  try {
    // ✨ ON RÉCUPÈRE LES IDs DES ÉTUDIANTS SÉLECTIONNÉS
    const studentIds = selectedStudents.map(s => s.studentId);

    // ✨ ON ENVOIE LE NOM ET LES IDs À L'ACTION SERVEUR
    await addClass(trimmedName, studentIds);
    await onRefreshAssignments();

    setShowClassCreator(false);
    setNewClassName('');
    alert(`La classe "${trimmedName}" a bien été créée avec ses ${studentIds.length} étudiant(s) !`);
  } catch (error) {
    console.error(error);
    alert("Une erreur est survenue lors de la création de la classe");
  }
}

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
            
            {/* BRANCHEMENT DU BOUTON ADD GROUP */}
            <button 
              onClick={() => setShowGroupSelector(true)}
              className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors shadow"
            >
              Add Group
            </button>
            <button 
              onClick={() => setShowClassSelector(true)}
              className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors shadow"
            >
              Add Prom
            </button>
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
                  {classes.find(c => c.classId === student.classId)?.label || 'Sans classe'}
                </span>
              </div>
            ))
          )}
        </div>
        
        {/* BOUTON GLOBAL DE VALIDATION DES ETUDIANTS DE LA SECTION (AJOUT INDIVIDUEL + AJOUT GROUPES) */}
        {selectedStudents.length !== alreadyAssignedStudents.length && (
          <div className="flex justify-center mt-3">
            <button 
              onClick={handleValidateStudents}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow transition-colors"
            >
              Enregistrer les modifications d'inscriptions ({selectedStudents.length} élèves)
            </button>
          </div>
        )}
      </div>

      {/* Section Création Groupes et Classes */}
      <div className="mt-6 text-lg font-semibold w-[95%] bg-slate-200 p-4 rounded-lg flex flex-col gap-2 shadow-sm">
        <div className="flex justify-between items-center w-full">
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => {
                setNewGroupName('');
                setShowGroupCreator(true);
              }}
              className="px-4 py-2 cursor-pointer bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded transition-colors shadow"
            >
              Create Group
            </button>
            <button 
              onClick={() => setShowClassCreator(true)}
              className="px-4 py-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors shadow"
            >
              Create Class
            </button>
          </div>
        </div>
      </div>
      
      {/* Bouton de fermeture global */}
      <button className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium absolute right-[2%] top-[2%] transition-colors" onClick={onClose}>
        ✕
      </button>

      {/* ========================================================================= */}
      {/* NOUVELLE MODAL : DOUBLE LISTE DE SELECTION PAR GROUPE                     */}
      {/* ========================================================================= */}
      {showGroupSelector && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">Sélection d'étudiants par Groupe</h3>
              <button onClick={() => { setShowGroupSelector(false); setSelectedGroupIds([]); }} className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">✕</button>
            </div>

            {/* Corps Modal : Grille Double Colonne */}
            <div className="p-6 grid grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              
              {/* COLONNE GAUCHE : LISTE DES GROUPES */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">Groupes disponibles ({groups?.length || 0})</span>
                <div className="flex-1 overflow-y-auto space-y-2 bg-white border border-slate-200 rounded p-2 max-h-[320px]">
                  {!groups || groups.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2 text-center">Aucun groupe disponible</p>
                  ) : (
                    groups.map(group => {
                      const isSelected = selectedGroupIds.includes(group.groupId.toString());
                      return (
                        <div 
                          key={group.groupId.toString()} 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.groupId.toString()));
                            } else {
                              setSelectedGroupIds([...selectedGroupIds, group.groupId.toString()]);
                            }
                          }}
                          className={`p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{group.label}</span>
                          {isSelected && (
                            <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">Sélectionné</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* COLONNE DROITE : ÉTUDIANTS DU/DES GROUPE(S) CLIQUE(S) */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">
                  Membres des groupes sélectionnés ({
                    students.filter(student => 
                      studentAssignments.some(sa => 
                        sa.studentId.toString() === student.studentId.toString() && 
                        selectedGroupIds.includes(sa.groupId.toString())
                      )
                    ).length
                  })
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[320px]">
                  {selectedGroupIds.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2 text-center mt-10">Cliquez sur un ou plusieurs groupes à gauche pour afficher et sélectionner leurs étudiants.</p>
                  ) : (
                    (() => {
                      // Récupération dynamique des étudiants liés aux groupes sélectionnés
                      const displayedStudents = students.filter(student => 
                        studentAssignments.some(sa => 
                          sa.studentId.toString() === student.studentId.toString() && 
                          selectedGroupIds.includes(sa.groupId.toString())
                        )
                      );
                      
                      if (displayedStudents.length === 0) {
                        return <p className="text-xs text-gray-400 italic p-2 text-center mt-4">Aucun étudiant n'est affecté à ce(s) groupe(s).</p>;
                      }

                      return displayedStudents.map((student, index) => (
                        <div 
                          key={student.studentId.toString()} 
                          className={`p-2 flex justify-between items-center text-sm rounded ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                        >
                          <span className="text-slate-700 font-medium">{student.firstname} {student.surname}</span>
                          <span className="text-xs text-gray-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                            {student.classId || 'Sans classe'}
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal avec Bouton du Bas */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center rounded-b-xl">
              <button 
                onClick={handleAddGroupsStudents}
                disabled={selectedGroupIds.length === 0}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-md transition-colors"
              >
                Ajouter les membres au cours ({
                  students.filter(student => 
                    studentAssignments.some(sa => 
                      sa.studentId.toString() === student.studentId.toString() && 
                      selectedGroupIds.includes(sa.groupId.toString())
                    )
                  ).length
                } étudiants)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NOUVELLE MODAL : DOUBLE LISTE DE SELECTION PAR CLASSE / PROMO            */}
      {/* ========================================================================= */}
      {showClassSelector && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">Sélection d'étudiants par Classe / Promo</h3>
              <button onClick={() => { setShowClassSelector(false); setSelectedClassIds([]); }} className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">✕</button>
            </div>

            {/* Corps Modal : Grille Double Colonne */}
            <div className="p-6 grid grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              
              {/* COLONNE GAUCHE : LISTE DES CLASSES */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">Classes disponibles ({classes?.length || 0})</span>
                <div className="flex-1 overflow-y-auto space-y-2 bg-white border border-slate-200 rounded p-2 max-h-[320px]">
                  {!classes || classes.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2 text-center">Aucune classe disponible</p>
                  ) : (
                    classes.map(classe => {
                      const isSelected = selectedClassIds.includes(classe.classId);
                      return (
                        <div 
                          key={classe.classId.toString()} 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedClassIds(selectedClassIds.filter(id => id !== classe.classId));
                            } else {
                              setSelectedClassIds([...selectedClassIds, classe.classId]);
                            }
                          }}
                          className={`p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{classe.label}</span>
                          {isSelected && (
                            <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">Sélectionnée</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* COLONNE DROITE : ÉTUDIANTS DE LA/DES CLASSE(S) SELECTIONNEE(S) */}
              <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50 p-4">
                <span className="font-bold text-slate-700 text-sm mb-2">
                  Membres des classes sélectionnées ({
                    students.filter(student => 
                      student.classId !== null && selectedClassIds.includes(student.classId)
                    ).length
                  })
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded p-2 max-h-[320px]">
                  {selectedClassIds.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2 text-center mt-10">Cliquez sur une ou plusieurs classes à gauche pour afficher et sélectionner leurs étudiants.</p>
                  ) : (
                    (() => {
                      const displayedStudents = students.filter(student => 
                        student.classId !== null && selectedClassIds.includes(student.classId)
                      );
                      
                      if (displayedStudents.length === 0) {
                        return <p className="text-xs text-gray-400 italic p-2 text-center mt-4">Aucun étudiant n'est affecté à cette/ces classe(s).</p>;
                      }

                      return displayedStudents.map((student, index) => (
                        <div 
                          key={student.studentId.toString()} 
                          className={`p-2 flex justify-between items-center text-sm rounded ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                        >
                          <span className="text-slate-700 font-medium">{student.firstname} {student.surname}</span>
                          <span className="text-xs text-gray-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                            {classes.find(c => c.classId === student.classId)?.label || 'Classe rattachée'}
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal avec Bouton du Bas */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center rounded-b-xl">
              <button 
                onClick={handleAddClassesStudents}
                disabled={selectedClassIds.length === 0}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-md transition-colors"
              >
                Ajouter les membres au cours ({
                  students.filter(student => 
                    student.classId !== null && selectedClassIds.includes(student.classId)
                  ).length
                } étudiants)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : LISTE DE SELECTION ETUDIANTS INDIVIDUELS                          */}
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

      {/* ========================================================================= */}
      {/* MODAL : CRÉATION DE GROUPE                                               */}
      {/* ========================================================================= */}
      {showGroupCreator && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">Créer un groupe</h3>
              <button onClick={() => setShowGroupCreator(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">✕</button>
            </div>

            {/* Corps de la modal */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Champ texte de saisie du nom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Nom du nouveau groupe</label>
                <input 
                  type="text" 
                  placeholder="Ex: Groupe TD 1, Projet Web..." 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-slate-500 italic mt-1">
                  Ce groupe inclura automatiquement les <span className="font-bold text-pink-600">{selectedStudents.length}</span> élève(s) actuellement sélectionné(s).
                </p>
              </div>

              <hr className="border-slate-200 my-2" />

              {/* Liste scrollable des groupes existants */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Groupes existants ({groups?.length || 0})
                </span>
                
                <div className="border border-slate-200 rounded-md bg-slate-50 p-2 max-h-[160px] overflow-y-auto space-y-1.5">
                  {!groups || groups.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2 text-center">Aucun groupe en base de données.</p>
                  ) : (
                    groups.map((group) => (
                      <div 
                        key={group.groupId.toString()} 
                        className="bg-white p-2 text-sm rounded border border-slate-200 text-slate-700 shadow-sm font-medium"
                      >
                        {group.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer avec bouton de validation */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center rounded-b-xl">
              <button 
                onClick={() => handleCreateGroup()}
                disabled={!newGroupName.trim() || selectedStudents.length === 0} // ✨ Ajout de la condition
                className="w-full px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-md transition-colors"
              >
                Créer le Groupe
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* MODAL : CRÉATION DE CLASSE */}
      {showClassCreator && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">Créer une classe</h3>
              <button onClick={() => setShowClassCreator(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">✕</button>
            </div>

            {/* Corps de la modal */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Champ texte de saisie du nom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Nom de la nouvelle classe</label>
                <input 
                  type="text" 
                  placeholder="Ex: Promo 69, Adimaker..." 
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-slate-500 italic mt-1">
                  Cette classe inclura automatiquement les <span className="font-bold text-purple-600">{selectedStudents.length}</span> élève(s) actuellement sélectionné(s).
                </p>
              </div>

              <hr className="border-slate-200 my-2" />

              {/* Liste scrollable des classes existants */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Classes existants ({classes?.length || 0})
                </span>
                
                <div className="border border-slate-200 rounded-md bg-slate-50 p-2 max-h-[160px] overflow-y-auto space-y-1.5">
                  {!classes || classes.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-2 text-center">Aucune classe dans la base de données.</p>
                  ) : (
                    classes.map((classe) => (
                      <div 
                        key={classe.classId.toString()} 
                        className="bg-white p-2 text-sm rounded border border-slate-200 text-slate-700 shadow-sm font-medium"
                      >
                        {classe.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer avec bouton de validation */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center rounded-b-xl">
              <button 
                onClick={() => handleCreateClass()}
                disabled={!newClassName.trim() || selectedStudents.length === 0} // ✨ Ajout de la condition
                className="w-full px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-md transition-colors"
              >
                Créer la Classe
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
} 