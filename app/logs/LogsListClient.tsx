"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteLogAction } from "../actions";

interface LogType {
  logsId: string;
  date: string;
  label: string;
}

export default function LogsListClient({ initialLogs }: { initialLogs: LogType[] }) {
  const router = useRouter();
  const [logs, setLogs] = useState<LogType[]>(initialLogs);

  // États pour la sélection
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [logToDelete, setLogToDelete] = useState<LogType | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [searchTerm, setSearchTerm] = useState("");
  const filteredLogs = logs.filter(log => { const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(log.date).toLocaleString("fr-FR").toLowerCase();
    return (
      log.label.toLowerCase().includes(searchLower) || // Recherche dans l'événement
      log.logsId.toString().includes(searchLower) ||   // Recherche dans l'ID
      dateStr.includes(searchLower)                    // Recherche dans la date
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);



  // Effet pour faire disparaître le toast automatiquement
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const getLogBadge = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("créé")) return { color: "bg-green-100 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-300", text: "Création" };
    if (lowerLabel.includes("mis à jour") || lowerLabel.includes("modifié") || lowerLabel.includes("renommé")) return { color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300", text: "Modif." };
    if (lowerLabel.includes("supprimé")) return { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", text: "Suppr." };
    return { color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300", text: "Autre" };
  };

 // Gestion de la sélection
  const toggleSelectAll = () => {
    const pageIds = paginatedLogs.map(l => l.logsId);
  
    // Vérifie si TOUS les items de la page sont déjà sélectionnés
    const allPageSelected = pageIds.every(id => selectedLogIds.includes(id));

    if (allPageSelected) {
      setSelectedLogIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedLogIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };


  const handleDelete = (log: LogType | null) => {
    setLogToDelete(log);
    setShowDeleteConfirm(true);
  };

  // Fonction pour supprimer un log
  const confirmDelete = async () => {
    try {
          if (logToDelete) {
            // Suppression simple
            const res = await deleteLogAction(logToDelete.logsId);
            if (res.success) {
              setLogs(prev => prev.filter(l => l.logsId !== logToDelete.logsId));
              showToast("Log supprimé avec succès.", "success");
            }
          } else {
            // Suppression multiple
            await Promise.all(selectedLogIds.map(id => deleteLogAction(id)));
            setLogs(prev => prev.filter(l => !selectedLogIds.includes(l.logsId)));
            setSelectedLogIds([]);
            showToast(`${selectedLogIds.length} logs supprimés avec succès.`, "success");
          }
          router.refresh();
        } catch (err) {
          showToast("Erreur lors de la suppression.", "error");
        }
        setShowDeleteConfirm(false);
        setLogToDelete(null);
  };

  return (
    <div>
      {/* Barre d'action groupée */}
      {selectedLogIds.length > 0 && (
        <div className="mb-4 p-4 bg-[#F4F7F5] dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl flex items-center justify-between">
          <span className="text-sm font-bold text-[#0F5E3D] dark:text-emerald-400">
            {selectedLogIds.length} élément(s) sélectionné(s)
          </span>
          <button 
            onClick={() => handleDelete(null)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Supprimer la sélection
          </button>
        </div>
      )}
      <div className="mb-6">
        <div className="flex items-center w-full md:w-72 bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-xl px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#047857]/20 focus-within:border-[#047857]">
          {/* Icône de recherche */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A3B8AC] dark:text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full ml-2 bg-transparent text-sm text-[#1E2E24] dark:text-emerald-50 placeholder:text-[#A3B8AC] dark:placeholder:text-emerald-900 focus:outline-none"
          />
        </div>
      </div>
        <table className="w-full border-collapse text-left text-sm text-[#1E2E24] dark:text-emerald-50">
          <thead>
            <tr className="border-b border-[#F0F4F1] dark:border-emerald-900/30 text-[#53665A] dark:text-emerald-200/70 font-semibold">
              <th className="py-3 px-4 w-12 text-center">
                <input type="checkbox" checked={paginatedLogs.length > 0 && paginatedLogs.every(log => selectedLogIds.includes(log.logsId))} onChange={toggleSelectAll} className="accent-[#047857]" />
              </th>
              <th className="py-3 px-4 w-16">ID</th>
              <th className="py-3 px-4 w-48">Date & Heure</th>
              <th className="py-3 px-4 w-28">Type</th>
              <th className="py-3 px-4">Événement</th>
              <th className="py-3 px-4 text-center w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1] dark:divide-emerald-900/20">
            {paginatedLogs.map((log) => {
              const badge = getLogBadge(log.label);
              return (
                <tr key={log.logsId} className={`hover:bg-[#F9FAF9] dark:hover:bg-emerald-900/10 transition-colors ${selectedLogIds.includes(log.logsId) ? 'bg-[#F4F7F5] dark:bg-emerald-900/20' : ''}`}>
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" checked={selectedLogIds.includes(log.logsId)} onChange={() => toggleSelect(log.logsId)} className="accent-[#047857]" />
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#8A9A8E] dark:text-emerald-800">#{log.logsId}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[#53665A] dark:text-emerald-200/70">
                    {new Date(log.date).toLocaleString("fr-FR")}
                  </td>
                  {/* Affichage de la pastille */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#1E2E24] dark:text-emerald-50">{log.label}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => handleDelete(log)} 
                      className="w-8 h-8 inline-flex items-center justify-center text-[#A3B8AC] dark:text-emerald-700 hover:text-red-600 dark:hover:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all cursor-pointer border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                      title="Supprimer définitivement ce log"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      {/* Message si aucun log n'est présent */}
      {logs.length === 0 && (
        <p className="text-center text-sm text-[#8A9A8E] dark:text-emerald-900 py-8 italic">
          Aucun événement n'est enregistré dans l'historique.
        </p>
      )}


      {/* Modale de confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-emerald-900/50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1E2E24] dark:text-white text-center mb-2">
              {logToDelete ? "Supprimer ce log ?" : "Supprimer la sélection ?"}
            </h3>
            <p className="text-sm text-[#53665A] dark:text-emerald-200/70 text-center mb-6">
              {logToDelete 
                ? "Êtes-vous sûr de vouloir supprimer cet événement ?" 
                : `Êtes-vous sûr de vouloir supprimer les ${selectedLogIds.length} événements sélectionnés ?`}
              <br />Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors cursor-pointer">Annuler</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 border-l-4 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[20000] animate-fadeIn transition-all bg-white dark:bg-[#0E1B16] cursor-pointer ${
          toast.type === "error" ? "border-red-500" : toast.type === "success" ? "border-[#10B981]" : "border-[#F97316]"
        }`} onClick={() => setToast(null)}>
          <div className={`p-2 rounded-full ${
              toast.type === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-500" : toast.type === "success" ? "bg-[#E6F4EE] dark:bg-emerald-900/20 text-[#10B981]" : "bg-[#F97316]/10 text-[#F97316]"
            }`}>
            {toast.type === "error" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            ) : toast.type === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            </div>
          <div>
            <h4 className="text-sm font-bold text-[#1E2E24] dark:text-white">{toast.type === "success" ? "Succès" : "Erreur"}</h4>
            <p className="text-xs text-[#53665A] dark:text-emerald-200/70 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6 items-center">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1} 
            className="px-3 py-1 bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed dark:text-emerald-50"
          >Précédent
          </button>
          <span className="text-sm text-[#53665A] dark:text-emerald-200/60">Page {currentPage} / {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages} 
            className="px-3 py-1 bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed dark:text-emerald-50"
          >Suivant
          </button>
        </div>
      )}
    </div>
  );
}