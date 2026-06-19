import { prisma } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth"; // Récupération de la session du prof
import MatieresContent from "@/app/components/responsable/MatieresContent"; // Réutilisation de ton composant graphique clean

interface MatiereStats {
  subjectId: number;
  name: string;
  totalGrades: number;
  average: number;
  minGrade: number;
  maxGrade: number;
  classCount: number;
}

async function getTeacherSubjectsStats(userId: bigint): Promise<MatiereStats[]> {
  // 1. On récupère UNIQUEMENT les matières assignées à CE professeur
  const assignments = await prisma.teacherAssignments.findMany({
    where: { teacherId: userId },
    include: { subject: true },
    orderBy: { subject: { label: 'asc' } },
  });

  // Extraction des matières uniques
  const teacherSubjects = assignments.map(a => a.subject);

  // 2. On calcule les statistiques uniquement sur le périmètre de ses matières
  const matieresStats: MatiereStats[] = await Promise.all(
    teacherSubjects.map(async (subject) => {
      // Notes uniquement pour cette matière
      const grades = await prisma.grade.findMany({
        where: { assessment: { subjectId: subject.subjectId } },
        select: { value: true },
      });

      // Nombre de classes uniques où cette matière est enseignée (via les élèves)
      const classesWithSubject = await prisma.student.findMany({
        where: {
          grades: {
            some: { assessment: { subjectId: subject.subjectId } },
          },
          classId: { not: null },
        },
        distinct: ['classId'],
        select: { classId: true },
      });

      const values = grades.map(g => Number(g.value)).filter(v => v !== null) as number[];
      const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const minGrade = values.length > 0 ? Math.min(...values) : 0;
      const maxGrade = values.length > 0 ? Math.max(...values) : 0;

      return {
        subjectId: subject.subjectId,
        name: subject.label,
        totalGrades: grades.length,
        average,
        minGrade,
        maxGrade,
        classCount: classesWithSubject.length,
      };
    })
  );

  return matieresStats;
}

export default async function EnseignantMatieresPage() {
  const user = await requireAuth();
  const matieresStats = await getTeacherSubjectsStats(user.userId);
  return <MatieresContent matieresStats={matieresStats} teacherId={user.userId.toString()} />;
}