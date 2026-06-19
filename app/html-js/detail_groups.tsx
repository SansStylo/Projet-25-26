'use client';

import { useState } from 'react';
import { deleteGroup, renameGroup, updateStudentAssignments } from '../actions';

interface StudentType {
  studentId: bigint;
  firstname: string;
  surname: string;
  classId: number | null;
}

interface GroupType {
  groupId: bigint;
  label: string;
}

interface StudentAssignmentsType {
  studentId: bigint;
  groupId: bigint;
}

interface BlocGroupsProps {
  currentGroup: GroupType;
  students: StudentType[];
  studentAssignments: StudentAssignmentsType[];
  onClose: () => void;
  onRefreshAssignments: () => Promise<void>;
}

export default function BlocGroups({ currentGroup, students, studentAssignments, onClose, onRefreshAssignments }: BlocGroupsProps) {
 
  const [editGroupName, setEditGroupName] = useState(currentGroup.label);
  const [editGroupStudents, setEditGroupStudents] = useState<StudentType[]>(() => {
    const memberIds = studentAssignments
      .filter(sa => sa.groupId === currentGroup.groupId)
      .map(sa => sa.studentId.toString());
    return students.filter(s => memberIds.includes(s.studentId.toString()));
  });

  const [searchEditAvailable, setSearchEditAvailable] = useState('');
  const [searchEditChosen, setSearchEditChosen] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveModifications = async () => {
    try {
      if (editGroupName.trim() !== currentGroup.label) {
        await renameGroup(currentGroup.groupId, editGroupName.trim());
      }
      await updateStudentAssignments(
        editGroupStudents.map(s => s.studentId), 
        Number(currentGroup.groupId)
      );
      await onRefreshAssignments();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async () => {
    await deleteGroup(currentGroup.groupId);
    await onRefreshAssignments();
    onClose();
  };

  const filteredEditAvailableStudents = students.filter(s => {
    const isAlreadyInGroup = editGroupStudents.some(sel => sel.studentId === s.studentId);
    return !isAlreadyInGroup && (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditAvailable.toLowerCase());
  });

  const filteredEditChosenStudents = editGroupStudents.filter(s => 
    (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditChosen.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-6 md:p-10 animate-fade-in">
      <div className="bg-[#F8FAFC] w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-[#E2EAE5] overflow-hidden relative">
        
        {/* HEADER */}
        <div className="w-full bg-white px-8 py-5 border-b border-[#E2EAE5] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#1E2E24] tracking-tight">{currentGroup.label}</h2>
            <p className="text-xs text-[#53665A] font-medium mt-0.5">Configuration du groupe</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowDeleteConfirm(true)} 
            className="px-3 py-1.5 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-100 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              Supprimer
            </button>
            <button onClick={onClose} 
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
        </div>

        {/* CORPS */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2EAE5]">
            <label className="text-xs font-bold text-[#1E2E24] uppercase tracking-wider">Nom du groupe</label>
            <input 
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-sm border border-[#E2EAE5] rounded-xl focus:ring-2 focus:ring-[#0F5E3D]/10 focus:border-[#0F5E3D]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
             <div className="bg-white p-4 rounded-2xl border border-[#E2EAE5] flex flex-col shadow-sm">
               <span className="font-bold text-[#1E2E24] text-xs uppercase tracking-wider mb-2">Disponibles ({filteredEditAvailableStudents.length})</span>
               <input placeholder="Filtrer..." className="mb-2 px-3 py-2 text-xs border rounded-xl bg-slate-50" value={searchEditAvailable} onChange={(e) => setSearchEditAvailable(e.target.value)} />
               <div className="flex-1 overflow-y-auto space-y-1">
                 {filteredEditAvailableStudents.map(s => (
                   <div key={s.studentId.toString()} onClick={() => setEditGroupStudents([...editGroupStudents, s])} className="p-2.5 text-sm bg-white border border-[#E2EAE5] rounded-xl cursor-pointer hover:bg-slate-50 flex justify-between items-center shadow-3xs">
                     {s.firstname} {s.surname} <span className="text-[#0F5E3D] font-bold text-xs">+</span>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="bg-white p-4 rounded-2xl border border-[#E2EAE5] flex flex-col shadow-sm">
               <span className="font-bold text-[#0F5E3D] text-xs uppercase tracking-wider mb-2">Membres actuels ({filteredEditChosenStudents.length})</span>
               <input placeholder="Filtrer..." className="mb-2 px-3 py-2 text-xs border rounded-xl bg-slate-50" value={searchEditChosen} onChange={(e) => setSearchEditChosen(e.target.value)} />
               <div className="flex-1 overflow-y-auto space-y-1">
                 {filteredEditChosenStudents.map(s => (
                   <div key={s.studentId.toString()} onClick={() => setEditGroupStudents(editGroupStudents.filter(sel => sel.studentId !== s.studentId))} className="p-2.5 text-sm bg-slate-50 border border-[#E2EAE5] rounded-xl cursor-pointer hover:bg-red-50 flex justify-between items-center shadow-3xs">
                     {s.firstname} {s.surname} <span className="text-red-500 font-bold text-xs">–</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-white shrink-0">
          <button onClick={handleSaveModifications} className="w-full py-3 bg-[#0F5E3D] text-white font-bold rounded-xl hover:bg-[#0A4A31]">
             Valider les modifications
          </button>
        </div>
      </div>

      {/* MODALE SUPPRESSION */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-6">
           <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1E2E24] mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-[#53665A] mb-6">Êtes-vous sûr de vouloir supprimer le groupe "<strong>{currentGroup.label}</strong>" ? Cette action est irréversible.</p>
              <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} 
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold cursor-pointer">
                    Annuler
                  </button>
                 <button onClick={handleDelete} 
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer">
                  Supprimer
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}