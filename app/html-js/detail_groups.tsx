// detail_groups.tsx
'use client';

import { useState } from 'react';
import { deleteGroup, renameGroup, addGroup, updateStudentAssignments } from '../actions';

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
  students: StudentType[];
  groups: GroupType[];
  studentAssignments: StudentAssignmentsType[];
  onClose: () => void;
  onRefreshAssignments: () => Promise<void>;
}

export default function BlocGroups({ students, groups, studentAssignments, onClose, onRefreshAssignments }: BlocGroupsProps) {
  // --- États pour la CRÉATION ---
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<StudentType[]>([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchCreateChosen, setSearchCreateChosen] = useState(''); // NOUVEAU : Recherche création

  // --- États pour la MODIFICATION (Overlay) ---
  const [editingGroup, setEditingGroup] = useState<GroupType | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupStudents, setEditGroupStudents] = useState<StudentType[]>([]);
  const [searchEditAvailable, setSearchEditAvailable] = useState('');
  const [searchEditChosen, setSearchEditChosen] = useState('');

  const handleOpenEdit = (group: GroupType) => {
    setEditingGroup(group);
    setEditGroupName(group.label);
    setSearchEditAvailable('');
    setSearchEditChosen('');
    
    const memberIds = studentAssignments
      .filter(sa => sa.groupId === group.groupId)
      .map(sa => sa.studentId.toString());
    const currentMembers = students.filter(s => memberIds.includes(s.studentId.toString()));
    
    setEditGroupStudents(currentMembers);
  };

  const handleOpenCreateSelector = () => {
    setSearchAvailable('');
    setSearchCreateChosen('');
    setShowStudentSelector(true);
  };

  const handleSaveModifications = async () => {
    if (!editingGroup) return;

    const trimmedName = editGroupName.trim();
    if (!trimmedName) {
      alert("Le nom du groupe ne peut pas être vide.");
      return;
    }

    if (editGroupStudents.length === 0) {
      alert("Le groupe doit contenir au moins un étudiant.");
      return;
    }

    const nameExists = groups.some(g => g.groupId !== editingGroup.groupId && g.label.toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
      alert(`Le nom "${trimmedName}" est déjà utilisé.`);
      return;
    }

    try {
      if (trimmedName !== editingGroup.label) {
        await renameGroup(editingGroup.groupId, trimmedName);
      }
      
      // Correction de l'erreur de type de la ligne 86 avec Number()
      await updateStudentAssignments(
        editGroupStudents.map(s => s.studentId), 
        Number(editingGroup.groupId)
      );

      await onRefreshAssignments();
      setEditingGroup(null);
      alert("Modifications enregistrées !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async (id: bigint, label: string) => {
    if (confirm(`Supprimer le groupe "${label}" ?`)) {
      await deleteGroup(id);
      await onRefreshAssignments();
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedStudents.length === 0) return;
    try {
      await addGroup(newGroupName.trim(), selectedStudents.map(s => s.studentId));
      await onRefreshAssignments();
      setNewGroupName('');
      setSelectedStudents([]);
      alert("Groupe créé !");
    } catch (e) { 
      alert("Erreur lors de la création"); 
    }
  };

  // --- FILTRAGES DYNAMIQUES (Compactés et Multi-recherches) ---
  const filteredEditAvailableStudents = students.filter(s => {
    const isAlreadyInGroup = editGroupStudents.some(sel => sel.studentId === s.studentId);
    return !isAlreadyInGroup && (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditAvailable.toLowerCase());
  });

  const filteredEditChosenStudents = editGroupStudents.filter(s => 
    (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditChosen.toLowerCase())
  );

  const filteredAvailableStudents = students.filter(s => {
    const isAlreadySelected = selectedStudents.some(sel => sel.studentId === s.studentId);
    return !isAlreadySelected && (s.firstname + ' ' + s.surname).toLowerCase().includes(searchAvailable.toLowerCase());
  });

  // NOUVEAU : Filtrage des choisis à la création
  const filteredCreateChosenStudents = selectedStudents.filter(s =>
    (s.firstname + ' ' + s.surname).toLowerCase().includes(searchCreateChosen.toLowerCase())
  );

  return (
    <div className="absolute w-[95%] h-[95%] inset-0 m-auto bg-slate-100 z-50 p-8 flex flex-col gap-6 rounded-xl shadow-2xl border border-slate-300 overflow-y-auto">
      <button className="absolute right-6 top-6 text-xl font-bold text-red-500 hover:scale-110 transition-transform cursor-pointer" onClick={onClose}>✕</button>
      <h2 className="text-2xl font-bold text-slate-900">Management des Groupes</h2>

      {/* LISTE DES GROUPES EXISTANTS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-pink-600">Groupes existants (Cliquez pour modifier)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(group => {
            const memberCount = studentAssignments.filter(sa => sa.groupId === group.groupId).length;
            return (
              <div 
                key={group.groupId.toString()} 
                onClick={() => handleOpenEdit(group)}
                className="flex justify-between items-center py-2 px-3 bg-slate-50 hover:bg-pink-50/40 hover:border-pink-300 rounded-lg border border-slate-200 cursor-pointer transition-all group"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-800 group-hover:text-pink-700 transition-colors">{group.label}</p>
                  <p className="text-[11px] text-slate-400">{memberCount} membre(s)</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(group.groupId, group.label); }}
                  className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRÉATION DE NOUVEAU GROUPE */}
      <div className="bg-pink-50/60 p-5 rounded-xl border border-pink-100 flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-pink-700">Créer un nouveau groupe</h3>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Nom du groupe..." 
            className="flex-1 p-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button onClick={handleOpenCreateSelector} className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer shadow-sm">
            Étudiants ({selectedStudents.length})
          </button>
          <button disabled={!newGroupName.trim() || selectedStudents.length === 0} onClick={handleCreateGroup} className="px-6 py-2.5 text-sm bg-pink-600 text-white rounded-lg font-bold disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md cursor-pointer">
            Créer
          </button>
        </div>
      </div>

      {/* OVERLAY COMPLET DE MODIFICATION (HAUT ET COMPACT) */}
      {editingGroup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-slate-100 w-full max-w-6xl h-[92vh] rounded-xl flex flex-col p-6 shadow-2xl border border-slate-300 relative">
            
            <div className="flex justify-between items-center border-b border-slate-300 pb-3 mb-4">
              <h3 className="text-xl font-bold text-slate-800">Modifier le groupe : <span className="text-pink-600">{editingGroup.label}</span></h3>
              <button onClick={() => setEditingGroup(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            </div>

            <div className="flex items-center gap-2 mb-4 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Nom :</span>
              <input
                type="text"
                className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500 flex-1 transition-all focus:bg-white"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
              />
            </div>

            {/* GRANDE ZONE DE LISTE DOUBLE DE MODIFICATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
              
              {/* DISPONIBLES (GAUCHE) */}
              <div className="flex flex-col border border-slate-200 rounded-lg p-3 bg-white overflow-hidden shadow-sm">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Étudiants hors du groupe</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 text-[11px]">{filteredEditAvailableStudents.length}</span>
                </span>
                <input
                  type="text"
                  placeholder="Rechercher à ajouter..."
                  className="p-1.5 text-xs border border-slate-200 rounded bg-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={searchEditAvailable}
                  onChange={(e) => setSearchEditAvailable(e.target.value)}
                />
                <div className="overflow-y-auto h-[52vh] space-y-0.5 pr-1 border border-slate-100 rounded p-1 bg-slate-50/40">
                  {filteredEditAvailableStudents.map(s => (
                    <div 
                      key={`edit-avail-${s.studentId.toString()}`} 
                      onClick={() => setEditGroupStudents([...editGroupStudents, s])}
                      className="flex justify-between items-center py-1 px-2 bg-white hover:bg-blue-50 border border-slate-100 rounded transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-medium text-slate-700">{s.firstname} {s.surname}</span>
                      <span className="text-blue-600 font-bold text-[11px] opacity-40 group-hover:opacity-100 transition-opacity">+ Ajouter</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MEMBRES ACTUELS (DROITE) */}
              <div className="flex flex-col border border-pink-100 rounded-lg p-3 bg-pink-50/10 overflow-hidden shadow-sm">
                <span className="font-bold text-xs uppercase tracking-wider text-pink-700 mb-1.5 flex justify-between">
                  <span>Membres du groupe</span>
                  <span className="bg-pink-100 text-pink-700 font-bold px-1.5 py-0.5 rounded text-[11px]">{filteredEditChosenStudents.length}</span>
                </span>
                <input
                  type="text"
                  placeholder="Rechercher à retirer..."
                  className="p-1.5 text-xs border border-pink-200 rounded bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  value={searchEditChosen}
                  onChange={(e) => setSearchEditChosen(e.target.value)}
                />
                <div className="overflow-y-auto h-[52vh] space-y-0.5 pr-1 border border-pink-100/30 rounded p-1 bg-white">
                  {filteredEditChosenStudents.map(s => (
                    <div 
                      key={`edit-member-${s.studentId.toString()}`} 
                      onClick={() => setEditGroupStudents(editGroupStudents.filter(sel => sel.studentId !== s.studentId))}
                      className="flex justify-between items-center py-1 px-2 bg-slate-50 hover:bg-red-50 border border-slate-100 rounded transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-medium text-slate-700">{s.firstname} {s.surname}</span>
                      <span className="text-red-500 font-bold text-[11px] opacity-40 group-hover:opacity-100 transition-opacity">– Retirer</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* FOOTER ACTIONS */}
            <div className="mt-4 border-t border-slate-300 pt-3 flex justify-end gap-2">
              <button onClick={() => setEditingGroup(null)} className="px-4 py-2 text-xs bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold rounded-lg cursor-pointer">
                Annuler
              </button>
              <button onClick={handleSaveModifications} className="px-5 py-2 text-xs bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors cursor-pointer">
                Valider les modifications
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL SÉLECTION ÉTUDIANTS (CRÉATION DE GROUPE) */}
      {showStudentSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl flex flex-col p-5 shadow-2xl border border-slate-200 max-h-[85vh]">
             <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="text-sm font-bold text-slate-800">Sélection (Nouveau Groupe)</h3>
                <button onClick={() => setShowStudentSelector(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
             </div>
             <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                
                {/* DISPONIBLES (GAUCHE) */}
                <div className="flex flex-col border p-3 rounded bg-slate-50 overflow-hidden">
                  <input type="text" placeholder="Filtrer les disponibles..." className="p-1.5 text-xs border rounded bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchAvailable} onChange={(e) => setSearchAvailable(e.target.value)}/>
                  <div className="overflow-y-auto h-[45vh] space-y-0.5">
                    {filteredAvailableStudents.map(s => (
                      <div key={s.studentId.toString()} onClick={() => setSelectedStudents([...selectedStudents, s])} className="flex justify-between items-center py-1 px-2 bg-white border rounded text-xs cursor-pointer hover:bg-blue-50">
                        <span>{s.firstname} {s.surname}</span>
                        <span className="text-blue-600 font-bold">+</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SÉLECTIONNÉS (DROITE avec NOUVELLE BARRE DE RECHERCHE) */}
                <div className="flex flex-col border p-3 rounded bg-blue-50/30 overflow-hidden">
                  <span className="text-xs font-bold mb-1 text-blue-700 flex justify-between">
                    <span>Sélectionnés</span>
                    <span>{selectedStudents.length}</span>
                  </span>
                  <input type="text" placeholder="Filtrer les sélectionnés..." className="p-1.5 text-xs border rounded bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchCreateChosen} onChange={(e) => setSearchCreateChosen(e.target.value)}/>
                  <div className="overflow-y-auto h-[45vh] space-y-0.5">
                    {filteredCreateChosenStudents.map(s => (
                      <div key={s.studentId.toString()} onClick={() => setSelectedStudents(selectedStudents.filter(sel => sel.studentId !== s.studentId))} className="flex justify-between items-center py-1 px-2 bg-white border rounded text-xs cursor-pointer hover:bg-red-50">
                        <span>{s.firstname} {s.surname}</span>
                        <span className="text-red-500 font-bold">–</span>
                      </div>
                    ))}
                  </div>
                </div>

             </div>
             <div className="mt-4 pt-2 border-t flex justify-end">
               <button onClick={() => setShowStudentSelector(false)} className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-lg cursor-pointer">Confirmer</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}