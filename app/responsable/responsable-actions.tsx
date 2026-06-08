/**
 * app/responsable/responsable-actions.tsx
 */

/**
 * app/responsable/responsable-actions.ts
 */
"use server"; // Indique que ce fichier contient des Server Actions

import { prisma } from '@/app/lib/db';
  try {
    const classData = await prisma.class.findUnique({
      where: { classId: classId },
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
        // 🔄 Adapté au nouveau schéma : value, maxGrade et weight en minuscules
        const gradeOn20 = (grade.value / assessment.maxGrade) * 20;
        totalWeightedGrades += gradeOn20 * assessment.weight;
        totalWeights += assessment.weight;
      });
    });

    const globalAverage = totalWeights > 0 ? (totalWeightedGrades / totalWeights) : null;

    return {
      success: true,
      data: {
        
        className: classData.label,
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
            grades: { some: { student: { classId: classId } } }
          },
          include: {
            grades: { where: { student: { classId: classId } } }
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
          // 🔄 Adapté au nouveau schéma : value, maxGrade et weight en minuscules
          const gradeOn20 = (grade.value / assessment.maxGrade) * 20;
          totalWeightedGrades += gradeOn20 * assessment.weight;
          totalWeights += assessment.weight;
          
          if (gradeOn20 < minGrade) minGrade = gradeOn20;
          if (gradeOn20 > maxGrade) maxGrade = gradeOn20;
          hasGrades = true;
        });
      });

      if (!hasGrades) return null;

      return {
        // 🔄 Adapté au nouveau schéma : subjectId et label en minuscules
        subjectId: subject.subjectId,
        subjectName: subject.label,
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
      where: { grades: { some: { student: { classId: classId } } } },
      include: { subject: true, grades: { where: { student: { classId: classId } } } },
      orderBy: { date: 'asc' } // 🔄 Adapté au nouveau schéma : date en minuscules
    });

    const evolutionData = assessments.map(assessment => {
      let totalValue = 0;
      
      // 🔄 Adapté au nouveau schéma : value et maxGrade en minuscules
      assessment.grades.forEach(grade => { 
        totalValue += (grade.value / assessment.maxGrade) * 20; 
      });
      
      const average = assessment.grades.length > 0 ? (totalValue / assessment.grades.length) : null;
      
      return {
        // 🔄 Adapté au nouveau schéma : date, label et subject.label en minuscules
        date: new Date(assessment.date).toLocaleDateString('fr-FR'),
        evaluation: assessment.label,
        matiere: assessment.subject.label,
        moyenne: average ? parseFloat(average.toFixed(2)) : null
      };
    }).filter(item => item.moyenne !== null);

    return { success: true, data: evolutionData };
  } catch (error) {
    console.error("Erreur [getClassEvolution]:", error);
    return { success: false, error: "Erreur lors du calcul de l'évolution." };
  }
}