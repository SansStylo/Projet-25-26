/**
 * prisma/seed.ts
 * Script d'initialisation et de peuplement de la base de données
 */

import { fakerFR as faker } from '@faker-js/faker';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Setup de connexion identique à ton db.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️ Nettoyage complet de la base de données...');
  
  // 1. On supprime d'abord les tables dépendantes (tables enfants / pivots)
  await prisma.grade.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.subjectAddingCache.deleteMany({});
  await prisma.teacherAssignments.deleteMany({});
  await prisma.subjectAssignments.deleteMany({});
  await prisma.studentAssignments.deleteMany({});
  
  // 2. On supprime ensuite les tables principales (tables parents)
  await prisma.student.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🚀 Injection des données de test...');

  // ═══════════════════════════════════════════════════════════════════
  // STEP 1 : CRÉATION DES UTILISATEURS (COMPTES APPLICATIFS)
  // ═══════════════════════════════════════════════════════════════════

  const profJean = await prisma.user.create({
    data: {
      mail: 'prof@isen.fr',
      password: 'password123',
      firstname: 'Jean',
      surname: 'Dupont',
      level: 0, // Enseignant
    },
  });

  const profMarie = await prisma.user.create({
    data: {
      mail: 'marie.martin@isen.fr',
      password: 'secure123',
      firstname: 'Marie',
      surname: 'Martin',
      level: 0, // Enseignant
    },
  });

  const responsable = await prisma.user.create({
    data: {
      mail: 'responsable@isen.fr',
      password: 'resp123',
      firstname: 'Sophie',
      surname: 'Rousseau',
      level: 1, // Responsable pédagogique
    },
  });

  const admin = await prisma.user.create({
    data: {
      mail: 'admin@isen.fr',
      password: 'admin123',
      firstname: 'Pierre',
      surname: 'Legrand',
      level: 2, // Administrateur
    },
  });

  console.log('   └─ Comptes utilisateurs créés !');

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 : CLASSES & GROUPES
  // ═══════════════════════════════════════════════════════════════════

  const classCSI3 = await prisma.class.create({ data: { label: 'CSI 3 - Informatique' } });
  const classCSI4 = await prisma.class.create({ data: { label: 'CSI 4 - Génie Logiciel' } });

  // On injecte et on récupère les autres classes demandées
  const extraClasses = await prisma.class.createManyAndReturn({
    data: [
      { label: 'B3 Informatique' },
      { label: 'M1 Cybersécurité' },
      { label: 'M2 Big Data' }
    ]
  });

  // Liste globale de toutes nos classes disponibles pour le Faker
  const allAvailableClasses = [classCSI3, classCSI4, ...extraClasses];

  const groupTD1 = await prisma.group.create({ data: { label: 'Groupe TD 1' } });
  const groupTD2 = await prisma.group.create({ data: { label: 'Groupe TD 2' } });

  console.log('   └─ Classes et groupes configurés !');

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3 : ÉTUDIANTS (MANUELS + FAKER MASSIF)
  // ═══════════════════════════════════════════════════════════════════

  // Création des 3 étudiants fixes pour tes tests de liaison
  const studentLucas = await prisma.student.create({ data: { firstname: 'Lucas', surname: 'Martin', classId: classCSI3.classId } });
  const studentEmma = await prisma.student.create({ data: { firstname: 'Emma', surname: 'Bernard', classId: classCSI3.classId } });
  const studentThomas = await prisma.student.create({ data: { firstname: 'Thomas', surname: 'Petit', classId: classCSI4.classId } });

  // Usine Faker : Préparation de 100 étudiants supplémentaires
  const fakeStudentsBuffer = [];
  for (let i = 0; i < 100; i++) {
    const randomClass = allAvailableClasses[Math.floor(Math.random() * allAvailableClasses.length)];
    fakeStudentsBuffer.push({
      firstname: faker.person.firstName(),
      surname: faker.person.lastName(),
      classId: randomClass.classId,
    });
  }

  // Insertion en une seule requête SQL de nos 100 élèves
  const createdFakeStudents = await prisma.student.createManyAndReturn({
    data: fakeStudentsBuffer
  });

  // Regroupement de TOUS les étudiants pour les étapes d'affectation
  const allStudents = [studentLucas, studentEmma, studentThomas, ...createdFakeStudents];
  console.log(`   └─ ${allStudents.length} étudiants enregistrés (Usine Faker OK) !`);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4 : AFFECTATION DES ÉTUDIANTS DANS LES GROUPES (TABLE PIVOT)
  // ═══════════════════════════════════════════════════════════════════

  const studentAssignmentsBuffer = allStudents.map((student, index) => {
    // On alterne équitablement entre le TD1 et le TD2
    const targetGroup = index % 2 === 0 ? groupTD1 : groupTD2;
    return {
      studentId: student.studentId,
      groupId: targetGroup.groupId
    };
  });

  await prisma.studentAssignments.createMany({ data: studentAssignmentsBuffer });

  // ═══════════════════════════════════════════════════════════════════
  // STEP 5 : MATIÈRES
  // ═══════════════════════════════════════════════════════════════════

  const subjectDevWeb = await prisma.subject.create({ data: { label: 'Développement Web Avancé (Next.js)' } });
  const subjectDatabase = await prisma.subject.create({ data: { label: 'Bases de données relationnelles & SQL' } });

  // ═══════════════════════════════════════════════════════════════════
  // STEP 6 : AFFECTATION DES PROFS ET DES ÉLÈVES AUX MATIÈRES
  // ═══════════════════════════════════════════════════════════════════

  await prisma.teacherAssignments.createMany({
    data: [
      { subjectId: subjectDevWeb.subjectId, teacherId: profJean.userId },
      { subjectId: subjectDatabase.subjectId, teacherId: profMarie.userId },
    ],
  });

  // Inscription automatique de tous les étudiants aux deux matières
  const subjectAssignmentsBuffer: { studentId: bigint; subjectId: number }[] = [];
  allStudents.forEach(student => {
    subjectAssignmentsBuffer.push({ studentId: student.studentId, subjectId: subjectDevWeb.subjectId });
    subjectAssignmentsBuffer.push({ studentId: student.studentId, subjectId: subjectDatabase.subjectId });
  });

  await prisma.subjectAssignments.createMany({ data: subjectAssignmentsBuffer });
  console.log('   └─ Cartographie des cours et matières validée !');

  // ═══════════════════════════════════════════════════════════════════
  // STEP 7 : ÉVALUATIONS ET INJECTION AUTOMATIQUE DE NOTES
  // ═══════════════════════════════════════════════════════════════════

  // 1. Évaluations officielles pour l'historique (Mars, Avril, Mai)
  const examProject = await prisma.assessment.create({
    data: {
      subjectId: subjectDevWeb.subjectId,
      date: new Date('2026-03-15'),
      maxGrade: 20,
      weight: 3,
      teacher: 'Jean Dupont',
      label: 'Projet d\'architecture Next.js & Prisma',
    },
  });

  const examSql = await prisma.assessment.create({
    data: {
      subjectId: subjectDatabase.subjectId,
      date: new Date('2026-04-10'),
      maxGrade: 20,
      weight: 2,
      teacher: 'Marie Martin',
      label: 'Examen sur table : Requêtes et indexation',
    },
  });

  const examFinal = await prisma.assessment.create({
    data: {
      subjectId: subjectDevWeb.subjectId,
      date: new Date('2026-05-20'),
      maxGrade: 20,
      weight: 4,
      teacher: 'Jean Dupont',
      label: 'Examen Final : Intégration et API SSR',
    },
  });

  const allAssessments = [examProject, examSql, examFinal];
  const gradesBuffer: { assessmentId: bigint; studentId: bigint; value: number; feedback: string }[] = [];

  // 2. Génération des notes pour TOUS les étudiants sur TOUTES les évaluations
  allStudents.forEach((student) => {
    // Pour rendre les alertes de ton dashboard vivantes, on force environ 15% des élèves à être en difficulté
    const isStudentAtRisk = Math.random() < 0.15;

    allAssessments.forEach((assessment) => {
      let score = 0;
      let feedback = "Bonne maîtrise des notions étudiées.";

      if (isStudentAtRisk) {
        // Notes basses (entre 2 et 9 / 20)
        score = Math.floor(Math.random() * 8) + 2;
        feedback = "Des lacunes importantes. Des efforts soutenus et une reprise des bases sont requis.";
      } else {
        // Notes normales/bonnes (entre 10 et 20 / 20)
        score = Math.floor(Math.random() * 11) + 10;
        if (score > 16) feedback = "Excellent travail, bravo !";
      }

      // Cas particulier : écraser avec tes notes fixes d'origine pour Lucas, Emma et Thomas
      if (student.studentId === studentLucas.studentId && assessment.assessmentId === examProject.assessmentId) {
        score = 16;
        feedback = 'Excellent travail sur l\'intégration de l\'adaptateur PostgreSQL !';
      }
      if (student.studentId === studentEmma.studentId && assessment.assessmentId === examProject.assessmentId) {
        score = 14;
        feedback = 'Bonne structure globale, attention aux exports de config.';
      }
      if (student.studentId === studentThomas.studentId && assessment.assessmentId === examSql.assessmentId) {
        score = 11;
        feedback = 'Résultats corrects mais des confusions sur les jointures externes.';
      }

      gradesBuffer.push({
        assessmentId: assessment.assessmentId,
        studentId: student.studentId,
        value: score,
        feedback: feedback
      });
    });
  });

  // Insertion en bloc de toutes les notes
  await prisma.grade.createMany({ data: gradesBuffer });

  console.log(`   └─ ${gradesBuffer.length} notes d'évaluations calculées et injectées !`);
  console.log('\n✨ Base de données initialisée avec succès !');
  console.log(`👉 Enseignant : ${profJean.mail} / password123`);
  console.log(`👉 Responsable : ${responsable.mail} / resp123`);
  console.log(`👉 Admin : ${admin.mail} / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });