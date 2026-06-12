import { getSerializableLogs } from "../actions";
import LogsListClient from "./LogsListClient";

// Composant Serveur Principal
export default async function GestionLogsPage() {
  // Récupération des logs avec la bonne fonction sérialisée
  const initialLogs = await getSerializableLogs();

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E2EAE5] shadow-sm p-6">
        
        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#F0F4F1] pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#12261E]">Historique des Logs</h1>
            <p className="text-sm text-[#53665A] mt-1">
              Consultez les événements système récents ou supprimez-les.
            </p>
          </div>
        </div>

        {/* Tableau client interactif */}
        <LogsListClient initialLogs={initialLogs} />

      </div>
    </div>
  );
}