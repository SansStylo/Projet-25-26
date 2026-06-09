/**
 * prisma/seed.ts
 *
 * Script de peuplement de la base de données
 *
 * Chaque enseignant a sa propre classe et ses propres étudiants :
 *   - Jean Dupont    → DevWeb          → classe CSI3 (15 élèves)
 *   - Marie Martin   → Base de données → classe CSI4 (15 élèves)
 *   - Pierre Girard  → Intelligence IA → classe M1 Cyber (15 élèves)
 *
 * Exécuter : npx prisma db seed
 */

import { fakerFR as faker } from '@faker-js/faker';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️  Nettoyage complet de la base de données...');

  await prisma.grade.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.subjectAddingCache.deleteMany({});
  await prisma.teacherAssignments.deleteMany({});
  await prisma.subjectAssignments.deleteMany({});
  await prisma.studentAssignments.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🚀 Injection des données de test...');

  // ═══════════════════════════════════════════
  // ÉTAPE 1 : UTILISATEURS
  // ═══════════════════════════════════════════

  const profJean = await prisma.user.create({
    data: { mail: 'prof@isen.fr', password: 'password123', firstname: 'Jean', surname: 'Dupont', level: 0 },
  });

  const profMarie = await prisma.user.create({
    data: { mail: 'marie.martin@isen.fr', password: 'secure123', firstname: 'Marie', surname: 'Martin', level: 0 },
  });

  // Troisième enseignant pour tester l'isolation
  const profPierre = await prisma.user.create({
    data: { mail: 'pierre.girard@isen.fr', password: 'pierre123', firstname: 'Pierre', surname: 'Girard', level: 0 },
  });

  const responsable = await prisma.user.create({
    data: { mail: 'responsable@isen.fr', password: 'resp123', firstname: 'Sophie', surname: 'Rousseau', level: 1 },
  });

  await prisma.user.create({
    data: { mail: 'admin@isen.fr', password: 'admin123', firstname: 'Admin', surname: 'ISEN', level: 2 },
  });

  console.log('   └─ Comptes utilisateurs créés !');

  // ═══════════════════════════════════════════
  // ÉTAPE 2 : CLASSES & GROUPES
  // ═══════════════════════════════════════════

  const classCSI3  = await prisma.class.create({ data: { label: 'CSI3 - Informatique' } });
  const classCSI4  = await prisma.class.create({ data: { label: 'CSI4 - Génie Logiciel' } });
  const classM1    = await prisma.class.create({ data: { label: 'M1 Cybersécurité' } });

  const groupTD1 = await prisma.group.create({ data: { label: 'Groupe TD 1' } });
  const groupTD2 = await prisma.group.create({ data: { label: 'Groupe TD 2' } });

  console.log('   └─ Classes et groupes configurés !');

  // ═══════════════════════════════════════════
  // ÉTAPE 3 : ÉTUDIANTS PAR CLASSE (ISOLÉS)
  // ═══════════════════════════════════════════

  // Classe de Jean (CSI3) : 2 étudiants fixes + 13 faker
  const studentLucas = await prisma.student.create({ data: { firstname: 'Lucas', surname: 'Martin', classId: classCSI3.classId } });
  const studentEmma  = await prisma.student.create({ data: { firstname: 'Emma',  surname: 'Bernard', classId: classCSI3.classId } });

  const csi3FakeData = Array.from({ length: 13 }, () => ({
    firstname: faker.person.firstName(),
    surname:   faker.person.lastName(),
    classId:   classCSI3.classId,
  }));
  const csi3FakeStudents = await prisma.student.createManyAndReturn({ data: csi3FakeData });
  const studentsCSI3 = [studentLucas, studentEmma, ...csi3FakeStudents];

  // Classe de Marie (CSI4) : 1 étudiant fixe + 14 faker
  const studentThomas = await prisma.student.create({ data: { firstname: 'Thomas', surname: 'Petit', classId: classCSI4.classId } });

  const csi4FakeData = Array.from({ length: 14 }, () => ({
    firstname: faker.person.firstName(),
    surname:   faker.person.lastName(),
    classId:   classCSI4.classId,
  }));
  const csi4FakeStudents = await prisma.student.createManyAndReturn({ data: csi4FakeData });
  const studentsCSI4 = [studentThomas, ...csi4FakeStudents];

  // Classe de Pierre (M1 Cyber) : 15 faker
  const m1FakeData = Array.from({ length: 15 }, () => ({
    firstname: faker.person.firstName(),
    surname:   faker.person.lastName(),
    classId:   classM1.classId,
  }));
  const studentsM1 = await prisma.student.createManyAndReturn({ data: m1FakeData });

  const allStudents = [...studentsCSI3, ...studentsCSI4, ...studentsM1];
  console.log(`   └─ ${allStudents.length} étudiants enregistrés !`);

  // ═══════════════════════════════════════════
  // ÉTAPE 4 : AFFECTATION AUX GROUPES TD
  // ═══════════════════════════════════════════

  await prisma.studentAssignments.createMany({
    data: allStudents.map((student, i) => ({
      studentId: student.studentId,
      groupId:   i % 2 === 0 ? groupTD1.groupId : groupTD2.groupId,
    })),
  });

  // ═══════════════════════════════════════════
  // ÉTAPE 5 : MATIÈRES
  // ═══════════════════════════════════════════

  const subjectDevWeb   = await prisma.subject.create({ data: { label: 'Développement Web Avancé (Next.js)' } });
  const subjectDatabase = await prisma.subject.create({ data: { label: 'Bases de données relationnelles & SQL' } });
  const subjectIA       = await prisma.subject.create({ data: { label: 'Intelligence Artificielle & ML' } });

  // ═══════════════════════════════════════════
  // ÉTAPE 6 : AFFECTATION PROFS → MATIÈRES
  //           + ÉTUDIANTS → MATIÈRES (ISOLÉ PAR CLASSE)
  // ═══════════════════════════════════════════

  // Jean enseigne DevWeb à CSI3 uniquement
  await prisma.teacherAssignments.create({ data: { subjectId: subjectDevWeb.subjectId, teacherId: profJean.userId } });
  // Marie enseigne Database à CSI4 uniquement
  await prisma.teacherAssignments.create({ data: { subjectId: subjectDatabase.subjectId, teacherId: profMarie.userId } });
  // Pierre enseigne IA à M1 Cyber uniquement
  await prisma.teacherAssignments.create({ data: { subjectId: subjectIA.subjectId, teacherId: profPierre.userId } });

  const subjectAssignmentsBuffer: { studentId: bigint; subjectId: number }[] = [];

  studentsCSI3.forEach(s => subjectAssignmentsBuffer.push({ studentId: s.studentId, subjectId: subjectDevWeb.subjectId }));
  studentsCSI4.forEach(s => subjectAssignmentsBuffer.push({ studentId: s.studentId, subjectId: subjectDatabase.subjectId }));
  studentsM1.forEach(s   => subjectAssignmentsBuffer.push({ studentId: s.studentId, subjectId: subjectIA.subjectId }));

  await prisma.subjectAssignments.createMany({ data: subjectAssignmentsBuffer });
  console.log('   └─ Cartographie des cours et matières validée !');

  // ═══════════════════════════════════════════
  // ÉTAPE 7 : ÉVALUATIONS & NOTES
  // ═══════════════════════════════════════════

const examProject = await prisma.assessment.create({
    data: {
      subjectId: subjectDevWeb.subjectId,
      date:      new Date('2026-03-15'),
      maxGrade:  20,
      weight:    3,
      userId:    profJean.userId,
      label:     "Projet d'architecture Next.js & Prisma",
    },
  });

  const examSql = await prisma.assessment.create({
    data: {
      subjectId: subjectDatabase.subjectId,
      date:      new Date('2026-04-10'),
      maxGrade:  20,
      weight:    2,
      userId:    profMarie.userId,
      label:     'Examen sur table : Requêtes et indexation',
    },
  });

  const examFinal = await prisma.assessment.create({
    data: {
      subjectId: subjectDevWeb.subjectId,
      date:      new Date('2026-05-20'),
      maxGrade:  20,
      weight:    4,
      userId:    profJean.userId,
      label:     'Examen Final : Intégration et API SSR',
    },
  });

  const examIA = await prisma.assessment.create({
    data: {
      subjectId: subjectIA.subjectId,
      date:      new Date('2026-05-10'),
      maxGrade:  20,
      weight:    3,
      userId:    profPierre.userId,
      label:     'TP Machine Learning : Régression et classification',
    },
  });

  const gradesBuffer: { assessmentId: bigint; studentId: bigint; value: number; feedback: string }[] = [];

  function randomNote(atRisk: boolean) {
    if (atRisk) return { value: Math.floor(Math.random() * 8) + 2, feedback: 'Des lacunes importantes. Des efforts soutenus sont requis.' };
    const v = Math.floor(Math.random() * 11) + 10;
    return { value: v, feedback: v > 16 ? 'Excellent travail, bravo !' : 'Bonne maîtrise des notions étudiées.' };
  }

  // Notes CSI3 (DevWeb, deux évaluations)
  studentsCSI3.forEach(student => {
    const atRisk = Math.random() < 0.15;
    for (const assessment of [examProject, examFinal]) {
      const note = randomNote(atRisk);
      // Notes fixes pour Lucas et Emma sur le projet
      if (student.studentId === studentLucas.studentId && assessment.assessmentId === examProject.assessmentId) {
        gradesBuffer.push({ assessmentId: assessment.assessmentId, studentId: student.studentId, value: 16, feedback: "Excellent travail sur l'intégration de l'adaptateur PostgreSQL !" });
        continue;
      }
      if (student.studentId === studentEmma.studentId && assessment.assessmentId === examProject.assessmentId) {
        gradesBuffer.push({ assessmentId: assessment.assessmentId, studentId: student.studentId, value: 14, feedback: 'Bonne structure globale, attention aux exports de config.' });
        continue;
      }
      gradesBuffer.push({ assessmentId: assessment.assessmentId, studentId: student.studentId, ...note });
    }
  });

  // Notes CSI4 (Database)
  studentsCSI4.forEach(student => {
    const atRisk = Math.random() < 0.15;
    const note = randomNote(atRisk);
    if (student.studentId === studentThomas.studentId) {
      gradesBuffer.push({ assessmentId: examSql.assessmentId, studentId: student.studentId, value: 11, feedback: 'Résultats corrects mais des confusions sur les jointures externes.' });
    } else {
      gradesBuffer.push({ assessmentId: examSql.assessmentId, studentId: student.studentId, ...note });
    }
  });

  // Notes M1 Cyber (IA)
  studentsM1.forEach(student => {
    const atRisk = Math.random() < 0.20;
    const note = randomNote(atRisk);
    gradesBuffer.push({ assessmentId: examIA.assessmentId, studentId: student.studentId, ...note });
  });

  await prisma.grade.createMany({ data: gradesBuffer });

  console.log(`   └─ ${gradesBuffer.length} notes injectées !`);
  console.log('\n✨ Base de données initialisée avec succès !');
  console.log(`👉 Jean Dupont   (CSI3 / DevWeb)    : prof@isen.fr        / password123`);
  console.log(`👉 Marie Martin  (CSI4 / BdD)       : marie.martin@isen.fr / secure123`);
  console.log(`👉 Pierre Girard (M1 Cyber / IA)    : pierre.girard@isen.fr / pierre123`);
  console.log(`👉 Responsable                       : responsable@isen.fr / resp123`);
  console.log(`👉 Admin                             : admin@isen.fr       / admin123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
