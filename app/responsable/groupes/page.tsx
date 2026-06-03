/**
 * app/responsable/groupes/page.tsx
 * 
 * Page d'analyse des groupes/classes
 * Affiche tous les groupes avec statistiques, graphes et filtrage
 */

import { prisma } from "@/app/lib/db";
import GroupesContent from "../../components/responsable/GroupesContent";

interface GroupStats {
  classId: number;
  label: string;
  studentCount: number;
  globalAverage: number;
  averageBySubject: Array<{
    subjectId: number;
    subjectName: string;
    average: number;
  }>;
}

async function getGroupsStats(): Promise<GroupStats[]> {
  const classes = await prisma.class.findMany({
    include: {
      enrollments: true,
    },
    orderBy: { label: 'asc' },
  });

  const groupsStats: GroupStats[] = await Promise.all(
    classes.map(async (cls) => {
      // Récupérer les moyennes par matière
      const subjects = await prisma.subject.findMany({
        select: { subjectId: true, name: true },
      });

      const averageBySubject = await Promise.all(
        subjects.map(async (subject) => {
          const result = await prisma.grade.aggregate({
            where: {
              student: {
                enrollments: {
                  some: {
                    classId: cls.classId,
                  },
                },
              },
              subjectId: subject.subjectId,
            },
            _avg: { value: true },
          });

          return {
            subjectId: subject.subjectId,
            subjectName: subject.name,
            average: result._avg.value || 0,
          };
        })
      );

      // Calculer la moyenne globale
      const globalResult = await prisma.grade.aggregate({
        where: {
          student: {
            enrollments: {
              some: {
                classId: cls.classId,
              },
            },
          },
        },
        _avg: { value: true },
      });

      return {
        classId: cls.classId,
        label: cls.label,
        studentCount: cls.enrollments.length,
        globalAverage: globalResult._avg.value || 0,
        averageBySubject,
      };
    })
  );

  return groupsStats;
}

export default async function GroupesPage() {
  const groupsStats = await getGroupsStats();

  return <GroupesContent groupsStats={groupsStats} />;
}
