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
    include: { students: true },
    orderBy: { label: 'asc' },
  });

  const subjects = await prisma.subject.findMany({
    select: { subjectId: true, label: true },
  });

  const groupsStats: GroupStats[] = await Promise.all(
    classes.map(async (cls) => {
      const averageBySubject = await Promise.all(
        subjects.map(async (subject) => {
          const result = await prisma.grade.aggregate({
            where: {
              student: { classId: cls.classId },
              assessment: { subjectId: subject.subjectId },
            },
            _avg: { value: true },
          });
          return {
            subjectId: subject.subjectId,
            subjectName: subject.label,
            average: result._avg.value || 0,
          };
        })
      );

      const globalResult = await prisma.grade.aggregate({
        where: { student: { classId: cls.classId } },
        _avg: { value: true },
      });

      return {
        classId: cls.classId,
        label: cls.label,
        studentCount: cls.students.length,
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
