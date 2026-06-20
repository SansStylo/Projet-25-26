import { getSerializableUsers } from "../actions";
import UsersTableClient from "./UsersTableClient";

// Composant Serveur Principal
export default async function GestionComptePage() {
  // Récupération des utilisateurs directement depuis la BDD à la construction de la page
  const initialUsers = await getSerializableUsers();

  return (
    <div className="min-h-screen bg-[#F4F7F5] dark:bg-[#050A08] p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#0B1511] rounded-2xl border border-[#E2EAE5] dark:border-emerald-900/30 shadow-sm p-6">
        
        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#F0F4F1] dark:border-emerald-900/30 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#12261E] dark:text-emerald-50">Gestion des Comptes</h1>
            <p className="text-sm text-[#53665A] dark:text-emerald-200/60 mt-1">
              Consultez, modifiez ou supprimez directement les comptes utilisateurs de l'application.
            </p>
          </div>
        </div>

        {/* Tableau interactif client */}
        <UsersTableClient initialUsers={initialUsers} />

      </div>
    </div>
  );
}