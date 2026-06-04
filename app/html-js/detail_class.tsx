// detail_class.tsx
'use client';

import { useState } from 'react';
import { deleteClass, renameClass, addClass, updateStudentClass } from '../actions';

interface StudentType {
  studentId: bigint;
  firstname: string;
  surname: string;
  classId: number | null;
}

interface ClassesType {
  classId: number;
  label: string;
}

interface BlocClassesProps {
  students: StudentType[];
  classes: ClassesType[];
  onClose: () => void;
  onRefreshAssignments: () => Promise<void>;
}

export default function BlocClasses({ students, classes, onClose, onRefreshAssignments }: BlocClassesProps) {
  // --- États pour la CRÉATION ---
  const [newClassName, setNewClassName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<StudentType[]>([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchCreateChosen, setSearchCreateChosen] = useState('');

  // --- États pour la MODIFICATION (Overlay complet) ---
  const [editingClass, setEditingClass] = useState<ClassesType | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassStudents, setEditClassStudents] = useState<StudentType[]>([]);
  const [searchEditAvailable, setSearchEditAvailable] = useState('');
  const [searchEditChosen, setSearchEditChosen] = useState('');

  const handleOpenEdit = (classe: ClassesType) => {
    setEditingClass(classe);
    setEditClassName(classe.label);
    setSearchEditAvailable('');
    setSearchEditChosen('');
    
    // Récupère les étudiants dont le classId correspond à la classe cliquée
    const currentMembers = students.filter(s => s.classId === classe.classId);
    setEditClassStudents(currentMembers);
  };

  const handleOpenCreateSelector = () => {
    setSearchAvailable('');
    setSearchCreateChosen('');
    setShowStudentSelector(true);
  };

  const handleSaveModifications = async () => {
    if (!editingClass) return;

    const trimmedName = editClassName.trim();
    if (!trimmedName) {
      alert("Le nom de la classe ne peut pas être vide.");
      return;
    }

    const nameExists = classes.some(c => c.classId !== editingClass.classId && c.label.toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
      alert(`Le nom "${trimmedName}" est déjà affecté à une autre promotion.`);
      return;
    }

    try {
      if (trimmedName !== editingClass.label) {
        await renameClass(editingClass.classId, trimmedName);
      }
      
      // Utilisation de la bonne action du projet : updateStudentClass
      await updateStudentClass(
        editClassStudents.map(s => s.studentId), 
        editingClass.classId
      );

      await onRefreshAssignments();
      setEditingClass(null);
      alert("Modifications de la promotion enregistrées !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour de la promotion.");
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (confirm(`Supprimer la classe/promo "${label}" ?`)) {
      await deleteClass(id);
      await onRefreshAssignments();
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim() || selectedStudents.length === 0) return;
    try {
      await addClass(newClassName.trim(), selectedStudents.map(s => s.studentId));
      await onRefreshAssignments();
      setNewClassName('');
      setSelectedStudents([]);
      alert("Classe créée avec succès !");
    } catch (e) { 
      alert("Erreur lors de la création"); 
    }
  };

  // --- FILTRAGES DYNAMIQUES COMPACTS ---
  const filteredEditAvailableStudents = students.filter(s => {
    const isAlreadyInClass = editClassStudents.some(sel => sel.studentId === s.studentId);
    return !isAlreadyInClass && (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditAvailable.toLowerCase());
  });

  const filteredEditChosenStudents = editClassStudents.filter(s => 
    (s.firstname + ' ' + s.surname).toLowerCase().includes(searchEditChosen.toLowerCase())
  );

  const filteredAvailableStudents = students.filter(s => {
    const isAlreadySelected = selectedStudents.some(sel => sel.studentId === s.studentId);
    return !isAlreadySelected && (s.firstname + ' ' + s.surname).toLowerCase().includes(searchAvailable.toLowerCase());
  });

  const filteredCreateChosenStudents = selectedStudents.filter(s =>
    (s.firstname + ' ' + s.surname).toLowerCase().includes(searchCreateChosen.toLowerCase())
  );

  return (
    <div className="absolute w-[95%] h-[95%] inset-0 m-auto bg-slate-100 z-40 p-8 flex flex-col gap-6 rounded-xl shadow-2xl border border-slate-300 overflow-y-auto">
      <button className="absolute right-6 top-6 text-xl font-bold text-red-500 hover:scale-110 transition-transform cursor-pointer" onClick={onClose}>✕</button>
      <h2 className="text-2xl font-bold text-slate-900">Management des Classes & Promotions</h2>

      {/* LISTE DES CLASSES EXISTANTES */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-purple-600">Classes existantes (Cliquez pour modifier)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map(classe => {
            const memberCount = students.filter(s => s.classId === classe.classId).length;
            return (
              <div 
                key={classe.classId.toString()} 
                onClick={() => handleOpenEdit(classe)}
                className="flex justify-between items-center py-2 px-3 bg-slate-50 hover:bg-purple-50/40 hover:border-purple-300 rounded-lg border border-slate-200 cursor-pointer transition-all group"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-800 group-hover:text-purple-700 transition-colors">{classe.label}</p>
                  <p className="text-[11px] text-slate-400">{memberCount} étudiant(s)</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(classe.classId, classe.label); }}
                  className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRÉATION DE NOUVELLE CLASSE */}
      <div className="bg-purple-50/60 p-5 rounded-xl border border-purple-100 flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700">Créer une nouvelle classe</h3>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Nom de la classe (Ex: B1 Cyber)..." 
            className="flex-1 p-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
          <button onClick={handleOpenCreateSelector} className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer shadow-sm">
            Étudiants ({selectedStudents.length})
          </button>
          <button disabled={!newClassName.trim() || selectedStudents.length === 0} onClick={handleCreateClass} className="px-6 py-2.5 text-sm bg-purple-600 text-white rounded-lg font-bold disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md cursor-pointer">
            Créer
          </button>
        </div>
      </div>

      {/* OVERLAY COMPLET DE MODIFICATION DE CLASSE (HAUT ET COMPACT) */}
      {editingClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-slate-100 w-full max-w-6xl h-[92vh] rounded-xl flex flex-col p-6 shadow-2xl border border-slate-300 relative">
            
            <div className="flex justify-between items-center border-b border-slate-300 pb-3 mb-4">
              <h3 className="text-xl font-bold text-slate-800">Modifier la promo : <span className="text-purple-600">{editingClass.label}</span></h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            </div>

            <div className="flex items-center gap-2 mb-4 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Nom :</span>
              <input
                type="text"
                className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 transition-all focus:bg-white"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
              />
            </div>

            {/* DOUBLE LISTE TALL & COMPACT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
              
              {/* DISPONIBLES (GAUCHE) */}
              <div className="flex flex-col border border-slate-200 rounded-lg p-3 bg-white overflow-hidden shadow-sm">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Étudiants disponibles (Hors Promo)</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 text-[11px]">{filteredEditAvailableStudents.length}</span>
                </span>
                <input
                  type="text"
                  placeholder="Rechercher à rajouter à la promo..."
                  className="p-1.5 text-xs border border-slate-200 rounded bg-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={searchEditAvailable}
                  onChange={(e) => setSearchEditAvailable(e.target.value)}
                />
                <div className="overflow-y-auto h-[52vh] space-y-0.5 pr-1 border border-slate-100 rounded p-1 bg-slate-50/40">
                  {filteredEditAvailableStudents.map(s => (
                    <div 
                      key={`class-avail-${s.studentId.toString()}`} 
                      onClick={() => setEditClassStudents([...editClassStudents, s])}
                      className="flex justify-between items-center py-1 px-2 bg-white hover:bg-blue-50 border border-slate-100 rounded transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-medium text-slate-700">{s.firstname} {s.surname}</span>
                      <span className="text-blue-600 font-bold text-[11px] opacity-40 group-hover:opacity-100 transition-opacity">+ Assigner</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* INSCRITS DANS LA PROMO ACTUELLE (DROITE) */}
              <div className="flex flex-col border border-purple-100 rounded-lg p-3 bg-purple-50/10 overflow-hidden shadow-sm">
                <span className="font-bold text-xs uppercase tracking-wider text-purple-700 mb-1.5 flex justify-between">
                  <span>Étudiants inscrits</span>
                  <span className="bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded text-[11px]">{filteredEditChosenStudents.length}</span>
                </span>
                <input
                  type="text"
                  placeholder="Rechercher à désassigner..."
                  className="p-1.5 text-xs border border-purple-200 rounded bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  value={searchEditChosen}
                  onChange={(e) => setSearchEditChosen(e.target.value)}
                />
                <div className="overflow-y-auto h-[52vh] space-y-0.5 pr-1 border border-purple-100/30 rounded p-1 bg-white">
                  {filteredEditChosenStudents.map(s => (
                    <div 
                      key={`class-member-${s.studentId.toString()}`} 
                      onClick={() => setEditClassStudents(editClassStudents.filter(sel => sel.studentId !== s.studentId))}
                      className="flex justify-between items-center py-1 px-2 bg-slate-50 hover:bg-red-50 border border-slate-100 rounded transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-medium text-slate-700">{s.firstname} {s.surname}</span>
                      <span className="text-red-500 font-bold text-[11px] opacity-40 group-hover:opacity-100 transition-opacity">– Retirer</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* FOOTER ACTIONS MODIFICATION */}
            <div className="mt-4 border-t border-slate-300 pt-3 flex justify-end gap-2">
              <button onClick={() => setEditingClass(null)} className="px-4 py-2 text-xs bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold rounded-lg cursor-pointer">
                Annuler
              </button>
              <button onClick={handleSaveModifications} className="px-5 py-2 text-xs bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors cursor-pointer">
                Valider les modifications
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SÉLECTEUR POUR LA CRÉATION DE PROMO */}
      {showStudentSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl flex flex-col p-5 shadow-2xl border border-slate-200 max-h-[85vh]">
             <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="text-sm font-bold text-slate-800">Sélection (Nouvelle Promotion)</h3>
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

                {/* SÉLECTIONNÉS (DROITE AVEC LA RECHERCHE EN CRÉATION) */}
                <div className="flex flex-col border p-3 rounded bg-purple-50/30 overflow-hidden">
                  <span className="text-xs font-bold mb-1 text-purple-700 flex justify-between">
                    <span>Sélectionnés</span>
                    <span>{selectedStudents.length}</span>
                  </span>
                  <input type="text" placeholder="Filtrer les sélectionnés..." className="p-1.5 text-xs border rounded bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500" value={searchCreateChosen} onChange={(e) => setSearchCreateChosen(e.target.value)}/>
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