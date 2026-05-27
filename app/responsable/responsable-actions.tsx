import { prisma } from '@/app/lib/db';

// ====== 1. VUE GLOBALE DE LA CLASSE (KPIs) ======
export async function getClassOverview(classId: number) {
  try {
    const classData = await prisma.class.findUnique({
      where: { ClassID: classId },
      include: {
        students: {
          include: {
            grades: {
              include: {
                assessment: true
              }
            }
          }
        }
      }
    });

    if (!classData) {
      return { success: false, error: "Classe introuvable." };
    }

    let totalWeightedGrades = 0;
    let totalWeights = 0;
    let totalStudents = classData.students.length;

    classData.students.forEach(student => {
      student.grades.forEach(grade => {
        const assessment = grade.assessment;
        const gradeOn20 = (grade.Value / assessment.MaxGrade) * 20;
        totalWeightedGrades += gradeOn20 * assessment.Weight;
        totalWeights += assessment.Weight;
      });
    });

    const globalAverage = totalWeights > 0 ? (totalWeightedGrades / totalWeights) : null;

    return {
      success: true,
      data: {
        className: classData.Label,
        totalStudents,
        globalAverage: globalAverage ? parseFloat(globalAverage.toFixed(2)) : null
      }
    };
  } catch (error) {
    console.error("Erreur [getClassOverview]:", error);
    return { success: false, error: "Erreur lors du calcul de la vue globale." };
  }
}

// ====== 2. SYNTHÈSE DES PERFORMANCES PAR MATIÈRE ======
export async function getSubjectsPerformance(classId: number) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        assessments: {
          where: {
            grades: { some: { student: { ClassID: classId } } }
          },
          include: {
            grades: { where: { student: { ClassID: classId } } }
          }
        }
      }
    });

    const performanceData = subjects.map(subject => {
      let totalWeightedGrades = 0;
      let totalWeights = 0;
      let minGrade = 20;
      let maxGrade = 0;
      let hasGrades = false;

      subject.assessments.forEach(assessment => {
        assessment.grades.forEach(grade => {
          const gradeOn20 = (grade.Value / assessment.MaxGrade) * 20;
          totalWeightedGrades += gradeOn20 * assessment.Weight;
          totalWeights += assessment.Weight;
          
          if (gradeOn20 < minGrade) minGrade = gradeOn20;
          if (gradeOn20 > maxGrade) maxGrade = gradeOn20;
          hasGrades = true;
        });
      });

      if (!hasGrades) return null;

      return {
        subjectId: subject.SubjectID,
        subjectName: subject.Label,
        average: totalWeightedGrades / totalWeights,
        minGrade,
        maxGrade
      };
    }).filter(item => item !== null);

    return { success: true, data: performanceData };
  } catch (error) {
    console.error("Erreur [getSubjectsPerformance]:", error);
    return { success: false, error: "Erreur lors du calcul des stats par matière." };
  }
}

// ====== 3. ÉVOLUTION CHRONOLOGIQUE DE LA CLASSE ======
export async function getClassEvolution(classId: number) {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { grades: { some: { student: { ClassID: classId } } } },
      include: { subject: true, grades: { where: { student: { ClassID: classId } } } },
      orderBy: { Date: 'asc' }
    });

    const evolutionData = assessments.map(assessment => {
      let totalValue = 0;
      assessment.grades.forEach(grade => { totalValue += (grade.Value / assessment.MaxGrade) * 20; });
      const average = assessment.grades.length > 0 ? (totalValue / assessment.grades.length) : null;
      
      return {
        date: new Date(assessment.Date).toLocaleDateString('fr-FR'),
        evaluation: assessment.Label,
        matiere: assessment.subject.Label,
        moyenne: average ? parseFloat(average.toFixed(2)) : null
      };
    }).filter(item => item.moyenne !== null);

    return { success: true, data: evolutionData };
  } catch (error) {
    console.error("Erreur [getClassEvolution]:", error);
    return { success: false, error: "Erreur lors du calcul de l'évolution." };
  }
}