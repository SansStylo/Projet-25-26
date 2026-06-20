"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction, deleteUserAction, createUserAction } from "../actions";

interface UserType {
  userId: string;
  firstname: string;
  surname: string;
  mail: string;
  level?: number;
}

export default function UsersTableClient({ initialUsers }: { initialUsers: UserType[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>(initialUsers);

  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  // États pour le formulaire de création de compte
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFirstname, setNewFirstname] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newMail, setNewMail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sortField, setSortField] = useState<"firstname" | "surname" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [newLevel, setNewLevel] = useState<number>(0);


  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer); // Annule le timer si le composant est démonté
    }
  }, [toast]);

  // Fonction pour afficher le toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const ACCESS_LEVELS = [
  { value: 2, label: "Admin" },
  { value: 1, label: "Responsable" },
  { value: 0, label: "Enseignant" },
];

  // Nouveaux mots de passe en attente de validation, par utilisateur (vide = inchangé)
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});

  // Gérer le changement de texte dans les lignes du tableau
  const handleInputChange = (userId: string, field: keyof UserType, value: string | number) => {
    const newValue = field === 'level' ? Number(value) : value;
    console.log(`Changement détecté pour ${userId} : champ ${field} devient ${newValue}`); // <--- AJOUTE ÇA
    setUsers(prev =>
      prev.map(user => (user.userId === userId ? { ...user, [field]: newValue } : user))
  );
  };

  // Gérer la saisie d'un nouveau mot de passe pour une ligne
  const handlePasswordInputChange = (userId: string, value: string) => {
    setNewPasswords(prev => ({ ...prev, [userId]: value }));
  };

  // Sauvegarder la ligne modifiée
  const handleSave = async (user: UserType) => {
    const newPwd = newPasswords[user.userId]?.trim();

    const res = await updateUserAction(user.userId, {
      firstname: user.firstname,
      surname: user.surname,
      mail: user.mail,
      level: user.level,
      ...(newPwd ? { password: newPwd } : {}),
    });

    if (res.success) {
      showToast(`Le compte de ${user.firstname} a été mis à jour avec succès !`, 'success');
      if (newPwd) {
        setNewPasswords(prev => ({ ...prev, [user.userId]: "" }));
      }
      router.refresh();
    } else {
      showToast(`Erreur : ${res.error}`, 'error');
    }
  };

  // Supprimer un compte 
  const handleDelete = (user: UserType) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };
  // Fonction pour exécuter la suppression (appelée par le bouton de la modale)
  const confirmDelete = async () => {
    if (!userToDelete) return;
    const res = await deleteUserAction(userToDelete.userId.toString());
    if (res.success) {
      setUsers(prev => prev.filter(u => u.userId !== userToDelete.userId));
      router.refresh();
      showToast("Le compte a été supprimé avec succès.", "success");
    } else {
      showToast(`Erreur lors de la suppression : ${res.error}`, "error");
    }
    // Fermeture et reset
    setShowDeleteConfirm(false);  
    setUserToDelete(null);
  };

  // Soumettre la création d'un compte
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!newFirstname || !newSurname || !newMail || !newPassword) {
      showToast("Veuillez remplir tous les champs.", "error");
      return;
    }

    const res = await createUserAction({
      firstname: newFirstname,
      surname: newSurname,
      mail: newMail,
      password: newPassword,
      level: newLevel
    });

    if (res.success) {
      const newUser: UserType = {
        userId: res.userId || Math.random().toString(), 
        firstname: newFirstname,
        surname: newSurname,
        mail: newMail,
        level: newLevel // Ou la valeur par défaut
      };
      
      setUsers(prev => [...prev, newUser]);
      
      showToast("Compte créé avec succès !", "success");
      // Réinitialiser le formulaire
      setNewFirstname("");
      setNewSurname("");
      setNewMail("");
      setNewPassword("");
      setNewLevel(0);
      setShowCreateForm(false);
      
      // Forcer le rafraîchissement des données serveur
      router.refresh(); 
    } else {
      showToast(`Erreur lors de la création : ${res.error}`, "error");
    }
    setHasAttemptedSubmit(false);
  };

  const handleSort = (field: "firstname" | "surname") => {
    if (sortField !== field) {
      // Étape 1 : Si on change de colonne, on commence par trier de A à Z
      setSortField(field);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      // Étape 2 : Deuxième clic sur la même colonne -> On passe de Z à A
      setSortDirection("desc");
    } else {
      // Étape 3 : Troisième clic -> On réinitialise tout à l'état initial (Sans tri)
      setSortField(null);
      setSortDirection(null);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortField || !sortDirection) return 0; // 🌟 Si sortDirection est null, on garde l'ordre initial BDD

    const valueA = a[sortField].toLowerCase();
    const valueB = b[sortField].toLowerCase();

    if (sortDirection === "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  return (
    <div>
      {/* Bouton pour afficher/masquer le formulaire de création */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-[#047857] hover:bg-[#065f46] text-white font-medium py-2 px-4 rounded-xl transition duration-150 shadow-sm text-sm"
        >
          {showCreateForm ? "Annuler la création" : "+ Créer un nouveau compte"}
        </button>
      </div>

      {/* Formulaire de création masquable */}
      {showCreateForm && (
        <form onSubmit={handleCreateUser} className="bg-[#F4F7F5] dark:bg-[#0B1511] border border-[#E2EAE5] dark:border-emerald-900/30 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#53665A] dark:text-emerald-200/70 mb-1">Prénom</label>
            <input
              type="text"
              value={newFirstname}
              onChange={(e) => setNewFirstname(e.target.value)}
              className={`w-full bg-white dark:bg-[#0E1B16] border rounded-lg p-2 text-sm dark:text-emerald-50 focus:outline-none ${
                hasAttemptedSubmit && !newFirstname 
                  ? 'border-red-500' 
                  : 'border-[#E2EAE5] dark:border-emerald-900/50 focus:border-[#047857]'
              }`}
              placeholder="Jean"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#53665A] dark:text-emerald-200/70 mb-1">Nom</label>
            <input
              type="text"
              value={newSurname}
              onChange={(e) => setNewSurname(e.target.value)}
              className={`w-full bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-lg p-2 text-sm dark:text-emerald-50 focus:outline-none ${
                hasAttemptedSubmit && !newSurname 
                  ? 'border-red-500' 
                  : 'border-[#E2EAE5] dark:border-emerald-900/50 focus:border-[#047857]'
              }`}
              placeholder="Dupont"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#53665A] dark:text-emerald-200/70 mb-1">Email</label>
            <input
              type="email"
              value={newMail}
              onChange={(e) => setNewMail(e.target.value)}
              className={`w-full bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-lg p-2 text-sm dark:text-emerald-50 focus:outline-none ${
                hasAttemptedSubmit && !newMail 
                  ? 'border-red-500' 
                  : 'border-[#E2EAE5] dark:border-emerald-900/50 focus:border-[#047857]'
              }`}
              placeholder="j.dupont@mail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#53665A] dark:text-emerald-200/70 mb-1">Mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-lg p-2 text-sm dark:text-emerald-50 focus:outline-none ${
                hasAttemptedSubmit && !newPassword 
                  ? 'border-red-500' 
                  : 'border-[#E2EAE5] dark:border-emerald-900/50 focus:border-[#047857]'
              }`}
              placeholder="Mot de passe sécurisé"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#53665A] dark:text-emerald-200/70 mb-1">Accès</label>
            <select 
              value={newLevel} 
              onChange={(e) => setNewLevel(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-lg p-2 text-sm dark:text-emerald-50 focus:border-[#047857] outline-none"
            >
              {ACCESS_LEVELS.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#12261E] dark:bg-emerald-900 hover:bg-[#065f46] text-white font-medium py-2 px-4 rounded-lg transition duration-150 text-sm"
          >
            Enregistrer le compte
          </button>
        </form>
      )}

      {/* Liste des comptes en lignes éditables */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-[#1E2E24] dark:text-emerald-50">
          <thead>
            <tr className="border-b border-[#F0F4F1] dark:border-emerald-900/30 text-[#53665A] dark:text-emerald-200/70 font-semibold">
              <th className="py-3 px-2 w-12">ID</th>
              <th title='Trier' onClick={() => handleSort("firstname")} className="py-3 px-2 cursor-pointer hover:text-[#047857] dark:hover:text-emerald-400 select-none transition-colors group/th">
                <div className="flex items-center gap-1">
                  <span>Prénom</span>
                  <span className="text-[10px] text-[#A3B8AC] group-hover/th:text-[#047857]">
                    {sortField === "firstname" && sortDirection === "asc" ? " ▲" : sortField === "firstname" && sortDirection === "desc" ? " ▼" : " ↕"}
                  </span>
                </div>
              </th>
              <th title='Trier' onClick={() => handleSort("surname")} className="py-3 px-2 cursor-pointer hover:text-[#047857] dark:hover:text-emerald-400 select-none transition-colors group/th">
                <div className="flex items-center gap-1">
                <span>Nom</span>
                <span className="text-[10px] text-[#A3B8AC] group-hover/th:text-[#047857] ">
                  {sortField === "surname" && sortDirection === "asc" ? " ▲" : sortField === "surname" && sortDirection === "desc" ? " ▼" : " ↕"}
                </span>
                </div>
               </th>
               <th className="py-3 px-2">Email</th>
               <th className="py-3 px-2">Nouveau mot de passe</th>
               <th className="py-3 px-2">Accès</th>
               <th className="py-3 px-2 text-center w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1] dark:divide-emerald-900/20">
            {sortedUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-[#F9FAF9] dark:hover:bg-emerald-900/10 transition-colors">
                {/* ID non modifiable (Label grisé) */}
                <td className="py-3 px-2 font-mono text-xs text-[#8A9A8E] dark:text-emerald-700">
                  {user.userId}
                </td>
                
                {/* Zone de texte Prénom */}
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={user.firstname}
                    onChange={(e) => handleInputChange(user.userId, "firstname", e.target.value)}
                    className="w-full bg-transparent hover:bg-white dark:hover:bg-[#0E1B16] focus:bg-white dark:focus:bg-[#0E1B16] border border-transparent hover:border-[#E2EAE5] dark:hover:border-emerald-900 focus:border-[#047857] rounded px-2 py-1 transition-all dark:text-emerald-50"
                  />
                </td>

                {/* Zone de texte Nom */}
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={user.surname}
                    onChange={(e) => handleInputChange(user.userId, "surname", e.target.value)}
                    className="w-full bg-transparent hover:bg-white dark:hover:bg-[#0E1B16] focus:bg-white dark:focus:bg-[#0E1B16] border border-transparent hover:border-[#E2EAE5] dark:hover:border-emerald-900 focus:border-[#047857] rounded px-2 py-1 transition-all dark:text-emerald-50"
                  />
                </td>

                {/* Zone de texte Mail */}
                <td className="py-2 px-2">
                  <input
                    type="email"
                    value={user.mail}
                    onChange={(e) => handleInputChange(user.userId, "mail", e.target.value)}
                    className="w-full bg-transparent hover:bg-white dark:hover:bg-[#0E1B16] focus:bg-white dark:focus:bg-[#0E1B16] border border-transparent hover:border-[#E2EAE5] dark:hover:border-emerald-900 focus:border-[#047857] rounded px-2 py-1 transition-all dark:text-emerald-50"
                  />
                </td>

                {/* Zone de texte Nouveau mot de passe (vide = inchangé) */}
                <td className="py-2 px-2">
                  <input
                    type="password"
                    value={newPasswords[user.userId] ?? ""}
                    onChange={(e) => handlePasswordInputChange(user.userId, e.target.value)}
                    placeholder="Laisser vide pour ne pas changer"
                    autoComplete="new-password"
                    className="w-full bg-transparent hover:bg-white dark:hover:bg-[#0E1B16] focus:bg-white dark:focus:bg-[#0E1B16] border border-transparent hover:border-[#E2EAE5] dark:hover:border-emerald-900 focus:border-[#047857] rounded px-2 py-1 transition-all text-xs dark:text-emerald-50"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={user.level}
                    onChange={(e) => handleInputChange(user.userId, "level", e.target.value)}
                    className="w-full bg-transparent hover:bg-white dark:hover:bg-[#0E1B16] focus:bg-white dark:focus:bg-[#0E1B16] border border-transparent hover:border-[#E2EAE5] dark:hover:border-emerald-900 focus:border-[#047857] rounded px-2 py-1 transition-all cursor-pointer text-sm dark:text-emerald-50"
                  >
                  {ACCESS_LEVELS.map(lvl => (
                    <option key={lvl.value} value={lvl.value} className="dark:bg-[#0E1B16]">{lvl.label}</option>))}
                  </select>
                </td>
                {/* Boutons d'actions en fin de ligne */}
                <td className="py-2 px-2 text-center flex justify-center space-x-2">
                  <button
                      onClick={() => handleSave(user)}
                      className="w-8 h-8 inline-flex items-center justify-center text-[#A3B8AC] hover:text-green-600 bg-transparent hover:bg-green-50 dark:hover:bg-emerald-900/30 rounded-full transition-all cursor-pointer border border-transparent hover:border-green-100"
                      title="Sauvegarder les modifications"
                    >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={2} 
                      stroke="currentColor" 
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                      className="w-8 h-8 inline-flex items-center justify-center text-[#A3B8AC] hover:text-red-600 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all cursor-pointer border border-transparent hover:border-red-100"
                      title="Supprimer définitivement ce compte"
                    >
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedUsers.length === 0 && (
        <p className="text-center text-sm text-[#8A9A8E] dark:text-emerald-800 py-8">Aucun utilisateur trouvé.</p>
      )}
    
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1511] p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-emerald-900/50">
            
            {/* Icône d'avertissement */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-[#1E2E24] dark:text-white text-center mb-2">Supprimer ce compte ?</h3>
            <p className="text-sm text-[#53665A] dark:text-emerald-200/70 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer le compte de <strong>{userToDelete.firstname} {userToDelete.surname}</strong> ? Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      
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
                <h4 className="text-sm font-bold text-[#1E2E24] dark:text-white">
                  {toast.type === "error" ? "Erreur" : toast.type === "success" ? "Succès" : "Action requise"}
                </h4>
                <p className="text-xs text-[#53665A] dark:text-emerald-200/70 mt-0.5">{toast.message}</p>
              </div>
        </div>
      )}
    </div>
  );
}