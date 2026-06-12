import { prisma } from "@/app/lib/db";
import MatieresContent from "../../components/responsable/MatieresContent";

interface MatiereStats {
  subjectId: number;
  name: string;
  totalGrades: number;
  average: number;
  minGrade: number;
  maxGrade: number;
  classCount: number;
}

async function getSubjectsStats(): Promise<MatiereStats[]> {
  const subjects = await prisma.subject.findMany({
    orderBy: { label: 'asc' },
  });

  const matieresStats: MatiereStats[] = await Promise.all(
    subjects.map(async (subject) => {
      const grades = await prisma.grade.findMany({
        where: { assessment: { subjectId: subject.subjectId } },
        select: { value: true },
      });

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

export default async function MatieresPage() {
  const matieresStats = await getSubjectsStats();
  return <MatieresContent matieresStats={matieresStats} />;
}
