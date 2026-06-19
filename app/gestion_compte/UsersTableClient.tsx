"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction, deleteUserAction, createUserAction } from "../actions";

interface UserType {
  userId: string;
  firstname: string;
  surname: string;
  mail: string;
  level: number;
}

export default function UsersTableClient({ initialUsers }: { initialUsers: UserType[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  
  // États pour le formulaire de création de compte
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFirstname, setNewFirstname] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newMail, setNewMail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Nouveaux mots de passe en attente de validation, par utilisateur (vide = inchangé)
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});

  // Gérer le changement de texte dans les lignes du tableau
  const handleInputChange = (userId: string, field: keyof UserType, value: string) => {
    setUsers(prev =>
      prev.map(user => (user.userId === userId ? { ...user, [field]: value } : user))
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
      ...(newPwd ? { password: newPwd } : {}),
    });

    if (res.success) {
      alert(`Compte de ${user.firstname} mis à jour avec succès !`);
      if (newPwd) {
        setNewPasswords(prev => ({ ...prev, [user.userId]: "" }));
      }
      router.refresh();
    } else {
      alert(`Erreur lors de la modification : ${res.error}`);
    }
  };

  // Supprimer un compte
  const handleDelete = async (userId: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${name} ?`)) {
      const res = await deleteUserAction(userId);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.userId !== userId));
        router.refresh();
      } else {
        alert(`Erreur de suppression : ${res.error}`);
      }
    }
  };

  // Soumettre la création d'un compte
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstname || !newSurname || !newMail || !newPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const res = await createUserAction({
      firstname: newFirstname,
      surname: newSurname,
      mail: newMail,
      password: newPassword
    });

    if (res.success) {
      alert("Compte créé avec succès !");
      // Réinitialiser le formulaire
      setNewFirstname("");
      setNewSurname("");
      setNewMail("");
      setNewPassword("");
      setShowCreateForm(false);
      
      // Forcer le rafraîchissement des données serveur
      window.location.reload(); 
    } else {
      alert(`Erreur lors de la création : ${res.error}`);
    }
  };

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
        <form onSubmit={handleCreateUser} className="bg-[#F4F7F5] border border-[#E2EAE5] rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#53665A] mb-1">Prénom</label>
            <input
              type="text"
              value={newFirstname}
              onChange={(e) => setNewFirstname(e.target.value)}
              className="w-full bg-white border border-[#E2EAE5] rounded-lg p-2 text-sm focus:outline-none focus:border-[#047857]"
              placeholder="Jean"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#53665A] mb-1">Nom</label>
            <input
              type="text"
              value={newSurname}
              onChange={(e) => setNewSurname(e.target.value)}
              className="w-full bg-white border border-[#E2EAE5] rounded-lg p-2 text-sm focus:outline-none focus:border-[#047857]"
              placeholder="Dupont"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#53665A] mb-1">Email</label>
            <input
              type="email"
              value={newMail}
              onChange={(e) => setNewMail(e.target.value)}
              className="w-full bg-white border border-[#E2EAE5] rounded-lg p-2 text-sm focus:outline-none focus:border-[#047857]"
              placeholder="j.dupont@mail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#53665A] mb-1">Mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-[#E2EAE5] rounded-lg p-2 text-sm focus:outline-none focus:border-[#047857]"
              placeholder="Mot de passe sécurisé"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#12261E] hover:bg-[#065f46] text-white font-medium py-2 px-4 rounded-lg transition duration-150 text-sm"
          >
            Enregistrer le compte
          </button>
        </form>
      )}

      {/* Liste des comptes en lignes éditables */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-[#1E2E24]">
          <thead>
            <tr className="border-b border-[#F0F4F1] text-[#53665A] font-semibold">
              <th className="py-3 px-2 w-12">ID</th>
              <th className="py-3 px-2">Prénom</th>
              <th className="py-3 px-2">Nom</th>
              <th className="py-3 px-2">Email</th>
              <th className="py-3 px-2">Nouveau mot de passe</th>
              <th className="py-3 px-2 text-center w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1]">
            {users.map((user) => (
              <tr key={user.userId} className="hover:bg-[#F9FAF9] transition-colors">
                {/* ID non modifiable (Label grisé) */}
                <td className="py-3 px-2 font-mono text-xs text-[#8A9A8E]">
                  {user.userId}
                </td>
                
                {/* Zone de texte Prénom */}
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={user.firstname}
                    onChange={(e) => handleInputChange(user.userId, "firstname", e.target.value)}
                    className="w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#E2EAE5] focus:border-[#047857] rounded px-2 py-1 transition-all"
                  />
                </td>

                {/* Zone de texte Nom */}
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={user.surname}
                    onChange={(e) => handleInputChange(user.userId, "surname", e.target.value)}
                    className="w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#E2EAE5] focus:border-[#047857] rounded px-2 py-1 transition-all"
                  />
                </td>

                {/* Zone de texte Mail */}
                <td className="py-2 px-2">
                  <input
                    type="email"
                    value={user.mail}
                    onChange={(e) => handleInputChange(user.userId, "mail", e.target.value)}
                    className="w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#E2EAE5] focus:border-[#047857] rounded px-2 py-1 transition-all"
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
                    className="w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#E2EAE5] focus:border-[#047857] rounded px-2 py-1 transition-all text-xs"
                  />
                </td>

                {/* Boutons d'actions en fin de ligne */}
                <td className="py-2 px-2 text-center flex justify-center space-x-2">
                  <button
                    onClick={() => handleSave(user)}
                    className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium transition duration-150"
                    title="Sauvegarder les modifications"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDelete(user.userId, `${user.firstname} ${user.surname}`)}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium transition duration-150"
                    title="Supprimer définitivement ce compte"
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <p className="text-center text-sm text-[#8A9A8E] py-8">Aucun utilisateur trouvé.</p>
      )}
    </div>
  );
}