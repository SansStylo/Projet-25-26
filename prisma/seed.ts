import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.utilisateur.upsert({
    where: { email: 'prof.test@isen.fr' },
    update: {},
    create: { id: '99999999-9999-9999-9999-999999999991', email: 'prof.test@isen.fr', motDePasse: 'password', prenom: 'Jean', nom: 'Test', role: 'enseignant', level: 1 }
  })

  await prisma.utilisateur.upsert({
    where: { email: 'marie.test@isen.fr' },
    update: {},
    create: { id: '99999999-9999-9999-9999-999999999992', email: 'marie.test@isen.fr', motDePasse: 'password', prenom: 'Marie', nom: 'Test', role: 'enseignant', level: 1 }
  })

  const classData = await prisma.class.findUnique({ where: { ClassID: 9001 } })
  if (!classData) { await prisma.class.create({ data: { ClassID: 9001, Label: 'CSI 3 - Test Graphiques' } }) }

  const group1 = await prisma.group.findUnique({ where: { GroupID: 9001 } })
  if (!group1) { await prisma.group.create({ data: { GroupID: 9001, Label: 'Groupe Test 1' } }) }

  const group2 = await prisma.group.findUnique({ where: { GroupID: 9002 } })
  if (!group2) { await prisma.group.create({ data: { GroupID: 9002, Label: 'Groupe Test 2' } }) }

  const students = [
    { id: 9001, first: 'Lucas', last: 'Excellent' },
    { id: 9002, first: 'Emma', last: 'Moyenne' },
    { id: 9003, first: 'Alice', last: 'Irreguliere' },
    { id: 9004, first: 'Julien', last: 'Decrochage' }
  ]

  for (const s of students) {
    const exists = await prisma.student.findUnique({ where: { StudentID: s.id } })
    if (!exists) { await prisma.student.create({ data: { StudentID: s.id, ClassID: 9001, Firstname: s.first, Surname: s.last } }) }
  }

  const assignments = [ { sId: 9001, gId: 9001 }, { sId: 9002, gId: 9001 }, { sId: 9003, gId: 9002 }, { sId: 9004, gId: 9002 } ]
  for (const a of assignments) {
    const exists = await prisma.studentAssignments.findUnique({ where: { StudentID_GroupID: { StudentID: a.sId, GroupID: a.gId } } })
    if (!exists) { await prisma.studentAssignments.create({ data: { StudentID: a.sId, GroupID: a.gId } }) }
  }

  const subjects = [ { id: 9001, label: 'Web Avancé (Test)' }, { id: 9002, label: 'Bases de données (Test)' }, { id: 9003, label: 'Algorithmique (Test)' }, { id: 9004, label: 'Cybersecurité (Test)' } ]
  for (const sub of subjects) {
    const exists = await prisma.subject.findUnique({ where: { SubjectID: sub.id } })
    if (!exists) { await prisma.subject.create({ data: { SubjectID: sub.id, Label: sub.label } }) }
  }

  const teachers = [
    { subId: 9001, tId: '99999999-9999-9999-9999-999999999991' }, { subId: 9003, tId: '99999999-9999-9999-9999-999999999991' },
    { subId: 9002, tId: '99999999-9999-9999-9999-999999999992' }, { subId: 9004, tId: '99999999-9999-9999-9999-999999999992' }
  ]
  for (const t of teachers) {
    const exists = await prisma.teacherAssignments.findUnique({ where: { SubjectID_TeacherID: { SubjectID: t.subId, TeacherID: t.tId } } })
    if (!exists) { await prisma.teacherAssignments.create({ data: { SubjectID: t.subId, TeacherID: t.tId } }) }
  }

  const assessments = [
    { id: 9001, subId: 9003, date: '2025-10-15', weight: 2, t: 'Jean Test', l: 'Etape 1 - Octobre' },
    { id: 9002, subId: 9001, date: '2025-11-05', weight: 1, t: 'Jean Test', l: 'Etape 2 - Novembre' },
    { id: 9003, subId: 9002, date: '2025-12-18', weight: 3, t: 'Marie Test', l: 'Etape 3 - Décembre' },
    { id: 9004, subId: 9004, date: '2026-01-20', weight: 2, t: 'Marie Test', l: 'Etape 4 - Janvier' },
    { id: 9005, subId: 9001, date: '2026-03-10', weight: 4, t: 'Jean Test', l: 'Etape 5 - Mars' },
    { id: 9006, subId: 9003, date: '2026-04-25', weight: 2, t: 'Jean Test', l: 'Etape 6 - Avril' }
  ]
  for (const ass of assessments) {
    const exists = await prisma.assessment.findUnique({ where: { AssessmentID: ass.id } })
    if (!exists) { await prisma.assessment.create({ data: { AssessmentID: ass.id, SubjectID: ass.subId, Date: new Date(ass.date), MaxGrade: 20, Weight: ass.weight, Teacher: ass.t, Label: ass.l } }) }
  }

  const grades = [
    { aId: 9001, sId: 9001, val: 18 }, { aId: 9002, sId: 9001, val: 17 }, { aId: 9003, sId: 9001, val: 19 }, { aId: 9004, sId: 9001, val: 16 }, { aId: 9005, sId: 9001, val: 20 }, { aId: 9006, sId: 9001, val: 18 },
    { aId: 9001, sId: 9002, val: 14 }, { aId: 9002, sId: 9002, val: 15 }, { aId: 9003, sId: 9002, val: 12 }, { aId: 9004, sId: 9002, val: 13 }, { aId: 9005, sId: 9002, val: 9 },  { aId: 9006, sId: 9002, val: 10 },
    { aId: 9001, sId: 9003, val: 11 }, { aId: 9002, sId: 9003, val: 14 }, { aId: 9003, sId: 9003, val: 6 },  { aId: 9004, sId: 9003, val: 12 }, { aId: 9005, sId: 9003, val: 15 }, { aId: 9006, sId: 9003, val: 10 },
    { aId: 9001, sId: 9004, val: 8 },  { aId: 9002, sId: 9004, val: 5 },  { aId: 9003, sId: 9004, val: 4 },  { aId: 9004, sId: 9004, val: 7 },  { aId: 9005, sId: 9004, val: 2 },  { aId: 9006, sId: 9004, val: 3 }
  ]
  for (const g of grades) {
    const exists = await prisma.grade.findUnique({ where: { AssessmentID_StudentID: { AssessmentID: g.aId, StudentID: g.sId } } })
    if (!exists) { await prisma.grade.create({ data: { AssessmentID: g.aId, StudentID: g.sId, Value: g.val, Feedback: 'Test' } }) }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); })