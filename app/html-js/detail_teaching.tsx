/**
 * app/html-js/detail_teaching.tsx
 * * Composant d'affichage détaillé des données - Debug
 * * Rôle:
 * - Affiche les détails des données (sujets, utilisateurs, étudiants)
 * - Permet de visualiser la structure des données stockées en BDD
 * - Utile pour le débogage et le test en développement
 * * Fonctionnement:
 * - Reçoit les données des sujets, utilisateurs, et étudiants via props
 * - Affiche chaque enregistrement avec ses propriétés
 * - Interface pour visualiser et naviguer dans les données
 */

'use client';

import { useState, useEffect } from 'react';
import { updateTeacherAssignments, updateSubjectAssignments, updateStudentAssignments, addGroup, addClass, addDebugSubject, updateSubject, deleteSubject } from '../actions';
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
  const isNewSubject = currentSubject.subjectId === 0;
  const [subjectName, setSubjectName] = useState(currentSubject.label);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showTeacherSelector, setShowTeacherSelector] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showClassCreator, setShowClassCreator] = useState(false);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // États pour la modal de sélection par groupe
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const [newGroupName, setNewGroupName] = useState('');
  const [newClassName, setNewClassName] = useState('');

  // Filtrer les enseignants rattachés à cette matière précise
  const assignedTeacherIds = isNewSubject 
    ? [] 
    : teacherAssignments
        .filter(ta => Number(ta.subjectId) === Number(currentSubject.subjectId))
        .map(ta => ta.teacherId);

  const alreadyAssignedTeachers = isNewSubject ? [] : users.filter(user => 
    assignedTeacherIds.includes(user.userId)
  );
  const nonAssignedTeachers = users.filter(user => 
    user.level === 0 && !assignedTeacherIds.includes(user.userId)
  );

  // Filtrer les étudiants rattachés à cette matière précise
  const assignedStudentIds = isNewSubject
    ? []
    : (subjectAssignments || [])
        .filter(sa => Number(sa.subjectId) === Number(currentSubject.subjectId))
        .map(sa => sa.studentId.toString());

  const alreadyAssignedStudents = isNewSubject ? [] : students.filter(student => assignedStudentIds.includes(student.studentId.toString()));
  const nonAssignedStudents = students.filter(student => !assignedStudentIds.includes(student.studentId.toString()));

  // États pour les sélecteurs (modals)
  const [availableStudents, setAvailableStudents] = useState<StudentType[]>(nonAssignedStudents || []);
  const [availableTeachers, setAvailableTeachers] = useState<UsersType[]>(nonAssignedTeachers || []);
  
  const [selectedStudents, setSelectedStudents] = useState<StudentType[]>(alreadyAssignedStudents || []);
  const [selectedTeachers, setSelectedTeachers] = useState<UsersType[]>(alreadyAssignedTeachers || []);


  useEffect(() => {
        if (toast) {
          const timer = setTimeout(() => setToast(null), 3000);
          return () => clearTimeout(timer);
        }
      }, [toast]);
    
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };


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

  const handleAddGroupsStudents = () => {
    const studentsInGroups = students.filter(student => 
      studentAssignments.some(sa => 
        sa.studentId.toString() === student.studentId.toString() && 
        selectedGroupIds.includes(sa.groupId.toString())
      )
    );

    const currentSelectedIds = selectedStudents.map(s => s.studentId.toString());
    const uniqueStudentsToAdd = studentsInGroups.filter(
      student => !currentSelectedIds.includes(student.studentId.toString())
    );

    if (uniqueStudentsToAdd.length === 0) {
      showToast("Tous les étudiants de ces groupes sont déjà inscrits ou sélectionnés !","error");
      setShowGroupSelector(false);
      setSelectedGroupIds([]);
      return;
    }

    // Mettre à jour la liste des sélectionnés globales
    setSelectedStudents([...selectedStudents, ...uniqueStudentsToAdd]);

    // Les retirer de la liste des étudiants individuels "Disponibles" pour garder la cohérence globale
    const addedIds = uniqueStudentsToAdd.map(s => s.studentId.toString());
    setAvailableStudents(availableStudents.filter(s => !addedIds.includes(s.studentId.toString())));

    // Reset et fermeture de la modal
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
    showToast("Tous les étudiants de ces classes sont déjà inscrits ou sélectionnés !", "error");
    setShowClassSelector(false);
    setSelectedClassIds([]);
    return;
  }

  // Mettre à jour la liste des sélectionnés globales
  setSelectedStudents([...selectedStudents, ...uniqueStudentsToAdd]);

  // Les retirer de la liste des étudiants individuels "Disponibles" pour garder la cohérence globale
  const addedIds = uniqueStudentsToAdd.map(s => s.studentId.toString());
  setAvailableStudents(availableStudents.filter(s => !addedIds.includes(s.studentId.toString())));

  // Reset et fermeture de la modal
  setShowClassSelector(false);
  setSelectedClassIds([]);
};

  // Validation Enseignants BDD
  const handleValidateTeachers = async () => {
    if (isNewSubject) {
      setShowTeacherSelector(false);
      return;
    }

    // Sinon (modification d'une matière existante), on envoie en base de données
    try {
      const teacherIds = selectedTeachers.map(t => t.userId);
      await updateTeacherAssignments(currentSubject.subjectId, teacherIds);
      await onRefreshAssignments(); 
      setShowTeacherSelector(false);

      showToast("Classe modifiée avec succès !", "success");
    } catch (error) {
      console.error(error);
      showToast("Une erreur est survenue lors de l'enregistrement des intervenants.","error");
    }
  };

  const handleValidateStudents = async () => {
    if (isNewSubject) {
      setShowStudentSelector(false);
      return;
    }

    try {
      const studentIds = selectedStudents.map(s => s.studentId);
      await updateSubjectAssignments(studentIds, currentSubject.subjectId);
      await onRefreshAssignments(); 
      setShowStudentSelector(false);
    } catch (error) {
      console.error(error);
      showToast("Une erreur est survenue lors de l'enregistrement des étudiants.","error");
    }
  };

const handleCreateGroup = async () => {
  const trimmedName = newGroupName.trim();

  if (selectedStudents.length === 0) {
    showToast("Impossible de créer un groupe vide. Veuillez sélectionner des étudiants dans le cours d'abord.","error");
    return;
  }

  const groupAlreadyExists = groups?.some(group => group.label.toLowerCase() === trimmedName.toLocaleLowerCase());
  
  if (groupAlreadyExists){
    showToast("Nom de groupe déjà existant","error");
    return;
  }
  
  try {
    const studentIds = selectedStudents.map(s => s.studentId);

    await addGroup(trimmedName, studentIds);
    await onRefreshAssignments();

    // On ferme la modal et on reset le champ
    setShowGroupCreator(false);
    setNewGroupName('');
    
    showToast(`Le groupe "${trimmedName}" a bien été créé avec ses ${studentIds.length} étudiant(s) !`,"success");
  } catch (error) {
    console.error(error);
    showToast("Une erreur est survenue lors de la création du groupe","error");
  }
}

const handleCreateClass = async () => {
  const trimmedName = newClassName.trim();

  if (selectedStudents.length === 0) {
    showToast("Impossible de créer une classe vide. Veuillez sélectionner des étudiants dans le cours d'abord.", "error");
    return;
  }

  const classAlreadyExists = classes?.some(c => c.label.toLowerCase() === trimmedName.toLocaleLowerCase());
  
  if (classAlreadyExists){
    showToast("Nom de classe déjà existant", "error");
    return;
  }
  
  try {
    // ON RÉCUPÈRE LES IDs DES ÉTUDIANTS SÉLECTIONNÉS
    const studentIds = selectedStudents.map(s => s.studentId);

    // ON ENVOIE LE NOM ET LES IDs À L'ACTION SERVEUR
    await addClass(trimmedName, studentIds);
    await onRefreshAssignments();

    setShowClassCreator(false);
    setNewClassName('');

    showToast(`La classe "${trimmedName}" a bien été créée avec ses ${studentIds.length} étudiant(s) !`, "success");
  } catch (error) {
    console.error(error);
    showToast("Une erreur est survenue lors de la création de la classe", "error");
  }
}

const handleDeleteSubject = async () => {
  try {
    await deleteSubject(currentSubject.subjectId);
    await onRefreshAssignments();
    showToast("Matière supprimée avec succès", "success");
    setTimeout(() => {
      onClose();
    }, 1000);
  } catch (error) {
    showToast("Une erreur est survenue lors de la suppression.", "error");
  }
};

const handleGlobalSave = async () => {
    const trimmedName = subjectName.trim();
    if (!trimmedName) {
      showToast("Veuillez donner un nom à la matière.", "error");
      return;
    }

    try {
      setIsCreating(true);
      let targetSubjectId = currentSubject.subjectId;

      if (isNewSubject) {
      // Cas : Nouvelle création
        const newSubjectFromDB = await addDebugSubject(trimmedName);
        targetSubjectId = newSubjectFromDB.subjectId;
      } else if (trimmedName !== currentSubject.label) {
        // Cas : Mise à jour du nom (si le nom a changé)
        const res = await updateSubject(targetSubjectId, trimmedName);
        if (!res.success) throw new Error(res.error);
      }

      const teacherIds = selectedTeachers.map(t => t.userId);
      if (teacherIds.length > 0 || !isNewSubject) {
        await updateTeacherAssignments(targetSubjectId, teacherIds);
      }

      const studentIds = selectedStudents.map(s => s.studentId);
      if (studentIds.length > 0 || !isNewSubject) {
        await updateSubjectAssignments(studentIds, targetSubjectId);
      }
      
      await onRefreshAssignments();
      
      const actionLabel = isNewSubject ? "créée" : "modifiée";
      showToast(`La matière "${trimmedName}" a été ${actionLabel} avec succès !`, "success");
      setTimeout(() => {
      onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      showToast("Une erreur est survenue lors de la création complète.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md z-40 flex items-center justify-center p-6 md:p-10 animate-fade-in transition-colors duration-300">
      <div className="bg-[#F8FAFC] dark:bg-[#050A08] w-full max-w-5xl h-[90vh] flex flex-col justify-start items-center rounded-3xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 overflow-hidden relative">
        
        {/* Titre Principal */}
        <div className="w-full bg-white dark:bg-[#0B1511] px-8 py-5 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center shrink-0 transition-colors duration-300">
          <div className="flex-1 mr-4">
            {isNewSubject ? (
              <>
                <h2 className="text-xl font-bold text-[#1E2E24] dark:text-emerald-50 tracking-tight">Nouveau module</h2>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60 font-medium mt-0.5">Création et configuration simultanée</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[#1E2E24] dark:text-emerald-50 tracking-tight">{currentSubject.label}</h2>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60 font-medium mt-0.5">Configuration et affectations du module</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Bouton Supprimer (n'apparaît que si ce n'est pas une création) */}
            {!isNewSubject && (
              <button 
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-all cursor-pointer text-xs font-bold border border-red-100 dark:border-red-900/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            )}

            {/* Bouton de fermeture global */}
            <button 
              className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 hover:bg-red-50 dark:hover:bg-red-900/20 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all cursor-pointer font-bold border border-[#E2EAE5] dark:border-emerald-800" 
              onClick={onClose}
            >
              <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
              >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Corps scrollable de la modal */}
        <div className="w-full flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-fadeIn">
            {/* Colonne Gauche : Saisie du Nom */}
            <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 shadow-[0_4px_20px_rgba(18,38,30,0.015)] flex flex-col justify-center gap-2">
              <label className="text-xs font-bold text-[#1E2E24] dark:text-emerald-50 uppercase tracking-wider">
                {isNewSubject ? "Nom de la nouvelle matière" : "Nom de la matière"}
              </label>
              <input 
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Saisissez le nom du module ici..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl text-[#1E2E24] dark:text-emerald-50 placeholder-slate-400 dark:placeholder-emerald-800 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5E3D]/10 focus:border-[#0F5E3D]"
              />
            </div>

            {/* Colonne Droite : Outils de structure rapide */}
            <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 shadow-[0_4px_20px_rgba(18,38,30,0.015)] flex flex-col justify-center gap-3">
              <span className="text-xs font-bold text-[#1E2E24] dark:text-emerald-50 uppercase tracking-wider block">
                Outils de structure rapide
              </span>
              <div className="flex flex-wrap gap-3">
                <button 
                  type="button"
                  onClick={() => {console.log("Bouton cliqué !"); 
                    setNewGroupName(''); setShowGroupCreator(true); }}
                  className="px-4 py-2 cursor-pointer bg-slate-50 dark:bg-emerald-900/20 hover:bg-slate-100 dark:hover:bg-emerald-800 border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-xs font-bold rounded-xl transition-all shadow-2xs"
                >
                  Créer un groupe
                </button>
                <button 
                  type="button"
                  onClick={() => setShowClassCreator(true)}
                  className="px-4 py-2 cursor-pointer bg-slate-50 dark:bg-emerald-900/20 hover:bg-slate-100 dark:hover:bg-emerald-800 border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-xs font-bold rounded-xl transition-all shadow-2xs"
                >
                  Créer une promotion
                </button>
              </div>
            </div>
          </div>
          {/* Section Intervenant */}
          <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 shadow-[0_4px_20px_rgba(18,38,30,0.015)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="text-sm font-bold text-[#1E2E24] dark:text-emerald-50 uppercase tracking-wider">
                Intervenants assignés ({alreadyAssignedTeachers.length}) :
              </div>
              <button 
                onClick={() => setShowTeacherSelector(true)}
                className="px-4 py-2 cursor-pointer bg-[#F4F7F5] dark:bg-emerald-900/20 border border-[#E2EAE5] dark:border-emerald-900/50 hover:bg-[#E2EAE5] dark:hover:bg-emerald-900/40 text-[#0F5E3D] dark:text-emerald-300 text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Ajouter un enseignant
              </button>
            </div>

            {/*LISTE DYNAMIQUE DES INTERVENANTS DEJA AJOUTES */}
            <div className="border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl overflow-hidden divide-y divide-[#E2EAE5] dark:divide-emerald-900/30">
  {selectedTeachers.length === 0 ? (
    <p className="text-gray-400 dark:text-emerald-900 italic p-4 text-center bg-slate-50/50 dark:bg-[#0E1B16]">Aucun intervenant pour le moment.</p>
  ) : (
    selectedTeachers.map((teacher, index) => (
      <div 
        key={teacher.userId.toString()} 
        className="p-3.5 flex justify-between items-center bg-white dark:bg-[#0E1B16] hover:bg-slate-50/50 dark:hover:bg-emerald-900/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0F5E3D] dark:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center justify-center">
            {teacher.firstname[0]}{teacher.surname[0]}
          </div>
          <span className="text-sm font-semibold text-[#1E2E24] dark:text-emerald-50">{teacher.firstname} {teacher.surname}</span>
        </div>
        <span className="text-xs font-mono text-[#53665A] dark:text-emerald-300 bg-[#F4F7F5] dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-[#E2EAE5] dark:border-emerald-900">{teacher.mail}</span>
      </div>
    ))
  )}
</div>
          </div>

          {/* Section Étudiants */}
          <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 shadow-[0_4px_20px_rgba(18,38,30,0.015)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="text-sm font-bold text-[#1E2E24] dark:text-emerald-50 uppercase tracking-wider">
                Étudiants inscrits : <span className="text-[#0F5E3D] dark:text-emerald-400 font-bold">{selectedStudents.length}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowStudentSelector(true)} 
                  className="px-3.5 py-1.5 cursor-pointer bg-[#F4F7F5] dark:bg-emerald-900/20 hover:bg-[#E2EAE5] dark:hover:bg-emerald-900/40 border border-[#E2EAE5] dark:border-emerald-900/50 text-[#0F5E3D] dark:text-emerald-300 text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Ajouter un étudiant
                </button>
                
                <button 
                  onClick={() => setShowGroupSelector(true)}
                  className="px-3.5 py-1.5 cursor-pointer bg-[#F4F7F5] dark:bg-emerald-900/20 hover:bg-[#E2EAE5] dark:hover:bg-emerald-900/40 border border-[#E2EAE5] dark:border-emerald-900/50 text-[#0F5E3D] dark:text-emerald-300 text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Ajouter un groupe
                </button>
                <button 
                  onClick={() => setShowClassSelector(true)}
                  className="px-3.5 py-1.5 cursor-pointer bg-[#F4F7F5] dark:bg-emerald-900/20 hover:bg-[#E2EAE5] dark:hover:bg-emerald-900/40 border border-[#E2EAE5] dark:border-emerald-900/50 text-[#0F5E3D] dark:text-emerald-300 text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Ajouter une promotion
                </button>
              </div>
            </div>

            {/*LISTE DYNAMIQUE DES ETUDIANTS DEJA AJOUTES */}
            <div className="border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl overflow-hidden divide-y divide-[#E2EAE5] dark:divide-emerald-900/30 max-h-72 overflow-y-auto">
              {selectedStudents.length === 0 ? (
                <p className="text-gray-400 dark:text-emerald-900 italic p-4 text-center bg-slate-50/50 dark:bg-[#0E1B16]">Aucun étudiant inscrit pour le moment.</p>
              ) : (
                selectedStudents.map((student, index) => (
                  <div 
                    key={student.studentId.toString()} 
                    className="p-3 flex justify-between items-center bg-white dark:bg-[#0E1B16] hover:bg-slate-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-[#1E2E24] dark:text-emerald-50">{student.firstname} {student.surname}</span>
                    <span className="text-[10px] font-bold text-[#0F5E3D] dark:text-emerald-300 bg-[#F4F7F5] dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-[#E2EAE5] dark:border-emerald-900">
                      {classes.find(c => c.classId === student.classId)?.label || 'Sans promotion'}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            {/* BOUTON GLOBAL DE VALIDATION DES ETUDIANTS DE LA SECTION (AJOUT INDIVIDUEL + AJOUT GROUPES) */}
            {selectedStudents.length !== alreadyAssignedStudents.length && (
              <div className="flex justify-center mt-4 pt-4 border-t border-dashed border-[#E2EAE5] dark:border-emerald-900/30">
                <button 
                  onClick={handleValidateStudents}
                  className="px-5 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Enregistrer les modifications d'inscriptions ({selectedStudents.length} élèves)
                </button>
              </div>
            )}
          </div>

          
        {/*Barre de validation */}
        
          <div className="w-full flex justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-30 shrink-0 rounded-b-3xl">
            <button
              type="button"
              onClick={handleGlobalSave}
              disabled={isCreating || !subjectName.trim()}
              className="flex justify-center w-full max-w-md py-3 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-md cursor-pointer"
            >
             {isCreating 
                ? "Enregistrement..." 
                : isNewSubject 
                  ? "Créer et enregistrer la matière" 
                  : "Enregistrer les modifications"
             }
            </button>
          </div>
        </div>
      </div>

      

      {/* ========================================================================= */}
      {/* NOUVELLE MODAL : DOUBLE LISTE DE SELECTION PAR GROUPE                     */}
      {/* ========================================================================= */}
      {showGroupSelector && (
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl animate-fade-in">
          <div className="bg-[#F8FAFC] dark:bg-[#050A08] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center bg-white dark:bg-[#0E1B16] rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-[#1E2E24] dark:text-white">Sélection d'étudiants par Groupe</h3>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60">Ajoutez massivement les membres de vos équipes</p>
              </div>
              <button 
                onClick={() => { setShowGroupSelector(false); setSelectedGroupIds([]); }} 
                className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 border border-[#E2EAE5] dark:border-emerald-800 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl font-bold cursor-pointer transition-all"
              >
              <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Corps Modal : Grille Double Colonne */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              
              {/* COLONNE GAUCHE : LISTE DES GROUPES */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0E1B16] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-3">Groupes disponibles ({groups?.length || 0})</span>
                <div className="flex-1 overflow-y-auto space-y-2 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[320px]">
                  {!groups || groups.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-200/50 italic p-4 text-center">Aucun groupe disponible</p>
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
                          className={`p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-[#F4F7F5] dark:bg-emerald-900/40 border-[#0F5E3D] dark:border-emerald-500 text-[#0F5E3D] dark:text-emerald-100 shadow-2xs' 
                              : 'bg-white dark:bg-[#0B1511] border-[#E2EAE5] dark:border-emerald-900 hover:bg-slate-50/50 dark:hover:bg-emerald-900/20 text-[#1E2E24] dark:text-emerald-50'
                          }`}
                        >
                          <span>{group.label}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-[#0F5E3D] dark:bg-emerald-600 text-white px-2 py-0.5 rounded-md">Sélectionné</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* COLONNE DROITE : ÉTUDIANTS DU/DES GROUPE(S) CLIQUE(S) */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0E1B16] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-3">
                  Membres des groupes sélectionnés ({
                    students.filter(student => 
                      studentAssignments.some(sa => 
                        sa.studentId.toString() === student.studentId.toString() && 
                        selectedGroupIds.includes(sa.groupId.toString())
                      )
                    ).length
                  })
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-1 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[320px]">
                  {selectedGroupIds.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-200/50 italic p-4 text-center mt-10">Cliquez sur un ou plusieurs groupes à gauche pour afficher leurs étudiants.</p>
                  ) : (
                    (() => {
                      const displayedStudents = students.filter(student => 
                        studentAssignments.some(sa => 
                          sa.studentId.toString() === student.studentId.toString() && 
                          selectedGroupIds.includes(sa.groupId.toString())
                        )
                      );
                      
                      if (displayedStudents.length === 0) {
                        return <p className="text-xs text-[#718579] dark:text-emerald-200/50 italic p-4 text-center mt-4">Aucun étudiant n'est affecté à ce(s) groupe(s).</p>;
                      }

                      return displayedStudents.map((student, index) => (
                        <div 
                          key={student.studentId.toString()} 
                          className="p-2.5 flex justify-between items-center text-sm rounded-xl bg-white dark:bg-[#0B1511] border border-[#E2EAE5] dark:border-emerald-900/30 shadow-3xs mb-1"
                        >
                          <span className="text-[#1E2E24] dark:text-emerald-50 font-medium">{student.firstname} {student.surname}</span>
                          <span className="text-[10px] font-bold text-[#0F5E3D] dark:text-emerald-300 bg-[#F4F7F5] dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-[#E2EAE5] dark:border-emerald-900">
                            {classes.find(c => c.classId === student.classId)?.label || 'Sans promotion'}
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal avec Bouton du Bas */}
            <div className="p-4 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] flex justify-center rounded-b-xl shrink-0">
              <button 
                onClick={handleAddGroupsStudents}
                disabled={selectedGroupIds.length === 0}
                className="px-6 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
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
      {/* MODAL : LISTE DE SELECTION PAR CLASSE / PROMO                             */}
      {/* ========================================================================= */}
      {showClassSelector && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 rounded-xl animate-fade-in">
          <div className="bg-[#F8FAFC] dark:bg-[#050A08] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center bg-white dark:bg-[#0E1B16] rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-[#1E2E24] dark:text-white">Sélection d'étudiants par Classe / Promo</h3>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60">Sélection par promotion entière</p>
              </div>
              <button 
                onClick={() => { setShowClassSelector(false); setSelectedClassIds([]); }} 
                className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 border border-[#E2EAE5] dark:border-emerald-800 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl font-bold cursor-pointer transition-all"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Corps Modal : Grille Double Colonne */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              
              {/* COLONNE GAUCHE : LISTE DES CLASSES */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0E1B16] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-3">Classes disponibles ({classes?.length || 0})</span>
                <div className="flex-1 overflow-y-auto space-y-2 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[320px]">
                  {!classes || classes.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-200/50 italic p-4 text-center">Aucune classe disponible</p>
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
                          className={`p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-[#F4F7F5] dark:bg-emerald-900/40 border-[#0F5E3D] dark:border-emerald-500 text-[#0F5E3D] dark:text-emerald-100 shadow-2xs' 
                              : 'bg-white dark:bg-[#0B1511] border-[#E2EAE5] dark:border-emerald-900 hover:bg-slate-50/50 dark:hover:bg-emerald-900/20 text-[#1E2E24] dark:text-emerald-50'
                          }`}
                        >
                          <span>{classe.label}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-[#0F5E3D] dark:bg-emerald-600 text-white px-2 py-0.5 rounded-md">Sélectionnée</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* COLONNE DROITE : ÉTUDIANTS DE LA/DES CLASSE(S) SELECTIONNEE(S) */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0E1B16] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-3">
                  Membres des classes sélectionnées ({
                    students.filter(student => 
                      student.classId !== null && selectedClassIds.includes(student.classId)
                    ).length
                  })
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-1 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[320px]">
                  {selectedClassIds.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-200/50 italic p-4 text-center mt-10">Cliquez sur une ou plusieurs classes à gauche pour afficher leurs étudiants.</p>
                  ) : (
                    (() => {
                      const displayedStudents = students.filter(student => 
                        student.classId !== null && selectedClassIds.includes(student.classId)
                      );
                      
                      if (displayedStudents.length === 0) {
                        return <p className="text-xs text-[#718579] dark:text-emerald-200/50 italic p-4 text-center mt-4">Aucun étudiant n'est affecté à cette/ces classe(s).</p>;
                      }

                      return displayedStudents.map((student, index) => (
                        <div 
                          key={student.studentId.toString()} 
                          className="p-2.5 flex justify-between items-center text-sm rounded-xl bg-white dark:bg-[#0B1511] border border-[#E2EAE5] dark:border-emerald-900/30 shadow-3xs mb-1"
                        >
                          <span className="text-[#1E2E24] dark:text-emerald-50 font-medium">{student.firstname} {student.surname}</span>
                          <span className="text-[10px] font-bold text-[#0F5E3D] dark:text-emerald-300 bg-[#F4F7F5] dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-[#E2EAE5] dark:border-emerald-900">
                            {classes.find(c => c.classId === student.classId)?.label || 'Sans promotion'}
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal avec Bouton du Bas */}
            <div className="p-4 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] flex justify-center rounded-b-xl shrink-0">
              <button 
                onClick={handleAddClassesStudents}
                disabled={selectedClassIds.length === 0}
                className="px-6 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Valider l'ajout des étudiants ({
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
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl animate-fade-in transition-colors duration-300">
          <div className="bg-[#F8FAFC] dark:bg-[#050A08] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="p-4 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center bg-white dark:bg-[#0E1B16] rounded-t-xl shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1E2E24] dark:text-emerald-50">Sélection des étudiants pour {currentSubject.label}</h3>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60">Ajoutez ou retirez manuellement les profils</p>
              </div>
              <button onClick={() => setShowStudentSelector(false)} className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 border border-[#E2EAE5] dark:border-emerald-800 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl font-bold cursor-pointer transition-all">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>  
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              {/* GAUCHE : DISPONIBLES */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0E1B16] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-2">Disponibles ({filteredAvailableStudents.length} restants)</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les disponibles (ex: Alice, B1...)" 
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-[#F8FAFC] dark:bg-[#050A08] dark:text-emerald-50 mb-3 focus:outline-none focus:ring-2 focus:ring-[#0F5E3D]/20 focus:border-[#0F5E3D]"
                />
                <div className="flex-1 overflow-y-auto space-y-1.5 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[250px]">
                  {filteredAvailableStudents.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-900 italic p-3 text-center">Aucun étudiant trouvé</p>
                  ) : (
                    filteredAvailableStudents.map(student => (
                      <div key={student.studentId.toString()} className="flex items-center justify-between p-2 bg-white dark:bg-[#050A08] border border-[#E2EAE5] dark:border-emerald-900/30 shadow-3xs rounded-xl text-sm transition-colors hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <span className="text-[#1E2E24] dark:text-emerald-50 font-semibold">
                          {student.firstname} {student.surname} 
                          {student.classId && (
                            <span className="text-[10px] font-bold text-[#0F5E3D] dark:text-emerald-300 bg-[#F4F7F5] dark:bg-emerald-900/20 px-1.5 py-0.5 rounded border border-[#E2EAE5] dark:border-emerald-900 ml-1">
                              {classes.find(c => c.classId === student.classId)?.label || 'Classe'}
                            </span>
                          )}
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleAddStudent(student)} 
                          className="w-7 h-7 inline-flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/30 hover:bg-[#0F5E3D] text-[#0F5E3D] dark:text-emerald-300 hover:text-white rounded-full border border-[#E2EAE5] dark:border-emerald-800 hover:border-[#0F5E3D] transition-all cursor-pointer shadow-3xs"
                          title="Ajouter à la sélection"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DROITE : SÉLECTIONNÉS */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0E1B16] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-2">Sélectionnés ({filteredSelectedStudents.length})</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les sélectionnés..." 
                  value={searchSelected}
                  onChange={(e) => setSearchSelected(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-[#F8FAFC] dark:bg-[#050A08] dark:text-emerald-50 mb-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <div className="flex-1 overflow-y-auto space-y-1.5 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[250px]">
                  {filteredSelectedStudents.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-900 italic p-3 text-center">Aucun étudiant sélectionné</p>
                  ) : (
                    filteredSelectedStudents.map(student => (
                      <div key={student.studentId.toString()} className="flex items-center justify-between p-2 bg-white dark:bg-[#050A08] border border-[#E2EAE5] dark:border-emerald-900/30 shadow-3xs rounded-xl text-sm transition-colors hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <span className="text-[#1E2E24] dark:text-emerald-50 font-semibold">
                          {student.firstname} {student.surname}
                          {student.classId && (
                            <span className="text-[10px] font-bold text-[#0F5E3D] dark:text-emerald-300 bg-[#F4F7F5] dark:bg-emerald-900/20 px-1.5 py-0.5 rounded border border-[#E2EAE5] dark:border-emerald-900 ml-1">
                              {classes.find(c => c.classId === student.classId)?.label || 'Classe'}
                            </span>
                          )}
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveStudent(student)} 
                          className="w-7 h-7 inline-flex items-center justify-center bg-red-50 dark:bg-red-900/20 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white rounded-full border border-red-100 dark:border-red-900/30 hover:border-red-500 transition-all cursor-pointer shadow-3xs"
                          title="Retirer de la sélection"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] flex justify-center rounded-b-xl shrink-0">
              <button 
                onClick={handleValidateStudents}
                className="px-6 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
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
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl animate-fade-in transition-colors duration-300">
          <div className="bg-[#F8FAFC] dark:bg-[#050A08] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="p-4 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center bg-white dark:bg-[#0E1B16] rounded-t-xl shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1E2E24] dark:text-emerald-50">Sélection des intervenants pour {currentSubject.label}</h3>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60">Assignez les enseignants de ce module</p>
              </div>
              <button onClick={() => setShowTeacherSelector(false)} className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 border border-[#E2EAE5] dark:border-emerald-800 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl font-bold cursor-pointer transition-all">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>  
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-[400px]">
              {/* GAUCHE : DISPONIBLES */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0B1511] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-2">Disponibles ({filteredAvailableTeachers.length} restants)</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les disponibles..." 
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-[#F8FAFC] dark:bg-[#050A08] dark:text-emerald-50 mb-3 focus:outline-none focus:ring-2 focus:ring-[#0F5E3D]/20 focus:border-[#0F5E3D]"
                />
                <div className="flex-1 overflow-y-auto space-y-1.5 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[250px]">
                  {filteredAvailableTeachers.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-900 italic p-3 text-center">Aucun intervenant disponible</p>
                  ) : (
                    filteredAvailableTeachers.map(teacher => (
                      <div key={teacher.userId.toString()} className="flex items-center justify-between p-2 bg-white dark:bg-[#050A08] border border-[#E2EAE5] dark:border-emerald-900/30 shadow-3xs rounded-xl text-sm transition-colors hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <span className="text-[#1E2E24] dark:text-emerald-50 font-semibold">{teacher.firstname} {teacher.surname}</span>
                        <button 
                          type="button"
                          onClick={() => handleAddTeacher(teacher)} 
                          className="w-7 h-7 inline-flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 hover:bg-[#0F5E3D] dark:hover:bg-emerald-800 text-[#0F5E3D] dark:text-emerald-300 hover:text-white rounded-full border border-[#E2EAE5] dark:border-emerald-800 hover:border-[#0F5E3D] dark:hover:border-emerald-700 transition-all cursor-pointer shadow-3xs"
                          title="Ajouter à la sélection"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DROITE : SÉLECTIONNÉS */}
              <div className="flex flex-col border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-white dark:bg-[#0B1511] p-4 shadow-2xs">
                <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-2">Sélectionnés ({filteredSelectedTeachers.length})</span>
                <input 
                  type="text" 
                  placeholder="Filtrer les sélectionnés..." 
                  value={searchSelected}
                  onChange={(e) => setSearchSelected(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-[#F8FAFC] dark:bg-[#050A08] dark:text-emerald-50 mb-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <div className="flex-1 overflow-y-auto space-y-1.5 bg-slate-50/50 dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-2 max-h-[250px]">
                  {filteredSelectedTeachers.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-900 italic p-3 text-center">Aucun intervenant sélectionné</p>
                  ) : (
                    filteredSelectedTeachers.map(teacher => (
                      <div key={teacher.userId.toString()} className="flex items-center justify-between p-2 bg-white dark:bg-[#050A08] border border-[#E2EAE5] dark:border-emerald-900/30 shadow-3xs rounded-xl text-sm transition-colors hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <span className="text-[#1E2E24] dark:text-emerald-50 font-semibold">{teacher.firstname} {teacher.surname}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveTeacher(teacher)} 
                          className="w-7 h-7 inline-flex items-center justify-center bg-red-50 dark:bg-red-900/20 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white rounded-full border border-red-100 dark:border-red-900/30 hover:border-red-500 transition-all cursor-pointer shadow-3xs"
                          title="Retirer de la sélection"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] flex justify-center rounded-b-xl shrink-0">
              <button 
                onClick={handleValidateTeachers}
                className="px-6 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
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
  <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-xl animate-fade-in transition-colors duration-300">
    <div className="bg-[#F8FAFC] dark:bg-[#0B1511] w-full max-w-md rounded-2xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 flex flex-col max-h-[90vh] overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center bg-white dark:bg-[#0E1B16] rounded-t-xl transition-colors duration-300">
        <div>
          <h3 className="text-lg font-bold text-[#1E2E24] dark:text-white">Créer un groupe</h3>
          <p className="text-xs text-[#53665A] dark:text-emerald-200/60">Regroupement sur-mesure d'étudiants</p>
        </div>
        <button 
          onClick={() => setShowGroupCreator(false)} 
          className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 border border-[#E2EAE5] dark:border-emerald-800 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl font-bold cursor-pointer transition-all"
        >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-4 h-4"
          >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Corps de la modal */}
      <div className="p-6 flex flex-col gap-5 overflow-y-auto">
        {/* Champ texte de saisie du nom */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1E2E24] dark:text-emerald-100 uppercase tracking-wider">Nom du nouveau groupe</label>
          <input 
            type="text" 
            placeholder="Ex: Groupe TD 1, Projet Web..." 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-white dark:bg-[#0E1B16] dark:text-white mb-1 focus:outline-none focus:ring-2 focus:ring-[#0F5E3D]/20 focus:border-[#0F5E3D]"
          />
          <p className="text-xs text-[#53665A] dark:text-emerald-200/60 italic">
            Ce groupe inclura automatiquement les <span className="font-bold text-[#0F5E3D] dark:text-emerald-400">{selectedStudents.length}</span> élève(s) actuellement sélectionné(s).
          </p>
        </div>
        <hr className="border-[#E2EAE5] dark:border-emerald-900/30" />

        {/* Liste scrollable des groupes existants */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#53665A] dark:text-emerald-200/70 uppercase tracking-wider">
            Groupes existants ({groups?.length || 0})
          </span>

          <div className="border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-slate-50/50 dark:bg-[#0E1B16] p-2 max-h-[160px] overflow-y-auto space-y-1.5">
            {!groups || groups.length === 0 ? (
              <p className="text-xs text-[#718579] dark:text-emerald-900 italic p-2 text-center">Aucun groupe en base de données.</p>
            ) : (
              groups.map((group) => (
                <div 
                  key={group.groupId.toString()} 
                  className="bg-white dark:bg-[#050A08] p-2.5 text-sm rounded-xl border border-[#E2EAE5] dark:border-emerald-900/30 text-[#1E2E24] dark:text-emerald-50 shadow-3xs font-semibold"
                >
                  {group.label}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer avec bouton de validation */}
      <div className="p-4 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] flex justify-center rounded-b-xl shrink-0 transition-colors duration-300">
        <button 
          onClick={() => handleCreateGroup()}
          disabled={!newGroupName.trim() || selectedStudents.length === 0}
          className="w-full px-6 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
        >
          Créer le Groupe
        </button>
      </div>
    </div>
  </div>
)}
      
      {/* MODAL : CRÉATION DE CLASSE */}
      {showClassCreator && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 rounded-xl animate-fade-in transition-colors duration-300">
          <div className="bg-[#F8FAFC] dark:bg-[#0B1511] w-full max-w-md rounded-2xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center bg-white dark:bg-[#0E1B16] rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-[#1E2E24] dark:text-white">Créer une classe</h3>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60">Création d'une promotion officielle</p>
              </div>
              <button 
                onClick={() => setShowClassCreator(false)} 
                className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 border border-[#E2EAE5] dark:border-emerald-800 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 rounded-xl font-bold cursor-pointer transition-all"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Corps de la modal */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Champ texte de saisie du nom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1E2E24] dark:text-emerald-100 uppercase tracking-wider">Nom de la nouvelle classe</label>
                <input 
                  type="text" 
                  placeholder="Ex: Promo 69, Adimaker..." 
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-white dark:bg-[#0E1B16] dark:text-white mb-1 focus:outline-none focus:ring-2 focus:ring-[#0F5E3D]/20 focus:border-[#0F5E3D]"
                />
                <p className="text-xs text-[#53665A] dark:text-emerald-200/60 italic">
                  Cette classe inclura automatiquement les <span className="font-bold text-[#0F5E3D] dark:text-emerald-400">{selectedStudents.length}</span> élève(s) actuellement sélectionné(s).
                </p>
              </div>

              <hr className="border-[#E2EAE5] dark:border-emerald-900/30" />

              {/* Liste scrollable des classes existants */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#53665A] dark:text-emerald-200/70 uppercase tracking-wider">
                  Classes existants ({classes?.length || 0})
                </span>
                
                <div className="border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl bg-slate-50/50 dark:bg-[#0E1B16] p-2 max-h-[160px] overflow-y-auto space-y-1.5">
                  {!classes || classes.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-900 italic p-2 text-center">Aucune classe dans la base de données.</p>
                  ) : (
                    classes.map((classe) => (
                      <div 
                        key={classe.classId.toString()} 
                        className="bg-white dark:bg-[#050A08] p-2.5 text-sm rounded-xl border border-[#E2EAE5] dark:border-emerald-900/30 text-[#1E2E24] dark:text-emerald-50 shadow-3xs font-semibold"
                      >
                        {classe.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer avec bouton de validation */}
            <div className="p-4 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] flex justify-center rounded-b-xl shrink-0">
              <button type="button" onClick={() => handleCreateClass()} disabled={!newClassName.trim() || selectedStudents.length === 0} className="w-full px-6 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer">
                Créer la Classe
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 transition-colors duration-300">
           <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-emerald-900/50">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1E2E24] dark:text-white mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-[#53665A] dark:text-emerald-200/70 mb-6">Êtes-vous sûr de vouloir supprimer la matière "<strong>{currentSubject.label}</strong>" ? Cette action est irréversible.</p>
              <div className="flex gap-3">
                 <button onClick={() => setShowDeleteConfirm(false)} 
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold cursor-pointer">
                    Annuler
                 </button>
                 <button onClick={handleDeleteSubject} 
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer">
                  Supprimer
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 border-l-4 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[20000] animate-fadeIn transition-all bg-white dark:bg-[#0E1B16] cursor-pointer ${
          toast.type === "error" ? "border-red-500" : "border-[#10B981]"
        }`} onClick={() => setToast(null)}>
          <div className={`p-2 rounded-full ${toast.type === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-[#E6F4EE] dark:bg-emerald-900/20 text-[#10B981]"}`}>
            {toast.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1E2E24] dark:text-white">{toast.type === "success" ? "Succès" : "Erreur"}</h4>
            <p className="text-xs text-[#53665A] dark:text-emerald-200/70">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}