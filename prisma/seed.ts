/**
 * prisma/seed.ts
 * * Script d'initialisation et de peuplement de la base de données
 * * Rôle:
 * - Vide complètement toutes las tables (en respectant l'ordre des contraintes SQL)
 * - Crée 4 utilisateurs de test avec des rôles différents
 * - Crée une structure complète (Classes, Étudiants, Groupes, Matières, Évaluations, Notes)
 * - Associe les enseignants aux matières et les étudiants aux groupes/matières
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Setup de connexion identique à ton db.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('⏳ Nettoyage complet de la base de données...')
  
  // 1. On supprime d'abord les tables dépendantes (tables enfants / pivots)
  await prisma.auditModification.deleteMany({})
  await prisma.grade.deleteMany({})
  await prisma.assessment.deleteMany({})
  await prisma.subjectAddingCache.deleteMany({})
  await prisma.teacherAssignments.deleteMany({})
  await prisma.subjectAssignments.deleteMany({})
  await prisma.studentAssignments.deleteMany({})
  
  // 2. On supprime ensuite les tables principales (tables parents)
  await prisma.student.deleteMany({})
  await prisma.subject.deleteMany({})
  await prisma.group.deleteMany({})
  await prisma.class.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.auditConnexion.deleteMany({})
  await prisma.utilisateur.deleteMany({})

  console.log('🌱 Injection des données de test...')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 1 : CRÉATION DES UTILISATEURS (COMPTES APPLICATIFS)
  // ═══════════════════════════════════════════════════════════════════

  // Enseignant Principal (Jean Dupont)
  const profJean = await prisma.utilisateur.create({
    data: {
      email: 'prof@isen.fr',
      motDePasse: 'password123',
      prenom: 'Jean',
      nom: 'Dupont',
      role: 'enseignant',
      level: 1,
    },
  })

  // Enseignant Secondaire (Marie Martin)
  const profMarie = await prisma.utilisateur.create({
    data: {
      email: 'marie.martin@isen.fr',
      motDePasse: 'secure123',
      prenom: 'Marie',
      nom: 'Martin',
      role: 'enseignant',
      level: 1,
    },
  })

  // Administrateur
  const admin = await prisma.utilisateur.create({
    data: {
      email: 'admin@isen.fr',
      motDePasse: 'admin123',
      prenom: 'Pierre',
      nom: 'Legrand',
      role: 'administrateur',
      level: 2,
    },
  })

  // Responsable Pédagogique
  await prisma.utilisateur.create({
    data: {
      email: 'responsable@isen.fr',
      motDePasse: 'resp123',
      prenom: 'Sophie',
      nom: 'Rousseau',
      role: 'responsable_pedagogique',
      level: 2,
    },
  })

  console.log('  └─ Comptes utilisateurs créés !')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 : CLASSES & GROUPES
  // ═══════════════════════════════════════════════════════════════════

  const classCSI3 = await prisma.class.create({
    data: { Label: 'CSI 3 - Informatique' },
  })

  const classCSI4 = await prisma.class.create({
    data: { Label: 'CSI 4 - Génie Logiciel' },
  })

  const groupTD1 = await prisma.group.create({
    data: { Label: 'Groupe TD 1' },
  })

  const groupTD2 = await prisma.group.create({
    data: { Label: 'Groupe TD 2' },
  })

  console.log('  └─ Classes et groupes configurés !')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3 : ÉTUDIANTS
  // ═══════════════════════════════════════════════════════════════════

  const studentLucas = await prisma.student.create({
    data: {
      Firstname: 'Lucas',
      Surname: 'Martin',
      ClassID: classCSI3.ClassID,
    },
  })

  const studentEmma = await prisma.student.create({
    data: {
      Firstname: 'Emma',
      Surname: 'Bernard',
      ClassID: classCSI3.ClassID,
    },
  })

  const studentThomas = await prisma.student.create({
    data: {
      Firstname: 'Thomas',
      Surname: 'Petit',
      ClassID: classCSI4.ClassID,
    },
  })

  console.log('  └─ Étudiants inscrits !')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4 : AFFECTATION DES ÉTUDIANTS DANS LES GROUPES (TABLE PIVOT)
  // ═══════════════════════════════════════════════════════════════════

  await prisma.studentAssignments.createMany({
    data: [
      { StudentID: studentLucas.StudentID, GroupID: groupTD1.GroupID },
      { StudentID: studentEmma.StudentID, GroupID: groupTD1.GroupID },
      { StudentID: studentThomas.StudentID, GroupID: groupTD2.GroupID },
    ],
  })

  // ═══════════════════════════════════════════════════════════════════
  // STEP 5 : MATIÈRES
  // ═══════════════════════════════════════════════════════════════════

  const subjectDevWeb = await prisma.subject.create({
    data: { Label: 'Développement Web Avancé (Next.js)' },
  })

  const subjectDatabase = await prisma.subject.create({
    data: { Label: 'Bases de données relationnelles & SQL' },
  })

  console.log('  └─ Matières ajoutées !')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 6 : AFFECTATION DES PROFS AUX MATIÈRES (TABLE PIVOT)
  // ═══════════════════════════════════════════════════════════════════

  await prisma.teacherAssignments.createMany({
    data: [
      { SubjectID: subjectDevWeb.SubjectID, TeacherID: profJean.id },    // Jean enseigne le Web
      { SubjectID: subjectDatabase.SubjectID, TeacherID: profMarie.id }, // Marie enseigne le SQL
    ],
  })

  // Affectation optionnelle des étudiants aux matières
  await prisma.subjectAssignments.createMany({
    data: [
      { StudentID: studentLucas.StudentID, SubjectID: subjectDevWeb.SubjectID },
      { StudentID: studentEmma.StudentID, SubjectID: subjectDevWeb.SubjectID },
      { StudentID: studentThomas.StudentID, SubjectID: subjectDatabase.SubjectID },
    ],
  })

  // ═══════════════════════════════════════════════════════════════════
  // STEP 7 : ÉVALUATIONS & NOTES
  // ═══════════════════════════════════════════════════════════════════

  // Évaluation 1 : Projet Next.js (Créé par Jean)
  const examProject = await prisma.assessment.create({
    data: {
      SubjectID: subjectDevWeb.SubjectID,
      Date: new Date('2026-05-15'),
      MaxGrade: 20,
      Weight: 3, // Coeff 3
      Teacher: 'Jean Dupont',
      Label: 'Projet d\'architecture Next.js & Prisma',
    },
  })

  // Évaluation 2 : Partiel SQL (Créé par Marie)
  const examSql = await prisma.assessment.create({
    data: {
      SubjectID: subjectDatabase.SubjectID,
      Date: new Date('2026-06-02'),
      MaxGrade: 20,
      Weight: 2, // Coeff 2
      Teacher: 'Marie Martin',
      Label: 'Examen sur table : Requêtes et indexation',
    },
  })

  console.log('  └─ Évaluations programmées !')

  // Insertion des notes des étudiants
  await prisma.grade.createMany({
    data: [
      {
        AssessmentID: examProject.AssessmentID,
        StudentID: studentLucas.StudentID,
        Value: 16,
        Feedback: 'Excellent travail sur l\'intégration de l\'adaptateur PostgreSQL !',
      },
      {
        AssessmentID: examProject.AssessmentID,
        StudentID: studentEmma.StudentID,
        Value: 14,
        Feedback: 'Bonne structure globale, attention aux exports de config.',
      },
      {
        AssessmentID: examSql.AssessmentID,
        StudentID: studentThomas.StudentID,
        Value: 11,
        Feedback: 'Résultats corrects mais des confusions sur les jointures externes.',
      },
    ],
  })

  console.log('  └─ Notes de test injectées !')
  console.log('✅ Base de données initialisée avec succès !')
  console.log(`➡️ Re-connecte-toi sur l'application avec : ${profJean.email} / password123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })