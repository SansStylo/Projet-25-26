import { prisma } from '@/app/lib/db';

// ====== 0. RÉCUPÉRER LES DONNÉES FILTRÉES PAR GROUPES ======
export async function getFilteredDataByClasses(classIds: number[]) {
  try {
    if (classIds.length === 0) {
      return { success: false, error: "Aucune classe sélectionnée." };
    }

    // Récupérer toutes les classes sélectionnées
    const classes = await prisma.class.findMany({
      where: { ClassID: { in: classIds } },
      include: {
        students: {
          include: {
            grades: {
              include: {
                assessment: {
                  include: { subject: true }
                }
              }
            }
          }
        }
      },
      orderBy: { Label: 'asc' }
    });

    // Calcul des stats de chaque classe
    const classesData = classes.map(classData => {
      let totalWeightedGrades = 0;
      let totalWeights = 0;
      let totalStudents = classData.students.length;

      classData.students.forEach(student => {
        student.grades.forEach(grade => {
          const gradeOn20 = (grade.Value / grade.assessment.MaxGrade) * 20;
          totalWeightedGrades += gradeOn20 * grade.assessment.Weight;
          totalWeights += grade.assessment.Weight;
        });
      });

      const globalAverage = totalWeights > 0 ? (totalWeightedGrades / totalWeights) : null;

      return {
        classId: classData.ClassID,
        className: classData.Label,
        totalStudents,
        globalAverage: globalAverage ? parseFloat(globalAverage.toFixed(2)) : null
      };
    });

    // Calcul des moyennes par matière
    const subjectsMap: Record<number, { name: string; totalWeighted: number; totalWeights: number }> = {};
    
    classes.forEach(classData => {
      classData.students.forEach(student => {
        student.grades.forEach(grade => {
          const subjectId = grade.assessment.subject.SubjectID;
          const subjectName = grade.assessment.subject.Label;
          const gradeOn20 = (grade.Value / grade.assessment.MaxGrade) * 20;

          if (!subjectsMap[subjectId]) {
            subjectsMap[subjectId] = { name: subjectName, totalWeighted: 0, totalWeights: 0 };
          }
          subjectsMap[subjectId].totalWeighted += gradeOn20 * grade.assessment.Weight;
          subjectsMap[subjectId].totalWeights += grade.assessment.Weight;
        });
      });
    });

    const subjectsPerformance = Object.entries(subjectsMap)
      .map(([id, data]) => ({
        subjectId: parseInt(id),
        subjectName: data.name,
        average: parseFloat((data.totalWeighted / data.totalWeights).toFixed(2))
      }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

    // Comparaison par matière
    const comparisonData = Object.values(subjectsMap).map(subjectData => ({
      subjectName: subjectData.name,
      ...Object.fromEntries(
        classesData.map(cls => {
          let totalWeighted = 0;
          let totalWeights = 0;
          
          classes.find(c => c.ClassID === cls.classId)?.students.forEach(student => {
            student.grades.forEach(grade => {
              if (grade.assessment.subject.Label === subjectData.name) {
                const gradeOn20 = (grade.Value / grade.assessment.MaxGrade) * 20;
                totalWeighted += gradeOn20 * grade.assessment.Weight;
                totalWeights += grade.assessment.Weight;
              }
            });
          });

          return [
            cls.className,
            totalWeights > 0 ? parseFloat((totalWeighted / totalWeights).toFixed(2)) : null
          ];
        })
      )
    }));

    const globalStats = {
      totalClasses: classesData.length,
      totalStudents: classesData.reduce((sum, c) => sum + c.totalStudents, 0),
      globalAverage: classesData.length > 0 
        ? parseFloat(
            (classesData.reduce((sum, c) => sum + (c.globalAverage || 0), 0) / classesData.length).toFixed(2)
          )
        : null
    };

    return {
      success: true,
      data: {
        globalStats,
        subjectsPerformance,
        comparisonData,
        selectedClasses: classesData
      }
    };
  } catch (error) {
    console.error("Erreur [getFilteredDataByClasses]:", error);
    return { success: false, error: "Erreur lors du calcul des données filtrées." };
  }
}

// ====== 1. VUE GLOBALE MULTI-GROUPES ======
export async function getAllClassesOverview() {
  try {
    const classes = await prisma.class.findMany({
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
      },
      orderBy: { Label: 'asc' }
    });

    const classesData = classes.map(classData => {
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
        classId: classData.ClassID,
        className: classData.Label,
        totalStudents,
        globalAverage: globalAverage ? parseFloat(globalAverage.toFixed(2)) : null
      };
    });

    return { success: true, data: classesData };
  } catch (error) {
    console.error("Erreur [getAllClassesOverview]:", error);
    return { success: false, error: "Erreur lors du calcul de la vue globale." };
  }
}

// ====== 2. SYNTHÈSE DES PERFORMANCES PAR MATIÈRE TOUTES CLASSES ======
export async function getAllSubjectsPerformance() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        assessments: {
          include: {
            grades: true
          }
        }
      }
    });

    const performanceData = subjects.map(subject => {
      let totalWeightedGrades = 0;
      let totalWeights = 0;
      let hasGrades = false;

      subject.assessments.forEach(assessment => {
        assessment.grades.forEach(grade => {
          const gradeOn20 = (grade.Value / assessment.MaxGrade) * 20;
          totalWeightedGrades += gradeOn20 * assessment.Weight;
          totalWeights += assessment.Weight;
          hasGrades = true;
        });
      });

      if (!hasGrades) return null;

      return {
        subjectId: subject.SubjectID,
        subjectName: subject.Label,
        average: parseFloat((totalWeightedGrades / totalWeights).toFixed(2))
      };
    }).filter(item => item !== null);

    return { success: true, data: performanceData };
  } catch (error) {
    console.error("Erreur [getAllSubjectsPerformance]:", error);
    return { success: false, error: "Erreur lors du calcul des stats par matière." };
  }
}

// ====== 3. COMPARAISON DES CLASSES PAR MATIÈRE ======
export async function getClassesComparisonBySubject() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            grades: {
              include: {
                assessment: {
                  include: { subject: true }
                }
              }
            }
          }
        }
      },
      orderBy: { Label: 'asc' }
    });

    const subjects = await prisma.subject.findMany();
    
    const comparisonData = subjects.map(subject => {
      const dataPoint: any = { subjectName: subject.Label };

      classes.forEach(classData => {
        let totalWeightedGrades = 0;
        let totalWeights = 0;

        classData.students.forEach(student => {
          student.grades.forEach(grade => {
            if (grade.assessment.subject.SubjectID === subject.SubjectID) {
              const gradeOn20 = (grade.Value / grade.assessment.MaxGrade) * 20;
              totalWeightedGrades += gradeOn20 * grade.assessment.Weight;
              totalWeights += grade.assessment.Weight;
            }
          });
        });

        dataPoint[classData.Label] = totalWeights > 0 
          ? parseFloat((totalWeightedGrades / totalWeights).toFixed(2)) 
          : null;
      });

      return dataPoint;
    });

    return { success: true, data: comparisonData };
  } catch (error) {
    console.error("Erreur [getClassesComparisonBySubject]:", error);
    return { success: false, error: "Erreur lors du calcul de la comparaison." };
  }
}

// ====== 4. VUE GLOBALE DE LA CLASSE (KPIs) ======
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

// ====== 5. SYNTHÈSE DES PERFORMANCES PAR MATIÈRE ======
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

// ====== 6. ÉVOLUTION CHRONOLOGIQUE DE LA CLASSE ======
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