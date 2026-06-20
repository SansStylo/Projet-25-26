/**
 * app/html-js/page.tsx
 * * Page de développement/debug - Gestion des données
 * * Rôle:
 * - Page de test et debug pour la gestion des données (sujets, utilisateurs, étudiants)
 * - Permet l'ajout manuel de données de test
 * - Affichage et gestion des données via l'interface
 * * Fonctionnement:
 * - Récupère les données via getSubjects(), getUsers(), getStudents()
 * - Permet l'ajout de données via addDebugSubject(), addDebugUser(), addDebugStudent()
 * - Interface interactive pour tester et visualiser les données
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import BlocDetails from './detail_teaching';
import BlocGroups from './detail_groups';
import BlocClasses from './detail_class';
import { getSubjects, 
  getUsers, 
  getStudents, 
  getTeacherAssignments, 
  getSubjectAssignments,
  getGroups,
  getClass,
  addDebugSubject, 
  addDebugUser, 
  addDebugStudent,
  getStudentAssignments
 } from '../actions'

interface SubjectType {
  subjectId: number;
  label: string;
}

interface UsersType {
  userId : bigint;
  mail : string;
  password : string;
  firstname : string;
  surname : string;
  level : number;
}

interface StudentType {
  studentId : bigint;
  classId : number | null;
  firstname : string;
  surname : string;
}

interface TeacherAssignmentsType {
  subjectId : number;
  teacherId : bigint;
}

interface SubjectAssignmentsType {
  studentId : bigint;
  subjectId : number;
}

interface StudentAssignmentsType {
  studentId : bigint;
  groupId : bigint;
}

interface GroupType{
  groupId : bigint;
  label : string;
}

interface ClassesType{
  classId : number;
  label : string;
}

export default function DashboardPage() {
  const [activeBloc, setActiveBloc] = useState<SubjectType | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const [activeGroup, setActiveGroup] = useState<GroupType | null>(null);
  const [activeClass, setActiveClass] = useState<ClassesType | null>(null);

  const [showGroupsManager, setShowGroupsManager] = useState(false);
  const [showClassesManager, setShowClassesManager] = useState(false);

  

  const [showSubjectCreator, setShowSubjectCreator] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UsersType[]>([]);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentsType[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignmentsType[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignmentsType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);


  const refreshAssignments = async () => {
    const subjectsData = await getSubjects();
    setSubjects(subjectsData);
    
    const [teachersData, studentsData, studentData, groupsData, classesData, updatedStudents] = await Promise.all([
      getTeacherAssignments(),
      getSubjectAssignments(),
      getStudentAssignments(),
      getGroups(),
      getClass(),
      getStudents()
    ]);
    setTeacherAssignments(teachersData);
    setSubjectAssignments(studentsData);
    setStudentAssignments(studentData);
    setGroups(groupsData);
    setClasses(classesData);
    setStudents(updatedStudents);
  }

  useEffect(() => {
    async function loadInitialData() {
      const data = await getSubjects();
      setSubjects(data);
      setIsLoading(false);

      const data2 = await getUsers();
      setUsers(data2);

      const data3 = await getStudents();
      setStudents(data3);

      const data4 = await getTeacherAssignments();
      setTeacherAssignments(data4);

      const data5 = await getSubjectAssignments();
      setSubjectAssignments(data5);

      const data6 = await getGroups();
      setGroups(data6);

      const data7 = await getClass();
      setClasses(data7);

      const data8 = await getStudentAssignments();
      setStudentAssignments(data8);
    }
    loadInitialData();
  }, []);

  const sortedSubjects = useMemo(() => {
    if (!sortOrder) return subjects; // Si aucun tri, on garde l'ordre de la BDD
    
    return [...subjects].sort((a, b) => {
      const labelA = a.label.toLowerCase();
      const labelB = b.label.toLowerCase();
      
      if (sortOrder === 'asc') {
        return labelA.localeCompare(labelB);
      } else {
        return labelB.localeCompare(labelA);
      }
    });
  }, [subjects, sortOrder]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newSubjectName.trim();

    if (!trimmedName) {
      alert("Veuillez saisir un nom de matière valide.");
      return;
    }

    const subjectExists = subjects.some(s => s.label.toLowerCase() === trimmedName.toLowerCase());
    if (subjectExists) {
      alert("Cette matière existe déjà dans votre catalogue.");
      return;
    }

    try {
      setIsSubmitting(true);
      // On envoie à PostgreSQL via notre action serveur préexistante
      const newSubject = await addDebugSubject(trimmedName);
      
      // Mise à jour de l'état local pour un affichage instantané
      setSubjects([...subjects, newSubject]);
      
      // Reset et fermeture de la modal
      setNewSubjectName("");
      setShowSubjectCreator(false);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de la création de la matière.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7F5] dark:bg-[#050A08] text-gray-800 dark:text-emerald-50 transition-colors duration-300">

      <main className="p-6 md:p-10 flex-1 overflow-auto bg-[#F8FAFC] dark:bg-[#050A08]">
        <div className="max-w-6xl mx-auto">
          
          {/* En-tête de la page + Boutons d'actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1E2E24] dark:text-emerald-50 mb-1">
                Gestion des Matières
              </h1>
              <p className="text-sm text-[#53665A] dark:text-emerald-200/60">
                Consultez, ajoutez et organisez les modules d'enseignement.
              </p>
            </div>

            {/* Boutons d'actions */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => setSortOrder(prev => prev === null ? 'asc' : prev === 'asc' ? 'desc' : null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs flex items-center gap-2 h-9 w-23 ${
                  sortOrder
                    ? 'bg-[#F4F7F5] dark:bg-emerald-900/30 text-[#0F5E3D] dark:text-emerald-300 border-[#0F5E3D] dark:border-emerald-700'
                    : 'bg-white dark:bg-[#0E1B16] text-[#53665A] dark:text-emerald-200 border-[#E2EAE5] dark:border-emerald-900/50 hover:bg-[#F4F7F5] dark:hover:bg-emerald-900/20'
                }`}>
                {/* Icône qui change de sens selon le tri en cours */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2.5} 
                  stroke="currentColor" 
                  className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v10.5" />
                </svg>
                <span>
                  {sortOrder === 'asc' ? 'A → Z' : sortOrder === 'desc' ? 'Z → A' : 'Trier'}
                </span>
              </button>
              <button 
                onClick={() => setActiveBloc({ subjectId: 0, label: "" })}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B16] hover:bg-[#F4F7F5] dark:hover:bg-emerald-900/20 text-[#0F5E3D] dark:text-emerald-400 font-bold text-sm transition-colors shadow-xs border border-[#E2EAE5] dark:border-emerald-900/50 cursor-pointer h-9"
              >
                + Ajouter une matière
              </button>
            </div>
          </div>

          {/* Grille de cartes pour les matières*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoading ? (
              <p className="text-sm text-slate-400 italic">Chargement des matières...</p>
            ) : sortedSubjects.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucune matière enregistrée. Utilisez les boutons de debug à gauche.</p>
            ) : (
              sortedSubjects.map((subject) => (
                <div 
                  key={subject.subjectId}
                  onClick={() => setActiveBloc(subject)}
                  className="bg-white dark:bg-[#0B1511] p-5 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 shadow-[0_4px_20px_rgba(18,38,30,0.02)] hover:shadow-[0_8px_30px_rgba(18,38,30,0.05)] transition-all flex flex-col justify-between min-h-36 group cursor-pointer"
                >
                  {/* Petit carré icône : prend automatiquement les 2 premières lettres de la matière */}
                  <div className="w-10 h-10 bg-[#F4F7F5] dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-[#0F5E3D] dark:text-emerald-400 mb-3 font-bold group-hover:bg-[#0F5E3D] dark:group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                    {subject.label.substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div>
                    {/* Nom de la matière dynamique */}
                    <h3 className="font-bold text-[#1E2E24] dark:text-emerald-50 text-sm leading-snug mb-1 line-clamp-2">
                      {subject.label}
                    </h3>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
      {showSubjectCreator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#F8FAFC] dark:bg-[#0B1511] w-full max-w-md rounded-2xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center bg-white dark:bg-[#0E1B16] rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-[#1E2E24] dark:text-white">Créer une matière</h3>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/70">Ajouter une nouvelle matière au catalogue</p>
              </div>
              <button 
                onClick={() => { setShowSubjectCreator(false); setNewSubjectName(""); }} 
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

            {/* Formulaire */}
            <form onSubmit={handleCreateSubject}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E2E24] dark:text-emerald-100 uppercase tracking-wider">Nom de la nouvelle matière</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Intelligence Artificielle, Big Data..." 
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-white dark:bg-[#0E1B16] dark:text-white mb-1 focus:outline-none focus:ring-2 focus:ring-[#0F5E3D]/20 focus:border-[#0F5E3D]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] flex justify-center rounded-b-xl">
                <button 
                  type="submit"
                  disabled={isSubmitting || !newSubjectName.trim()}
                  className="w-full px-6 py-2.5 bg-[#0F5E3D] dark:bg-emerald-800 hover:bg-[#0A4A31] dark:hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Création..." : "Créer la Matière"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {activeBloc && (
        <BlocDetails 
          key={activeBloc.subjectId}
          currentSubject={activeBloc}
          users={users}
          students={students}
          groups={groups}
          classes={classes}
          teacherAssignments={teacherAssignments}
          subjectAssignments={subjectAssignments}
          studentAssignments={studentAssignments}
          onClose={() => setActiveBloc(null)} 
          onRefreshAssignments={refreshAssignments}
        />
      )}

      {activeGroup && (
        <BlocGroups 
          currentGroup={activeGroup} 
          students={students}
          studentAssignments={studentAssignments}
          onClose={() => setActiveGroup(null)}
          onRefreshAssignments={refreshAssignments}
        />
      )}

      {activeClass && (
        <BlocClasses 
          currentClass={activeClass}
          students={students}
          onClose={() => setActiveClass(null)}
          onRefreshAssignments={refreshAssignments}
        />
      )}
    </div>
  );
}