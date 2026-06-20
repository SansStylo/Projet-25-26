"use client";

import { useState, useEffect } from 'react';
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      showToast("Modifications enregistrées", "success");

      setTimeout(() => {
      onClose();
    }, 1500);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la sauvegarde.", "error");
    }
  };

  const handleDelete = async () => {
    await deleteGroup(currentGroup.groupId);
    await onRefreshAssignments();
    showToast("Groupe supprimé avec succès", "success");
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const filteredEditAvailableStudents = students.filter(s => {
    const isAlreadyInGroup = editGroupStudents.some(sel => sel.studentId === s.studentId);
    return !isAlreadyInGroup && (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditAvailable.toLowerCase());
  });

  const filteredEditChosenStudents = editGroupStudents.filter(s => 
    (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditChosen.toLowerCase())
  );

  useEffect(() => {
        if (toast) {
          const timer = setTimeout(() => setToast(null), 3000);
          return () => clearTimeout(timer);
        }
      }, [toast]);
    
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 md:p-10 animate-fade-in">
      <div className="bg-[#F8FAFC] dark:bg-[#050A08] w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-[#E2EAE5] dark:border-emerald-900/50 overflow-hidden relative transition-colors duration-300">
        
        {/* HEADER */}
        <div className="w-full bg-white dark:bg-[#0B1511] px-8 py-5 border-b border-[#E2EAE5] dark:border-emerald-900/30 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#1E2E24] dark:text-emerald-50 tracking-tight">{currentGroup.label}</h2>
            <p className="text-xs text-[#53665A] dark:text-emerald-200/60 font-medium mt-0.5">Configuration du groupe</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowDeleteConfirm(true)} 
            className="px-3 py-1.5 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/30 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
            <button onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-[#F4F7F5] dark:bg-emerald-900/20 hover:bg-red-50 dark:hover:bg-red-900/20 text-[#53665A] dark:text-emerald-200 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all cursor-pointer font-bold border border-[#E2EAE5] dark:border-emerald-800">
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
          <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30">
            <label className="text-xs font-bold text-[#1E2E24] dark:text-emerald-50 uppercase tracking-wider">Nom du groupe</label>
            <input 
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-sm border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-white dark:bg-[#0E1B16] dark:text-emerald-50 focus:ring-2 focus:ring-[#0F5E3D]/10 focus:border-[#0F5E3D]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
             <div className="bg-white dark:bg-[#0B1511] p-4 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 flex flex-col shadow-sm">
               <span className="font-bold text-[#1E2E24] dark:text-emerald-50 text-xs uppercase tracking-wider mb-2">Disponibles ({filteredEditAvailableStudents.length})</span>
               <input placeholder="Filtrer..." className="mb-2 px-3 py-2 text-xs border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-slate-50 dark:bg-[#0E1B16] dark:text-emerald-50" value={searchEditAvailable} onChange={(e) => setSearchEditAvailable(e.target.value)} />
               <div className="flex-1 overflow-y-auto space-y-1">
                 {filteredEditAvailableStudents.map(s => (
                   <div key={s.studentId.toString()} onClick={() => setEditGroupStudents([...editGroupStudents, s])} className="p-2.5 text-sm bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-emerald-900/20 flex justify-between items-center shadow-3xs dark:text-emerald-50">
                     {s.firstname} {s.surname} <span className="text-[#0F5E3D] dark:text-emerald-400 font-bold text-xs">+</span>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="bg-white dark:bg-[#0B1511] p-4 rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 flex flex-col shadow-sm">
               <span className="font-bold text-[#0F5E3D] dark:text-emerald-400 text-xs uppercase tracking-wider mb-2">Membres actuels ({filteredEditChosenStudents.length})</span>
               <input placeholder="Filtrer..." className="mb-2 px-3 py-2 text-xs border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl bg-slate-50 dark:bg-[#0E1B16] dark:text-emerald-50" value={searchEditChosen} onChange={(e) => setSearchEditChosen(e.target.value)} />
               <div className="flex-1 overflow-y-auto space-y-1">
                 {filteredEditChosenStudents.map(s => (
                   <div key={s.studentId.toString()} onClick={() => setEditGroupStudents(editGroupStudents.filter(sel => sel.studentId !== s.studentId))} className="p-2.5 text-sm bg-slate-50 dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 flex justify-between items-center shadow-3xs dark:text-emerald-50">
                     {s.firstname} {s.surname} <span className="text-red-500 font-bold text-xs">–</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-[#E2EAE5] dark:border-emerald-900/30 bg-white dark:bg-[#0E1B16] shrink-0">
          <button onClick={handleSaveModifications} className="w-full py-3 bg-[#0F5E3D] dark:bg-emerald-800 text-white font-bold rounded-xl hover:bg-[#0A4A31] dark:hover:bg-emerald-700 transition-colors cursor-pointer">
              Valider les modifications
          </button>
        </div>
      </div>

      {/* MODALE SUPPRESSION */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
           <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-emerald-900/50">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1E2E24] dark:text-white mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-[#53665A] dark:text-emerald-200/70 mb-6">Êtes-vous sûr de vouloir supprimer le groupe "<strong>{currentGroup.label}</strong>" ? Cette action est irréversible.</p>
              <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} 
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold cursor-pointer">
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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 border-l-4 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[20000] animate-fadeIn transition-all bg-white dark:bg-[#0E1B16] cursor-pointer ${
          toast.type === "error" ? "border-red-500" : "border-[#10B981]"
        }`} onClick={() => setToast(null)}>
          <div className={`p-2 rounded-full ${toast.type === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-[#E6F4EE] dark:bg-emerald-900/20 text-[#10B981]"}`}>
            {/* Icône succès ou erreur */}
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