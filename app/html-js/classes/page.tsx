/**
 * app/html-js/classes/page.tsx
 * * Page de gestion dédiée aux Classes / Promotions & Groupes
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import BlocClasses from '../detail_class'; 
import BlocGroups from '../detail_groups';
import { 
  getStudents, 
  getTeacherAssignments, 
  getSubjectAssignments,
  getGroups,
  getClass,
  getStudentAssignments,
  addClass,
  addGroup
} from '../../actions';

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

export default function ClassesAndGroupsPage() {
  const [activeTab, setActiveTab] = useState<'classes' | 'groups'>('classes');

  const [activeClass, setActiveClass] = useState<ClassesType | null>(null);
  const [activeGroup, setActiveGroup] = useState<GroupType | null>(null); // 🌟 Réintégré
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const [showCreator, setShowCreator] = useState(false); // 🌟 Modal unique partagée
  const [newStructureName, setNewClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentsType[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignmentsType[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignmentsType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);

  const refreshAssignments = async () => {
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
      setIsLoading(true);
      const [data3, data4, data5, data6, data7, data8] = await Promise.all([
        getStudents(),
        getTeacherAssignments(),
        getSubjectAssignments(),
        getGroups(),
        getClass(),
        getStudentAssignments()
      ]);
      setStudents(data3);
      setTeacherAssignments(data4);
      setSubjectAssignments(data5);
      setGroups(data6);
      setClasses(data7);
      setStudentAssignments(data8);
      setIsLoading(false);
    }
    loadInitialData();
  }, []);

  // 🌟 ADAPTATION : Tri intelligent selon l'onglet actif (Classes ou Groupes)
  const sortedItems = useMemo(() => {
    const currentList = activeTab === 'classes' ? classes : groups;
    if (!sortOrder) return currentList;
    
    return [...currentList].sort((a, b) => {
      const labelA = a.label.toLowerCase();
      const labelB = b.label.toLowerCase();
      return sortOrder === 'asc' ? labelA.localeCompare(labelB) : labelB.localeCompare(labelA);
    });
  }, [classes, groups, activeTab, sortOrder]);

  // 🌟 ADAPTATION : Création dynamique selon l'onglet affiché
  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newStructureName.trim();

    if (!trimmedName) {
      alert("Veuillez saisir un nom valide.");
      return;
    }

    const currentList = activeTab === 'classes' ? classes : groups;
    if (currentList.some(item => item.label.toLowerCase() === trimmedName.toLowerCase())) {
      alert(`Cet élément existe déjà.`);
      return;
    }

    try {
      setIsSubmitting(true);
      if (activeTab === 'classes') {
        await addClass(trimmedName, []);
      } else {
        await addGroup(trimmedName, []);
      }
      await refreshAssignments();
      
      setNewClassName("");
      setShowCreator(false);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-b text-gray-800">
      <main className="p-6 md:p-10 flex-1 overflow-auto bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          
          {/* En-tête de la page */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1E2E24] mb-1">
                {activeTab === 'classes' ? 'Gestion des Promotions' : 'Gestion des Groupes'}
              </h1>
              <p className="text-sm text-[#53665A]">
                Consultez les structures et organisez les effectifs étudiants.
              </p>
            </div>

            {/* Boutons d'actions */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => setSortOrder(prev => prev === null ? 'asc' : prev === 'asc' ? 'desc' : null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 h-9 w-28 ${
                  sortOrder ? 'bg-[#F4F7F5] text-[#0F5E3D] border-[#0F5E3D]' : 'bg-white text-[#53665A] border-[#E2EAE5] hover:bg-[#F4F7F5]'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform shrink-0 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v10.5" />
                </svg>
                <span className="shrink-0">
                  {sortOrder === 'asc' ? 'Tri : A → Z' : sortOrder === 'desc' ? 'Tri : Z → A' : 'Trier'}
                </span>
              </button>

              <button 
                onClick={() => setShowCreator(true)}
                className="px-4 py-2 rounded-xl bg-[#0F5E3D] hover:bg-[#0A4A31] text-white font-bold text-sm transition-colors shadow-xs cursor-pointer h-9"
              >
                {activeTab === 'classes' ? '+ Créer une promotion' : '+ Créer un groupe'}
              </button>
            </div>
          </div>

          {/* Sélecteur d'onglets entre Classes et Groupes */}
          <div className="flex gap-2 mb-8 border-b border-[#E2EAE5] pb-3">
            <button
              onClick={() => { setActiveTab('classes'); setSortOrder(null); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-2.5 ${
                activeTab === 'classes' ? 'bg-[#d2e5d9] text-[#0F5E3D]' : 'text-[#53665A] hover:bg-slate-100'
              }`}
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
            <span>Promotions</span>
            </button>
            <button
              onClick={() => { setActiveTab('groups'); setSortOrder(null); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-2.5 ${
                activeTab === 'groups' ? 'bg-[#d2e5d9] text-[#0F5E3D]' : 'text-[#53665A] hover:bg-slate-100'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-4 h-4 shrink-0"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                <span>Groupes</span>
            </button>
          </div>

          {/* Grille de cartes dynamique */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoading ? (
              <p className="text-sm text-slate-400 italic">Chargement des données...</p>
            ) : sortedItems.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucun élément enregistré dans cette catégorie.</p>
            ) : (
              sortedItems.map((item) => {
                const isClass = activeTab === 'classes';
                const id = isClass ? (item as ClassesType).classId : (item as GroupType).groupId.toString();
                
                // Décompte dynamique des étudiants selon le type de structure
                const count = isClass 
                  ? students.filter(s => s.classId === (item as ClassesType).classId).length
                  : studentAssignments.filter(sa => sa.groupId.toString() === id).length;

                return (
                  <div 
                    key={id}
                    onClick={() => isClass ? setActiveClass(item as ClassesType) : setActiveGroup(item as GroupType)}
                    className="bg-white p-5 rounded-2xl border border-[#E2EAE5] shadow-[0_4px_20px_rgba(18,38,30,0.02)] hover:shadow-[0_8px_30px_rgba(18,38,30,0.05)] transition-all flex flex-col justify-between min-h-36 group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#F4F7F5] rounded-xl flex items-center justify-center text-[#0F5E3D] mb-3 font-bold group-hover:bg-[#0F5E3D] group-hover:text-white transition-colors">
                      {item.label.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E2E24] text-sm leading-snug mb-1 line-clamp-2">
                        {item.label}
                      </h3>
                      <p className="text-xs text-[#53665A] font-medium">
                        Membres : {count} élèves
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </main>

      {/* MODAL COMMUNE DE CREATION */}
      {showCreator && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#F8FAFC] w-full max-w-md rounded-2xl shadow-2xl border border-[#E2EAE5] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-[#E2EAE5] flex justify-between items-center bg-white rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-[#1E2E24]">
                  {activeTab === 'classes' ? 'Créer une promotion' : 'Créer un groupe'}
                </h3>
              </div>
              <button 
                onClick={() => { setShowCreator(false); setNewClassName(""); }} 
                className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] hover:bg-red-50 text-[#53665A] hover:text-red-600 rounded-xl transition-all cursor-pointer font-bold border border-[#E2EAE5]">
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

            <form onSubmit={handleCreateStructure}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E2E24] uppercase tracking-wider">
                    {activeTab === 'classes' ? 'Nom de la promotion' : 'Nom du groupe'}
                  </label>
                  <input 
                    type="text" 
                    placeholder={activeTab === 'classes' ? "Ex: CSI 3, M2 Big Data..." : "Ex: Groupe TD A, Équipe Projet..."}
                    value={newStructureName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E2EAE5] rounded-xl bg-white mb-1 focus:outline-none focus:ring-2 focus:ring-[#0F5E3D]/20 focus:border-[#0F5E3D]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-[#E2EAE5] bg-white flex justify-center rounded-b-xl">
                <button 
                  type="submit"
                  disabled={isSubmitting || !newStructureName.trim()}
                  className="w-full px-6 py-2.5 bg-[#0F5E3D] hover:bg-[#0A4A31] text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Création..." : activeTab === 'classes' ? "Créer la Promotion" : "Créer le Groupe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rendu conditionnel des panneaux d'édition selon le choix */}
      {activeClass && (
        <BlocClasses 
          currentClass={activeClass}
          students={students}
          onClose={() => setActiveClass(null)}
          onRefreshAssignments={refreshAssignments}
        />
      )}

      {activeGroup && (
        <BlocGroups 
          currentGroup={activeGroup}  // On passe l'objet
          students={students}
          studentAssignments={studentAssignments}
          onClose={() => setActiveGroup(null)} // C'est ici que tu appelles le setter du parent
          onRefreshAssignments={refreshAssignments}
        />
        
      )}
    </div>
  );
}