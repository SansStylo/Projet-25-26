'use client';

import { useState, useEffect } from 'react';
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
import { Group, Student } from '@prisma/client';

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
  const [showGroupsManager, setShowGroupsManager] = useState(false);
  const [showClassesManager, setShowClassesManager] = useState(false);

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

  const handleAddDebugSubject = async () => {
    const listMock = ['Mathématiques', 'Physique', 'Algorithme', 'Base de données', 'Réseau', 'Anglais'];
    const randomLabel = listMock[Math.floor(Math.random() * listMock.length)];
    const uniqueLabel = `${randomLabel} #${subjects.length + 1}`;

    // On envoie à PostgreSQL via notre action serveur
    const newSubject = await addDebugSubject(uniqueLabel);
    
    setSubjects([...subjects, newSubject]);
  };

const handleAddDebugUser = async () => {
    const listMock = ['a', 'b', 'c', 'd', 'e', 'f'];
    const randomName = listMock[Math.floor(Math.random() * listMock.length)];
    const uniqueName = `${randomName} #${users.length + 1}`;
    const debugMail = `user.${Date.now()}@junia.com`;
    const debugPwd = "pwd";
    const dSn = "oui";

    // On envoie à PostgreSQL via notre action serveur
    const newUser = await addDebugUser(debugMail, debugPwd, uniqueName, dSn, 0);
    
    setUsers([...users, newUser]);
  };

const handleAddDebugStudent = async () => {
    const uniqueName = `user.${Date.now()}`;
    const dSn = "oui";

    // On envoie à PostgreSQL via notre action serveur
    const newStudent = await addDebugStudent(null, uniqueName, dSn);
    
    setStudents([...students, newStudent]);
  };

  return (
    <div className="min-h-screen flex bg-b text-gray-800">

      <nav className="w-64 min-h-screen bg-blue border-r border-gray-200 p-6 flex flex-col gap-3">
        <div className="font-bold text-lg mb-4 text-gray-800">Junia'lytics</div>

        <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg bg-gray-900 text-white font-medium transition-colors">
          Option 1 (Actif)
        </button>
        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 2
        </button>
        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 3
        </button>
        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 4
        </button>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <button 
            onClick={handleAddDebugSubject}
            className="w-full text-center px-4 py-3 border border-dashed border-red-400 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors text-sm"
          >
            Debug : +1 Matière
          </button>
        </div>
        <div className="mt-auto pt-4">
          <button 
            onClick={handleAddDebugUser}
            className="w-full text-center px-4 py-3 border border-dashed border-red-400 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors text-sm"
          >
            Debug : +1 Utilisateur
          </button>
        </div>
        <div className="mt-auto pt-4">
          <button 
            onClick={handleAddDebugStudent}
            className="w-full text-center px-4 py-3 border border-dashed border-red-400 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors text-sm"
          >
            Debug : +1 Etudiant
          </button>
        </div>
      </nav>

      <main className="flex-1 p-10 bg-white overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Matières</h1>
        
        {isLoading ? (
          <p className="text-gray-500 italic">Connexion à PostgreSQL en cours...</p>
        ) : subjects.length === 0 ? (
          <p className="text-gray-500 italic">Aucune matière en base de données. Utilisez le bouton de debug à gauche !</p>
        ) : (
          <div className="flex flex-row flex-wrap items-center justify-center flex-shrink-0 gap-1 border border-black-200 [&>*]:w-[150px] [&>*]:h-[150px] [&>*]:flex [&>*]:flex-shrink-0 [&>*]:items-center [&>*]:justify-center [&>*]:border [&>*]:border-black-200 [&>*]:mt-[2px] [&>*]:mb-[2px]">

            {subjects.map((subject) => (
              <div 
                key={subject.subjectId} 
                className="cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all rounded-md p-4 text-center font-medium shadow-sm"
                onClick={() => setActiveBloc(subject)}
              >
                {subject.label}
              </div>
            ))}

          </div>
        )}
        <div className="mt-12 pt-8 border-t border-slate-200 flex gap-4">
          <button 
            onClick={() => setShowGroupsManager(true)}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            Manage Groups
          </button>
          <button 
            onClick={() => setShowClassesManager(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            Manage Proms
          </button>
        </div>
      </main>

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

      {showGroupsManager && (
        <BlocGroups 
          students={students}
          groups={groups}
          studentAssignments={studentAssignments}
          onClose={() => setShowGroupsManager(false)}
          onRefreshAssignments={refreshAssignments}
        />
      )}

      {showClassesManager && (
        <BlocClasses 
          students={students}
          classes={classes}
          onClose={() => setShowClassesManager(false)}
          onRefreshAssignments={refreshAssignments}
        />
      )}
    </div>
  );
}