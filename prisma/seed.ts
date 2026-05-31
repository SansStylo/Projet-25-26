/**
 * prisma/seed.ts
 * Script d'initialisation et de peuplement de la base de données
 * Rôle:
 * - Vide complètement toutes les tables (en respectant l'ordre des contraintes SQL)
 * - Crée 4 utilisateurs de test avec des niveaux différents (0=enseignant, 1=responsable, 2=admin)
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
  console.log('Nettoyage complet de la base de données...')
  
  // 1. On supprime d'abord les tables dépendantes (tables enfants / pivots)
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
  await prisma.user.deleteMany({})

  console.log('Injection des données de test...')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 1 : CRÉATION DES UTILISATEURS (COMPTES APPLICATIFS)
  // ═══════════════════════════════════════════════════════════════════

  // Enseignant Principal (Jean Dupont) - level 0
  const profJean = await prisma.user.create({
    data: {
      mail: 'prof@isen.fr',
      password: 'password123',
      firstname: 'Jean',
      surname: 'Dupont',
      level: 0, // Enseignant
    },
  })

  // Enseignant Secondaire (Marie Martin) - level 0
  const profMarie = await prisma.user.create({
    data: {
      mail: 'marie.martin@isen.fr',
      password: 'secure123',
      firstname: 'Marie',
      surname: 'Martin',
      level: 0, // Enseignant
    },
  })

  // Responsable Pédagogique (Sophie Rousseau) - level 1
  const responsable = await prisma.user.create({
    data: {
      mail: 'responsable@isen.fr',
      password: 'resp123',
      firstname: 'Sophie',
      surname: 'Rousseau',
      level: 1, // Responsable pédagogique
    },
  })

  // Administrateur (Pierre Legrand) - level 2
  const admin = await prisma.user.create({
    data: {
      mail: 'admin@isen.fr',
      password: 'admin123',
      firstname: 'Pierre',
      surname: 'Legrand',
      level: 2, // Administrateur
    },
  })

  console.log('  └─ Comptes utilisateurs créés !')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 : CLASSES & GROUPES
  // ═══════════════════════════════════════════════════════════════════

  const classCSI3 = await prisma.class.create({
    data: { label: 'CSI 3 - Informatique' },
  })

  const classCSI4 = await prisma.class.create({
    data: { label: 'CSI 4 - Génie Logiciel' },
  })

  const groupTD1 = await prisma.group.create({
    data: { label: 'Groupe TD 1' },
  })

  const groupTD2 = await prisma.group.create({
    data: { label: 'Groupe TD 2' },
  })

  console.log('  └─ Classes et groupes configurés !')

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3 : ÉTUDIANTS
  // ═══════════════════════════════════════════════════════════════════

  const studentLucas = await prisma.student.create({
    data: {
      firstname: 'Lucas',
      surname: 'Martin',
      classId: classCSI3.classId,
    },
  })

  const studentEmma = await prisma.student.create({
    data: {
      firstname: 'Emma',
      surname: 'Bernard',
      classId: classCSI3.classId,
    },
  })

  const studentThomas = await prisma.student.create({
    data: {
      firstname: 'Thomas',
      surname: 'Petit',
      classId: classCSI4.classId,
    },
  })

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4 : AFFECTATION DES ÉTUDIANTS DANS LES GROUPES (TABLE PIVOT)
  // ═══════════════════════════════════════════════════════════════════

  await prisma.studentAssignments.createMany({
    data: [
      { studentId: studentLucas.studentId, groupId: groupTD1.groupId },
      { studentId: studentEmma.studentId, groupId: groupTD1.groupId },
      { studentId: studentThomas.studentId, groupId: groupTD2.groupId },
    ],
  })

  // ═══════════════════════════════════════════════════════════════════
  // STEP 5 : MATIÈRES
  // ═══════════════════════════════════════════════════════════════════

  const subjectDevWeb = await prisma.subject.create({
    data: { label: 'Développement Web Avancé (Next.js)' },
  })

  const subjectDatabase = await prisma.subject.create({
    data: { label: 'Bases de données relationnelles & SQL' },
  })

  // ═══════════════════════════════════════════════════════════════════
  // STEP 6 : AFFECTATION DES PROFS AUX MATIÈRES (TABLE PIVOT)
  // ═══════════════════════════════════════════════════════════════════

  await prisma.teacherAssignments.createMany({
    data: [
      { subjectId: subjectDevWeb.subjectId, teacherId: profJean.userId },    // Jean enseigne le Web
      { subjectId: subjectDatabase.subjectId, teacherId: profMarie.userId }, // Marie enseigne le SQL
    ],
  })

  // Affectation optionnelle des étudiants aux matières
  await prisma.subjectAssignments.createMany({
    data: [
      { studentId: studentLucas.studentId, subjectId: subjectDevWeb.subjectId },
      { studentId: studentEmma.studentId, subjectId: subjectDevWeb.subjectId },
      { studentId: studentThomas.studentId, subjectId: subjectDatabase.subjectId },
    ],
  })

  // ═══════════════════════════════════════════════════════════════════
  // STEP 7 : ÉVALUATIONS & NOTES
  // ═══════════════════════════════════════════════════════════════════

  // Évaluation 1 : Projet Next.js (Créé par Jean)
  const examProject = await prisma.assessment.create({
    data: {
      subjectId: subjectDevWeb.subjectId,
      date: new Date('2026-05-15'),
      maxGrade: 20,
      weight: 3, // Coeff 3
      teacher: 'Jean Dupont',
      label: 'Projet d\'architecture Next.js & Prisma',
    },
  })

  // Évaluation 2 : Partiel SQL (Créé par Marie)
  const examSql = await prisma.assessment.create({
    data: {
      subjectId: subjectDatabase.subjectId,
      date: new Date('2026-06-02'),
      maxGrade: 20,
      weight: 2, // Coeff 2
      teacher: 'Marie Martin',
      label: 'Examen sur table : Requêtes et indexation',
    },
  })

  // Insertion des notes des étudiants
  await prisma.grade.createMany({
    data: [
      {
        assessmentId: examProject.assessmentId,
        studentId: studentLucas.studentId,
        value: 16,
        feedback: 'Excellent travail sur l\'intégration de l\'adaptateur PostgreSQL !',
      },
      {
        assessmentId: examProject.assessmentId,
        studentId: studentEmma.studentId,
        value: 14,
        feedback: 'Bonne structure globale, attention aux exports de config.',
      },
      {
        assessmentId: examSql.assessmentId,
        studentId: studentThomas.studentId,
        value: 11,
        feedback: 'Résultats corrects mais des confusions sur les jointures externes.',
      },
    ],
  })

  console.log('Base de données initialisée avec succès !')
  console.log(`Re-connecte-toi sur l'application avec : ${profJean.mail} / password123`)
  console.log(`Responsable : ${responsable.mail} / resp123`)
  console.log(`Admin : ${admin.mail} / admin123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })