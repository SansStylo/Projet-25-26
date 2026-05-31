import { prisma } from '@/app/lib/db';

export async function getStudentsAtRisk(classId: number) {
  try {
    // 1. Récupération de tous les étudiants de la classe avec leurs notes et coefficients
    // 🔄 Adapté au nouveau schéma : classId en minuscules
    const students = await prisma.student.findMany({
      where: { classId: classId },
      include: {
        grades: {
          include: {
            assessment: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    // 2. Calcul du profil de risque pour chaque étudiant
    const atRiskProfiles = students.map((student) => {
      let totalWeightedGrades = 0;
      let totalWeights = 0;
      const subjectGradesMap: Record<number, { name: string; total: number; count: number; weights: number }> = {};
      let lowGradesCount = 0;
      const flags: string[] = [];

      // Analyse de chaque note de l'étudiant
      student.grades.forEach((grade) => {
        const assessment = grade.assessment;
        const subject = assessment.subject;
        
        // 🔄 Adapté au nouveau schéma : weight et maxGrade en minuscules
        const coefficient = assessment.weight;
        const gradeOn20 = (grade.value / assessment.maxGrade) * 20; // value en minuscules

        // Cumul pour la moyenne générale globale
        totalWeightedGrades += gradeOn20 * coefficient;
        totalWeights += coefficient;

        // Groupement par matière pour détecter les faiblesses ciblées
        // 🔄 Adapté au nouveau schéma : subjectId et label en minuscules
        if (!subjectGradesMap[subject.subjectId]) {
          subjectGradesMap[subject.subjectId] = {
            name: subject.label,
            total: 0,
            count: 0,
            weights: 0,
          };
        }
        subjectGradesMap[subject.subjectId].total += gradeOn20 * coefficient;
        subjectGradesMap[subject.subjectId].count += 1;
        subjectGradesMap[subject.subjectId].weights += coefficient;

        // Alerte : Note critique isolée (inférieure à 5/20)
        if (gradeOn20 < 5) {
          lowGradesCount++;
        }
      });

      // Calcul des moyennes
      const globalAverage = totalWeights > 0 ? totalWeightedGrades / totalWeights : null;

      // Calcul dynamique du score de risque (sur 100)
      let riskScore = 0;

      // RÈGLE A : Moyenne générale sous la moyenne
      if (globalAverage !== null) {
        if (globalAverage < 10) {
          riskScore += 40;
          flags.push(`Moyenne générale critique (${globalAverage.toFixed(2)}/20)`);
        } else if (globalAverage < 12) {
          riskScore += 15;
          flags.push(`Moyenne générale fragile (${globalAverage.toFixed(2)}/20)`);
        }
      }

      // RÈGLE B : Vérification des moyennes par matière
      Object.keys(subjectGradesMap).forEach((subId) => {
        const subjectId = parseInt(subId, 10);
        const data = subjectGradesMap[subjectId];
        const subjectAverage = data.total / data.weights;

        if (subjectAverage < 10) {
          riskScore += 10; // +10 points de risque par matière non validée
          flags.push(`En difficulté en ${data.name} (${subjectAverage.toFixed(2)}/20)`);
        }
      });

      // RÈGLE C : Accumulation de notes catastrophiques accidentelles
      if (lowGradesCount > 0) {
        riskScore += Math.min(lowGradesCount * 5, 20); // 5 points par note < 5, max 20 points
        flags.push(`${lowGradesCount} note(s) inférieure(s) à 5/20`);
      }

      // Plafonnement du score de risque entre 0 et 100
      riskScore = Math.min(Math.max(riskScore, 0), 100);

      // Attribution du libellé de sévérité du risque
      let riskLevel: 'FAIBLE' | 'MODERE' | 'CRITIQUE' = 'FAIBLE';
      if (riskScore >= 60) {
        riskLevel = 'CRITIQUE';
      } else if (riskScore >= 25) {
        riskLevel = 'MODERE';
      }

      // 🔄 Adapté au nouveau schéma : studentId, firstname, surname en camelCase
      return {
        studentId: student.studentId.toString(),
        firstname: student.firstname,
        surname: student.surname,
        globalAverage,
        riskScore,
        riskLevel,
        flags,
      };
    });

    // Tri pour afficher les élèves les plus en danger en premier
    atRiskProfiles.sort((a, b) => b.riskScore - a.riskScore);

    return { success: true, data: atRiskProfiles };
  } catch (error) {
    console.error("Erreur [getStudentsAtRisk]:", error);
    return { success: false, error: "Impossible de calculer les indices de risque." };
  }
}