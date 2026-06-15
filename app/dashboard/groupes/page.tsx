import { prisma } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth"; // Récupération de la session du prof
import GroupesContent from "@/app/components/responsable/GroupesContent"; // Réutilisation directe de ton UI

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

async function getTeacherGroupsStats(userId: bigint): Promise<GroupStats[]> {
  const targetTeacherId = BigInt(userId);

  // 1. Trouver toutes les matières et classes associées à ce professeur
  const teacherAssignments = await prisma.teacherAssignments.findMany({
    where: { teacherId: targetTeacherId },
    include: {
      subject: {
        include: {
          subjectAssignments: {
            include: {
              student: {
                include: {
                  class: {
                    include: { students: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  // 2. Extraire les classes uniques et les matières du prof par classe
  const classesMap = new Map<number, { classId: number; label: string; studentCount: number }>();
  const teacherSubjectsByClass = new Map<number, Set<number>>(); // classId -> Set of subjectIds
  const allSubjectsMap = new Map<number, string>(); // subjectId -> label

  teacherAssignments.forEach(ta => {
    const subject = ta.subject;
    allSubjectsMap.set(subject.subjectId, subject.label);

    subject.subjectAssignments.forEach(sa => {
      if (sa.student && sa.student.class) {
        const cls = sa.student.class;
        
        // Stocker la classe si pas encore présente
        if (!classesMap.has(cls.classId)) {
          classesMap.set(cls.classId, {
            classId: cls.classId,
            label: cls.label,
            studentCount: cls.students.length
          });
        }

        // Associer cette matière à cette classe
        if (!teacherSubjectsByClass.has(cls.classId)) {
          teacherSubjectsByClass.set(cls.classId, new Set());
        }
        teacherSubjectsByClass.get(cls.classId)!.add(subject.subjectId);
      }
    });
  });

  const uniqueClasses = Array.from(classesMap.values());

  // 3. Calculer les statistiques uniquement sur le périmètre du prof
  const groupsStats: GroupStats[] = await Promise.all(
    uniqueClasses.map(async (cls) => {
      const subjectIds = Array.from(teacherSubjectsByClass.get(cls.classId) || []);

      // Moyennes par matière
      const averageBySubject = await Promise.all(
        subjectIds.map(async (subjectId) => {
          const result = await prisma.grade.aggregate({
            where: {
              student: { classId: cls.classId },
              assessment: { subjectId: subjectId },
            },
            _avg: { value: true },
            _min: { value: true }, 
            _max: { value: true },
          });
          const avgValue = result._avg.value ? Number(result._avg.value) : 0;
          const minValue = result._min.value ? Number(result._min.value) : 0;
          const maxValue = result._max.value ? Number(result._max.value) : 0;
          return {
            subjectId: subjectId,
            subjectName: allSubjectsMap.get(subjectId) || "",
            min: parseFloat(minValue.toFixed(2)),     
            average: parseFloat(avgValue.toFixed(2)), 
            max: parseFloat(maxValue.toFixed(2)),   
          };
        })
      );

      // Moyenne globale de la classe MAIS restreinte aux seules matières de ce prof !
      const globalResult = await prisma.grade.aggregate({
        where: {
          student: { classId: cls.classId },
          assessment: { subjectId: { in: subjectIds } } // 🌟 Important : filtre sur ses matières
        },
        _avg: { value: true },
      });
      
      const globalAvgValue = globalResult._avg.value ? Number(globalResult._avg.value) : 0;
      
      return {
        classId: cls.classId,
        label: cls.label,
        studentCount: cls.studentCount,
        globalAverage: parseFloat(globalAvgValue.toFixed(2)),
        averageBySubject: averageBySubject.sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
      };
    })
  );

  // Trier les classes par ordre alphabétique
  return groupsStats.sort((a, b) => a.label.localeCompare(b.label));
}

export default async function EnseignantGroupesPage() {
  const user = await requireAuth();
  const groupsStats = await getTeacherGroupsStats(user.userId);
  return <GroupesContent groupsStats={groupsStats} teacherId={user.userId.toString()} />;
}