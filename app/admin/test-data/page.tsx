import { prisma } from "@/app/lib/db"; //fichier db

/**
 * =====================================================
 * EXPLICATION : Comment ça fonctionne avec Prisma
 * =====================================================
 * 
 * Prisma est un ORM (Object-Relational Mapping) qui nous permet de :
 * 1. Accéder à la base de données de façon type-safe (pas d'erreurs SQL)
 * 2. Utiliser des modèles définis dans prisma/schema.prisma
 * 3. Faire des requêtes complexes avec les relations (include, where, select)
 * 
 * Dans ce fichier :
 * - prisma.class.findFirst() : Trouve la PREMIÈRE classe qui correspond aux critères
 * - prisma.utilisateur.findMany() : Trouve TOUS les utilisateurs
 * - "where" : Filtre les résultats (ex: Label contient "CSI 3")
 * - "include" : Charge les relations associées (étudiants liés à la classe)
 * - "await" : Comme ce sont des requêtes asynchrones, on doit attendre la réponse
 * 
 * Les données viennent de la base PostgreSQL, mais Prisma nous les retourne comme des objets JS
 */

export default async function TestDataPage() {
  // 1. Récupération de la classe CSI 3 avec tous ses étudiants et leurs notes
  // findFirst() retourne UN SEUL résultat (le premier qui match)
  // L'objet "include" permet de charger les étudiants ET leurs notes
  const classeDetails = await prisma.class.findFirst({
    where: {
      Label: {
        contains: "CSI 3", // Cherche la classe dont le nom contient "CSI 3"
      },
    },
    include: {
      students: {
        // "students" : relation vers les étudiants de cette classe
        include: {
          grades: {
            // "grades" : les notes de chaque étudiant
            include: {
              assessment: true, // "assessment" : les détails de l'évaluation (nom, note max, etc)
            },
          },
        },
      },
    },
  });

  // 2. Récupération de la liste globale des utilisateurs pour vérification
  // findMany() retourne TOUS les utilisateurs de la base de données
  // C'est une autre requête Prisma indépendante pour tester les données utilisateurs
  const utilisateurs = await prisma.utilisateur.createMany ? 
    await prisma.utilisateur.findMany() : [];

  return (
    <div className="min-h-screen bg-white text-black p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold border-b pb-4 mb-6">
        Page de Test de Données test
      </h1>
      <p className="text-gray-500 mb-8">
        Cette page est uniquement accessible via l'URL directe voir comment ça fonctionne en prisma
      </p>

      {/*  LES ÉTUDIANTS ET LEURS NOTES */}
      {/* 
        Ici on affiche les données Prisma récupérées
        - classeDetails?.Label : L'alias "?" signifie "si classeDetails existe, affiche son Label"
        - classeDetails?.students : Si la classe a bien des étudiants, on les affiche
      */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-blue-600 mb-4">
         Données Pédagogiques : Classe {classeDetails?.Label || "Introuvable"}
        </h2>
        
        {/* 
          Condition : Si classeDetails existe ET a au moins 1 étudiant, on les affiche
          Sinon on montre un message d'erreur
        */}
        {classeDetails?.students && classeDetails.students.length > 0 ? (
          <div className="space-y-6">
            {/* 
              .map() : Boucle sur chaque étudiant dans le tableau "students"
              On crée une div pour chaque étudiant avec ses informations
            */}
            {classeDetails.students.map((etudiant) => (
              <div key={etudiant.StudentID.toString()} className="border p-4 rounded bg-gray-50">
                <p className="font-bold text-base">
                   Étudiant : {etudiant.Firstname} {etudiant.Surname}
                </p>
                <p className="text-xs text-gray-400 mb-2">ID Technique : {etudiant.StudentID.toString()}</p>
                
                {/* Liste des notes de l'étudiant */}
                <div className="pl-4 border-l-2 border-gray-200 mt-2 space-y-2">
                  <p className="font-semibold text-xs uppercase tracking-wider text-gray-500">Notes obtenues :</p>
                  {/* 
                    Boucle sur les notes de cet étudiant
                    Chaque note a accès à la relation "assessment" grâce à l'include() du findFirst()
                  */}
                  {etudiant.grades.length > 0 ? (
                    etudiant.grades.map((note) => (
                      <div key={note.AssessmentID.toString()} className="text-xs">
                        {/* On affiche la note (ex: 18/20) */}
                        <span className="font-bold text-red-600">{note.Value}/{note.assessment.MaxGrade}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        {/* On affiche le nom de l'évaluation (ex: "Devoir 1") */}
                        <span className="font-medium">{note.assessment.Label}</span>
                        {/* Si le prof a ajouté des commentaires, on les affiche */}
                        {note.Feedback && (
                          <p className="text-gray-500 italic mt-0.5">" {note.Feedback} "</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">Aucune note enregistrée.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-500 italic">Aucun étudiant trouvé dans cette classe. Lance le seed !</p>
        )}
      </section>

      {/* LES COMPTES UTILISATEURS */}
      <section>
        <h2 className="text-lg font-bold text-green-600 mb-4">
          Comptes Utilisateurs Applicatifs Fusionnés
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 border">Nom complet</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Rôle Applicatif</th>
                <th className="p-2 border">Niveau Pédago (Level)</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border font-bold">{u.prenom} {u.nom}</td>
                  <td className="p-2 border text-gray-600">{u.email}</td>
                  <td className="p-2 border">
                    <span className="px-2 py-0.5 bg-gray-200 rounded text-xs font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-2 border text-center">{u.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}