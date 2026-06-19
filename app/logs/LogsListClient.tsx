"use client";

import { useState } from "react";
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

  // Fonction pour supprimer un log
  const handleDelete = async (logId: string) => {
    // Demande de confirmation optionnelle
    if (confirm("Voulez-vous vraiment supprimer ce log ?")) {
      // Suppression visuelle immédiate (optimiste)
      setLogs(prev => prev.filter(log => log.logsId !== logId));
      
      // Appel à la base de données
      const res = await deleteLogAction(logId);
      
      if (res.success) {
        router.refresh(); // Met à jour le cache serveur
      } else {
        alert(`Erreur lors de la suppression : ${res.error}`);
        // Si erreur, on pourrait recharger la page pour remettre le log, mais ça devrait aller
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-[#1E2E24]">
        <thead>
          <tr className="border-b border-[#F0F4F1] text-[#53665A] font-semibold">
            <th className="py-3 px-4 w-16">ID</th>
            <th className="py-3 px-4 w-48">Date & Heure</th>
            <th className="py-3 px-4">Événement</th>
            <th className="py-3 px-4 text-center w-16"></th> {/* Colonne pour la croix */}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F1]">
          {logs.map((log) => {
            // On formate la date en un format français très lisible
            const dateObj = new Date(log.date);
            const formattedDate = dateObj.toLocaleDateString("fr-FR", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit", second: "2-digit"
            }).replace(" à", " -"); // ex: "09/06/2026 - 14:30:00"

            return (
              <tr key={log.logsId} className="hover:bg-[#F9FAF9] transition-colors group">
                {/* ID du log */}
                <td className="py-3 px-4 font-mono text-xs text-[#8A9A8E]">
                  #{log.logsId}
                </td>
                {/* Date */}
                <td className="py-3 px-4 text-xs font-medium text-[#53665A]">
                  {formattedDate}
                </td>
                {/* Le message (Label) */}
                <td className="py-3 px-4 text-[#1E2E24]">
                  {log.label}
                </td>
                {/* Bouton Supprimer */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleDelete(log.logsId)}
                    className="text-[#A3B8AC] hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all opacity-50 group-hover:opacity-100"
                    title="Supprimer la ligne"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Message si aucun log n'est présent */}
      {logs.length === 0 && (
        <p className="text-center text-sm text-[#8A9A8E] py-8 italic">
          Aucun événement n'est enregistré dans l'historique.
        </p>
      )}
    </div>
  );
}