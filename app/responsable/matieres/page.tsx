/**
 * app/responsable/matieres/page.tsx
 * 
 * Page d'analyse des matières
 * Affiche toutes les matières avec statistiques, graphes et filtrage
 */

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
    orderBy: { name: 'asc' },
  });

  const matieresStats: MatiereStats[] = await Promise.all(
    subjects.map(async (subject) => {
      // Récupérer les grades pour cette matière
      const grades = await prisma.grade.findMany({
        where: { subjectId: subject.subjectId },
        select: { value: true },
      });

      // Récupérer le nombre de classes enseignant cette matière
      const classes = await prisma.enrollment.findMany({
        where: {
          student: {
            grades: {
              some: { subjectId: subject.subjectId },
            },
          },
        },
        distinct: ['classId'],
        select: { classId: true },
      });

      const values = grades.map(g => g.value).filter(v => v !== null) as number[];
      const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const minGrade = values.length > 0 ? Math.min(...values) : 0;
      const maxGrade = values.length > 0 ? Math.max(...values) : 0;

      return {
        subjectId: subject.subjectId,
        name: subject.name,
        totalGrades: grades.length,
        average,
        minGrade,
        maxGrade,
        classCount: classes.length,
      };
    })
  );

  return matieresStats;
}

export default async function MatieresPage() {
  const matieresStats = await getSubjectsStats();

  return <MatieresContent matieresStats={matieresStats} />;
}
