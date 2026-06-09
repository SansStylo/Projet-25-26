/**
 * app/actions.ts
 * 
 * Server Actions pour la gestion de l'authentification
 * 
 * Rôle:
 * - Traite les soumissions du formulaire de connexion côté serveur
 * - Valide les identifiants de l'utilisateur
 * - Crée une session de sécurité dans la base de données
 * - Stocke le token de session dans un cookie HTTP-only
 * - Redirige l'utilisateur vers son espace selon son rôle
 * 
 * Fonctionnement:
 * - Recherche l'utilisateur par email
 * - Vérifie le mot de passe
 * - Génère un UUID comme token de session
 * - Crée un enregistrement Session en BDD (expire dans 24h)
 * - Définit un cookie sécurisé (httpOnly, secure)
 * - Redirige selon le rôle: admin → /admin, responsable → /responsable, enseignant → /dashboard
 */

"use server";

import { prisma } from "./lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import nodemailer from "nodemailer";


export async function getSubjects() {
  try {
    return await prisma.subject.findMany({
      orderBy: { subjectId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des matières :", error);
    return [];
  }
}

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { userId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return [];
  }
}

export async function getStudents() {
  try {
    return await prisma.student.findMany({
      orderBy: { studentId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants :", error);
    return [];
  }
}

export async function getStudentsByClass(classId: number) {
  const students = await prisma.student.findMany({
    where: { classId },
    select: {
      studentId: true,
      firstname: true,
      surname: true,
      grades: { select: { value: true } },
    },
    orderBy: { surname: 'asc' },
  });

  return students.map(student => {
    const values = student.grades.map(g => g.value);
    const globalAverage = values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : null;
    return {
      studentId: Number(student.studentId),
      firstname: student.firstname,
      surname: student.surname,
      globalAverage,
    };
  });
}

export async function getStudentsBySubject(subjectId: number) {
  const students = await prisma.student.findMany({
    where: {
      grades: { some: { assessment: { subjectId } } },
    },
    select: {
      studentId: true,
      firstname: true,
      surname: true,
      grades: {
        where: { assessment: { subjectId } },
        select: { value: true },
      },
    },
    orderBy: { surname: 'asc' },
  });

  return students.map(student => {
    const values = student.grades.map(g => g.value);
    const grade = values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : null;
    return {
      studentId: Number(student.studentId),
      firstname: student.firstname,
      surname: student.surname,
      grade,
    };
  });}
export async function getStudentAssignments() {
  try {
    return await prisma.studentAssignments.findMany({
      orderBy: { studentId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des assignements :", error);
    return [];
  }
}

export async function getTeacherAssignments() {
  try {
    return await prisma.teacherAssignments.findMany({
      orderBy: { teacherId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des assignements :", error);
    return [];
  }
}

export async function getSubjectAssignments() {
  try {
    return await prisma.subjectAssignments.findMany({
      orderBy: { studentId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des assignements :", error);
    return [];
  }
}

export async function getGroups() {
  try {
    return await prisma.group.findMany({
      orderBy: { groupId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des groupes :", error);
    return [];
  }
}

export async function getClass() {
  try {
    return await prisma.class.findMany({
      orderBy: { classId: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des classes :", error);
    return [];
  }
}

export async function addDebugSubject(label: string) {
  try {
    return await prisma.subject.create({
      data: { label },
    });
  } catch (error) {
    console.error("Erreur lors de la création de la matière de debug :", error);
    throw new Error("Impossible de créer la matière");
  }
}

export async function addDebugUser(mail : string, password : string, firstname : string, surname : string, level : number) {
  try {
    return await prisma.user.create({
      data: { mail, password, firstname, surname, level },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur de debug :", error);
    throw new Error("Impossible de créer l'utilisateur'");
  }
}

export async function addDebugStudent(classId : number | null, firstname : string, surname : string) {
  try {
    const finalClassId = classId && classId !== 0 ? classId : null;

    return await prisma.student.create({
      data: {
        firstname,
        surname,
        classId: finalClassId, 
      },
    });
  } catch (error: any) {
    console.error("Détails du blocage Prisma :", error);
    throw new Error(`Erreur Prisma brute : ${error.message || error}`);
  }
}

export async function searchStudents(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { firstname: { contains: query, mode: 'insensitive' } },
          { surname: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        class: true,
        subjectAssignments: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [
        { surname: 'asc' },
        { firstname: 'asc' },
      ],
    });
    return students.map(student => ({
      ...student,
      studentId: student.studentId.toString(),
      classId: student.classId ? Number(student.classId) : null,
      subjectAssignments: student.subjectAssignments.map(sa => ({
        ...sa,
        studentId: sa.studentId.toString(),
        subjectId: Number(sa.subjectId)
      }))
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche d'étudiants :", error);
    return [];
  }
}

export async function searchStudentsForTeacher(
  query: string,
  teacherId: bigint
) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const teacherAssignments = await prisma.teacherAssignments.findMany({
      where: { teacherId },
      select: { subjectId: true },
    });

    const subjectIds = teacherAssignments.map((ta) => ta.subjectId);
    if (subjectIds.length === 0) return [];

    const students = await prisma.student.findMany({
      where: {
        AND: [
          {
            OR: [
              { firstname: { contains: query, mode: "insensitive" } },
              { surname: { contains: query, mode: "insensitive" } },
            ],
          },
          {
            subjectAssignments: {
              some: { subjectId: { in: subjectIds } },
            },
          },
        ],
      },
      include: {
        class: true,
        subjectAssignments: {
          include: { subject: true },
        },
      },
      orderBy: [{ surname: "asc" }, { firstname: "asc" }],
    });
    return students.map(student => ({
      ...student,
      studentId: student.studentId.toString(),
      classId: student.classId ? Number(student.classId) : null,
      subjectAssignments: student.subjectAssignments.map(sa => ({
        ...sa,
        studentId: sa.studentId.toString(),
        subjectId: Number(sa.subjectId)
      }))
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la recherche filtrée d'étudiants :",
      error
    );
    return [];
  }
}

export async function getStudentDetail(studentId: bigint) {
  try {
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        class: true,
        subjectAssignments: {
          include: {
            subject: true,
          },
        },
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
    if (!student) return null;
    return {
      ...student,
      studentId: student.studentId.toString(),
      classId: student.classId ? Number(student.classId) : null,
      subjectAssignments: student.subjectAssignments.map(sa => ({
        ...sa,
        studentId: sa.studentId.toString(),
        subjectId: Number(sa.subjectId)
      })),
      grades: student.grades.map(grade => ({
        ...grade,
        studentId: grade.studentId.toString(),
        assessmentId: grade.assessmentId.toString(),
        value: Number(grade.value), // 🌟 Conversion Decimal -> number cruciale !
        assessment: {
          ...grade.assessment,
          assessmentId: grade.assessment.assessmentId.toString(),
          userId: grade.assessment.userId.toString(),
          subjectId: Number(grade.assessment.subjectId),
          maxGrade: Number(grade.assessment.maxGrade), // 🌟 Ici aussi
          weight: Number(grade.assessment.weight)       // 🌟 Et ici
        }
      }))
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'étudiant :", error);
    return null;}}
export async function addGroup(label: string, studentIds: bigint[]) {
  try {
    // 1. On crée d'abord le groupe en BDD
    const userId = await getCurrentUserId();
    const newGroup = await prisma.group.create({
      data: {
        label: label,
      },
    });

    // 2. Si on a des étudiants sélectionnés, on crée les liaisons dans StudentAssignments
    if (studentIds.length > 0) {
      await prisma.studentAssignments.createMany({
        data: studentIds.map((id) => ({
          groupId: newGroup.groupId, // ID du groupe fraîchement créé
          studentId: id,
        })),
      });
    }

    writeLogAction(`Group ${newGroup.groupId} created`, userId);
    return newGroup;
  } catch (error) {
    console.error("Erreur lors de la création du groupe et de ses assignations :", error);
    throw new Error("Impossible de créer le groupe.");
  }
}

export async function addClass(label: string, studentIds: bigint[]) {
  try {
    // 1. On crée d'abord la classe en BDD
    const userId = await getCurrentUserId();
    const newClass = await prisma.class.create({
      data: {
        label: label,
      },
    });

    // 2. Si on a des étudiants sélectionnés, on met à jour leur classId direct
    if (studentIds.length > 0) {
      await prisma.student.updateMany({
        where: {
          studentId: { in: studentIds },
        },
        data: {
          classId: newClass.classId, // ID de la classe fraîchement créée
        },
      });
    }

    writeLogAction(`Class ${newClass.classId} created`, userId);
    return newClass;
  } catch (error) {
    console.error("Erreur lors de la création de la classe et de l'assignation des étudiants :", error);
    throw new Error("Impossible de créer la classe.");
  }
}

export async function updateTeacherAssignments(subjectId: number, teacherIds: bigint[]) {
  try {
    // On utilise une transaction pour s'assurer que tout s'exécute ou que tout s'annule en cas d'erreur
    return await prisma.$transaction([
      // 1. On supprime TOUS les anciens assignements pour cette matière précise
      prisma.teacherAssignments.deleteMany({
        where: { subjectId: subjectId },
      }),
      // 2. On ré-insère la nouvelle liste propre de profs sélectionnés
      prisma.teacherAssignments.createMany({
        data: teacherIds.map((id) => ({
          subjectId: subjectId,
          teacherId: id,
        })),
      }),
    ]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des assignements :", error);
    throw new Error("Impossible de mettre à jour les assignements des enseignants.");
  }
}

export async function updateSubjectAssignments(studentIds: bigint[], subjectId: number) {
  try {
    // On utilise une transaction pour s'assurer que tout s'exécute ou que tout s'annule en cas d'erreur
    return await prisma.$transaction([
      // 1. On supprime TOUS les anciens assignements pour cette matière précise
      prisma.subjectAssignments.deleteMany({
        where: { subjectId: subjectId },
      }),
      // 2. On ré-insère la nouvelle liste propre de profs sélectionnés
      prisma.subjectAssignments.createMany({
        data: studentIds.map((id) => ({
          subjectId: subjectId,
          studentId: id,
        })),
      }),
    ]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des assignements :", error);
    throw new Error("Impossible de mettre à jour les assignements des enseignants.");
  }
}

export async function updateStudentAssignments(studentIds: bigint[], groupId: number) {
  try {
    // On utilise une transaction pour s'assurer que tout s'exécute ou que tout s'annule en cas d'erreur
    return await prisma.$transaction([
      // 1. On supprime TOUS les anciens assignements pour cette matière précise
      prisma.studentAssignments.deleteMany({
        where: { groupId: groupId },
      }),
      // 2. On ré-insère la nouvelle liste propre de profs sélectionnés
      prisma.studentAssignments.createMany({
        data: studentIds.map((id) => ({
          groupId: groupId,
          studentId: id,
        })),
      }),
    ]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des assignements :", error);
    throw new Error("Impossible de mettre à jour les assignements des étudiants.");
  }
}

export async function updateStudentClass(studentIds: bigint[], classId: number) {
  try {
    await prisma.$transaction([
      // 1. On retire de cette classe tous les étudiants qui y étaient
      prisma.student.updateMany({
        where: { classId: classId },
        data: { classId: null },
      }),
      // 2. On assigne la classe aux nouveaux étudiants sélectionnés dans la liste
      prisma.student.updateMany({
        where: {
          studentId: { in: studentIds },
        },
        data: { classId: classId },
      }),
    ]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la classe :", error);
    throw new Error("Impossible de mettre à jour les étudiants de la classe.");
  }
}

export async function deleteGroup(groupId: bigint) {
  try {
    const userId = await getCurrentUserId();
    const result = await prisma.$transaction([
      prisma.studentAssignments.deleteMany({ where: { groupId } }),
      prisma.group.delete({ where: { groupId } }),
    ]);
    writeLogAction(`Group ${groupId} deleted`, userId);
    return result;
  } catch (error) {
    console.error("Erreur suppression groupe:", error);
    throw new Error("Impossible de supprimer le groupe.");
  }
}

export async function deleteClass(classId: number) {
  try {
    const userId = await getCurrentUserId();
    const result = await prisma.$transaction([
      // On remet à null le classId des étudiants concernés
      prisma.student.updateMany({
        where: { classId },
        data: { classId: null },
      }),
      prisma.class.delete({ where: { classId } }),
    ]);
    writeLogAction(`Class ${classId} deleted`, userId);
    return result;
  } catch (error) {
    console.error("Erreur suppression classe:", error);
    throw new Error("Impossible de supprimer la classe.");
  }
}

export async function renameGroup(groupId: bigint, newLabel: string) {
  const userId = await getCurrentUserId();
  const result = await prisma.group.update({
    where: { groupId },
    data: { label: newLabel },
  });
  writeLogAction(`Group ${groupId} renamed`, userId);
  return result;
}

export async function renameClass(classId: number, newLabel: string) {
  const userId = await getCurrentUserId();
  const result = await prisma.class.update({
    where: { classId },
    data: { label: newLabel },
  });
  writeLogAction(`Class ${classId} renamed`, userId);
  return result;
}

export async function loginAction(
  prevState: { error: string | null },
  formData: FormData
) {
  const mail = formData.get("email") as string;
  const password = formData.get("mot_de_passe") as string;

  let redirectPath: string | null = null;

  try {
    // Cherche l'utilisateur par email (champ 'mail' dans le nouveau schéma)
    const user = await prisma.user.findUnique({
      where: { mail },
    });

    // Vérifie que l'utilisateur existe et que le mot de passe est correct


    if (!user || user.password !== password) {
      return { error: "Email ou mot de passe incorrect" };
    }

    // Génère un token de session unique et fixe l'expiration à 24h
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    // Crée l'enregistrement de session en base de données
    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.userId,
        expiresAt: expiresAt,
      },
    });

    // Stocke le token dans un cookie sécurisé (httpOnly, secure en production)
    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    // Redirige vers la page appropriée selon le niveau (level) de l'utilisateur
    // 0 = enseignant, 1 = responsable, 2 = admin
    switch (user.level) {
      case 2: // admin
        redirectPath = '/admin';
        break;
      case 1: // responsable
        redirectPath = '/responsable';
        break;
      case 0: // enseignant
      default:
        redirectPath = '/dashboard';
    }
  } catch (e) {
    console.error("Erreur de base de données:", e);
    return { error: "Une erreur est survenue lors de la tentative de connexion." };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
  
  return prevState;
}

/**
 * Action serveur pour la déconnexion
 * 
 * Supprime la session de la base de données et le cookie de session
 * Redirige vers la page de connexion
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (sessionToken) {
      // Supprime la session de la base de données
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      });
    }

    // Supprime le cookie
    cookieStore.delete("session_token");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }

  redirect("/");
}


/**
 * Action serveur pour la page de gestion des notes
 * Récupère les matières et les tables d'évaluation, en gérant le problème des BigInt
 */
export async function getDropdownData() {
  try {
    // 1. Récupère toutes les matières
    const subjects = await prisma.subject.findMany({
      orderBy: { label: 'asc' }
    });

    // 2. Récupére toutes les tables de notes
    const assessments = await prisma.assessment.findMany({
      orderBy: { date: 'desc' }
    });

    // 3. Conversion du BigInt en String pour éviter certains crash
    const formattedAssessments = assessments.map((assessment) => ({
      ...assessment,
      assessmentId: assessment.assessmentId.toString(),
    }));

    return { subjects, assessments: formattedAssessments };
  } catch (error) {
    console.error("Erreur lors de la récupération des données pour les menus:", error);
    return { subjects: [], assessments: [] };
  }
}


/**
 * Récupère les professeurs assignés à une matière précise,
 * ainsi que l'ensemble des groupes disponibles pour la modale.
 */
export async function getModalData(subjectIdStr: string) {
  try {
    const subjectId = parseInt(subjectIdStr, 10);

    // 1. Récupère les profs assignés à cette matière
    const teacherAssignments = await prisma.teacherAssignments.findMany({
      where: { subjectId: subjectId },
      include: { teacher: true }
    });

    // Formatage (conversion BigInt - string)
    const teachers = teacherAssignments.map(ta => ({
      id: ta.teacher.userId.toString(),
      nom: ta.teacher.surname,
      prenom: ta.teacher.firstname
    }));

    // 2. Récupère les groupes
    const groupsDb = await prisma.group.findMany({
      orderBy: { label: 'asc' }
    });

    const groups = groupsDb.map(g => ({
      id: g.groupId.toString(),
      label: g.label
    }));

    return { teachers, groups };
  } catch (error) {
    console.error("Erreur :", error);
    return { teachers: [], groups: [] };
  }
}

/**
 * Création d'une nouvelle table de notation et liaison des groupes
 */
export async function createAssessment(data: {
  subjectId: string;
  userId: string;
  maxGrade: number;
  weight: number;
  date: string;
  label: string;
  groupIds: string[];
}) {
  try {
    const newAssessment = await prisma.assessment.create({
      data: {
        subjectId: parseInt(data.subjectId, 10),
        userId: BigInt(data.userId),
        maxGrade: data.maxGrade,
        weight: data.weight,
        date: new Date(data.date),
        label: data.label,
        groupAssignments: {
          create: data.groupIds.map(id => ({
            groupId: BigInt(id)
          }))
        }
      }
    });

    writeLogAction(`Assessment ${data.label} created`, data.userId);

    return { success: true, assessmentId: newAssessment.assessmentId.toString() };
  } catch (error) {
    console.error("Erreur lors de la création de la table de notation:", error);
    return { success: false, error: "Impossible de créer la table." };
  }
}

/**
 * Récupère les détails d'une évaluation existante pour pré-remplir la modale
 */
export async function getAssessmentDetails(assessmentIdStr: string) {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { assessmentId: BigInt(assessmentIdStr) },
      include: { groupAssignments: true }
    });

    if (!assessment) return null;

    return {
      userId: assessment.userId.toString(),
      maxGrade: assessment.maxGrade.toString(),
      weight: assessment.weight.toString(),
      date: assessment.date.toISOString().split('T')[0],
      label: assessment.label,
      groupIds: assessment.groupAssignments.map(ga => ga.groupId.toString())
    };
  } catch (error) {
    console.error("Erreur :", error);
    return null;
  }
}

/**
 * Met à jour une évaluation existante et ses groupes
 */
export async function updateAssessment(assessmentIdStr: string, data: {
  userId: string; maxGrade: number; weight: number; date: string; label: string; groupIds: string[];
}) {
  try {
    await prisma.assessment.update({
      where: { assessmentId: BigInt(assessmentIdStr) },
      data: {
        userId: BigInt(data.userId),
        maxGrade: data.maxGrade,
        weight: data.weight,
        date: new Date(data.date),
        label: data.label,
        groupAssignments: {
          deleteMany: {},
          create: data.groupIds.map(id => ({ groupId: BigInt(id) }))
        }
      }
    });

    // 1. Recherche des étudiants des groupes selectionnés
    const validGroupIds = data.groupIds.map(id => BigInt(id));
    const validStudents = await prisma.student.findMany({
      where: {
        studentAssignments: { some: { groupId: { in: validGroupIds } } }
      },
      select: { studentId: true }
    });
    const validStudentIds = validStudents.map(s => s.studentId);

    // 2. Suppression de la note si l'étudiant n'est pas dans la liste
    await prisma.grade.deleteMany({
      where: {
        assessmentId: BigInt(assessmentIdStr),
        studentId: { notIn: validStudentIds }
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: `Erreur : ${error.message}` };
  }
}

/**
 * Supprime une évaluation
 */
export async function deleteAssessment(assessmentIdStr: string) {
  try {
    const userId = await getCurrentUserId();
    await prisma.assessment.delete({
      where: { assessmentId: BigInt(assessmentIdStr) }
    });
    writeLogAction(`Assessment ${assessmentIdStr} deleted`, userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: `Erreur : ${error.message}` };
  }
}

/**
 * Récupère la liste des étudiants appartenant aux groupes d'une évaluation
 */
export async function getAssessmentStudents(assessmentIdStr: string) {
  try {
    const assessmentId = BigInt(assessmentIdStr);

    // Recherche des étudiants
    const studentsDb = await prisma.student.findMany({
      where: {
        studentAssignments: {
          some: {
            group: {
              groupAssignments: {
                some: { assessmentId: assessmentId }
              }
            }
          }
        }
      },
      include: {
        grades: {
          where: { assessmentId: assessmentId }
        }
      },
      orderBy: { surname: 'asc' }
    });

    // 2. Formatage des données
    return studentsDb.map(student => ({
      id: student.studentId.toString(),
      nom: student.surname,
      prenom: student.firstname,
      note: student.grades[0] ? student.grades[0].value.toString() : "--",
      feedback: student.grades[0] ? student.grades[0].feedback : ""
    }));
  } catch (error) {
    console.error("Erreur :", error);
    return [];
  }
}

/**
 * Ajout ou met à jour de la note et du feedback d'un étudiant
 */
export async function saveGrade(assessmentIdStr: string, studentIdStr: string, value: number, feedback: string) {
  try {

    const userId = await getCurrentUserId();
    const assessmentId = BigInt(assessmentIdStr);
    const studentId = BigInt(studentIdStr);

    // 1. Sauvegarder ou mettre à jour la note saisie
    await prisma.grade.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId: assessmentId,
          studentId: studentId
        }
      },
      update: {
        value: value,
        feedback: feedback
      },
      create: {
        assessmentId: assessmentId,
        studentId: studentId,
        value: value,
        feedback: feedback
      }
    });

    // 2. Récupérer l'évaluation courante pour connaître la matière (subjectId)
    const currentAssessment = await prisma.assessment.findUnique({
      where: { assessmentId: assessmentId },
      include: { subject: true }
    });

    if (!currentAssessment) return { success: true };
    const subjectId = currentAssessment.subjectId;

    // 3. Récupérer TOUTES les notes de cet élève pour cette matière
    const allGrades = await prisma.grade.findMany({
      where: {
        studentId: studentId,
        assessment: {
          subjectId: subjectId
        }
      },
      include: {
        assessment: true
      }
    });

    // 4. Calcul de la moyenne sur 20 (en utilisant "weight" et "maxGrade" de ton schéma)
    let totalPoints = 0;
    let totalWeights = 0;

    for (const g of allGrades) {
      const max = g.assessment.maxGrade || 20;
      const weight = g.assessment.weight || 1;
      
      // Convertir le type Decimal de Prisma en Number standard JavaScript
      const gradeValue = Number(g.value);
      
      // On ramène la note sur 20
      const normalizedValue = (gradeValue / max) * 20; 
      
      totalPoints += normalizedValue * weight;
      totalWeights += weight;
    }

    const average = totalWeights > 0 ? (totalPoints / totalWeights) : null;

    // 5. Si la moyenne passe en dessous de 8, on envoie les notifications
    if (average !== null && average < 8) {
      const student = await prisma.student.findUnique({
        where: { studentId: studentId }
      });

      if (student) {
        // A. Trouver les responsables pédagogiques (level = 1)
        const responsables = await prisma.user.findMany({
          where: { level: 1 }
        });

        // B. Trouver les profs assignés à cette matière
        const profs = await prisma.teacherAssignments.findMany({
          where: { subjectId: subjectId }
        });

        // Utilisation d'un Set pour éviter les doublons si un prof est aussi responsable
        const targetUserIds = new Set<bigint>();
        responsables.forEach(r => targetUserIds.add(r.userId));
        profs.forEach(p => targetUserIds.add(p.teacherId));

        const subjectLabel = currentAssessment.subject?.label || "Matière inconnue";
        const titleNotification = `Alerte de niveau`;
        const messageNotification = `La moyenne de ${student.firstname} ${student.surname} est de ${average.toFixed(2)}/20 en ${subjectLabel}.`;
        
        // J'imagine que le champ "returns" sert à rediriger l'utilisateur vers une page spécifique au clic ?
        // Je mets une chaîne ou une route par défaut, tu pourras l'adapter
        const linkPath = "/grades"; 

        // C. Préparer les données pour l'insertion multiple
        const notificationsData = Array.from(targetUserIds).map(userId => ({
          userId: userId,
          title: titleNotification,
          message: messageNotification,
          returns: linkPath
        }));

        if (notificationsData.length > 0) {
          await prisma.notification.createMany({
            data: notificationsData
          });
          await writeLogAction(`Alert notification for ${student.firstname} ${student.surname} (Moyenne < 8) created`);
        }
      }
    }

    await writeLogAction(
      `Assessment of ${studentIdStr} modified, (Note: ${value}/20) for evaluation ${assessmentIdStr}`,
      userId
    );

    return { success: true };
  } catch (error: any) {
    console.error("Erreur lors de l'enregistrement de la note :", error);
    return { success: false, error: `Erreur : ${error.message}` };
  }
}

export async function getUserNotifications(userIdStr: string) {
  try {
    const notifs = await prisma.notification.findMany({
      where: { userId: BigInt(userIdStr) },
      orderBy: { notificationId: 'desc' }
    });

    // On convertit les BigInt en chaînes/nombres pour éviter les erreurs de sérialisation Next.js client
    return notifs.map(n => ({
      id: n.notificationId.toString(),
      type: n.title,
      text: n.message,
      returns: n.returns
    }));
  } catch (error) {
    console.error("Erreur getUserNotifications:", error);
    return [];
  }
}

export async function deleteNotificationAction(notificationIdStr: string) {
  try {
    const userId = await getCurrentUserId();
    await prisma.notification.delete({
      where: { notificationId: BigInt(notificationIdStr) }
    });
    writeLogAction(`Notification ${notificationIdStr} deleted`, userId);
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteNotificationAction:", error);
    return { success: false };
  }
}

/**
 * Gestion de l'oubli de mot de passe/nouveau mot de passe
 * avec envoi d'un code par e-mail automatique
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "junialytics@gmail.com",
    pass: process.env.GMAIL_PASS, // Mot de passe d'application Google à 16 caractères
  },
});

export async function sendResetCodeEmail(targetEmail: string) {
  try {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
        where: { mail: targetEmail },
      })
    if (!user) {
        return { success: false, error: "Aucun compte n'est associé à cette adresse." };
      }
    
    // Génération du code à 6 chiffres 
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Calcul de la date d'expiration 
    const quinze_minutes = 15 * 60 * 1000;
    const expiresAt = new Date(Date.now() + quinze_minutes)

    // 3. Stockage en base de données
    console.log("-> Début du stockage pour l'utilisateur ID :", user.userId);
    try {
      const resetEnregistre = await prisma.passwordReset.upsert({
        where: { userId: user.userId },
        update: {
          resetCode: code,
          validityTime: expiresAt,
        },
        create: {
          userId: user.userId,
          resetCode: code,
          validityTime: expiresAt,
        },
      });
    console.log("-> [BDD SUCCESS] Ligne enregistrée avec succès :", resetEnregistre);
    } catch (prismaError) {
      console.error("-> [BDD CRASH] Prisma n'a pas pu écrire dans PostgreSQL :", prismaError);
      return { success: false, error: "Erreur d'écriture en base de données." };
    }


    const mailOptions = {
      from: '"Junia\'lytics" <junialytics@gmail.com>',
      to: targetEmail,                     
      subject: "Votre code de récupération Junia'lytics",    
      text: `Votre code de validation est : ${code}. Il expirera dans 15 minutes.`,                          
      html:`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code de récupération Junia'lytics</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F4F7F5; padding: 40px 20px;">
          <tr>
            <td align="center">
              
              <!-- Conteneur Principal de la Carte -->
              <table role="presentation" width="100%" max-width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #E2EAE5; box-shadow: 0 4px 20px rgba(18,38,30,0.02); overflow: hidden;">
                
                <!-- En-tête / Bannière Haute -->
                <tr>
                  <td style="padding: 32px 32px 20px 32px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #12261E; tracking-tight: -0.025em;">Junia'lytics</h1>
                    <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 500; color: #53665A; text-transform: uppercase; letter-spacing: 0.05em;">Sécurité & Authentification</p>
                  </td>
                </tr>

                <!-- Ligne de séparation discrète -->
                <tr>
                  <td style="padding: 0 32px;">
                    <div style="height: 1px; background-color: #F0F4F1; width: 100%;"></div>
                  </td>
                </tr>

                <!-- Corps du message -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1E2E24;">
                      Bonjour,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #53665A;">
                      Nous avons reçu une demande de réinitialisation de mot de passe pour votre espace pédagogique. Utilisez le code secret temporaire ci-dessous pour valider votre identité :
                    </p>

                    <!-- Zone du Code Secret mis en valeur -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td align="center" style="padding: 18px; background-color: #F4F7F5; border-radius: 12px; border: 1px dashed #047857;">
                          <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #047857; font-family: monospace, monospace; padding-left: 0.25em;">${code}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Information d'expiration -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 8px;">
                          <span style="font-size: 16px;">⏱️</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0; font-size: 12px; font-weight: 600; color: #B91C1C;">
                            Ce code secret est strictement confidentiel et expirera dans 15 minutes.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <div style="height: 1px; background-color: #F0F4F1; width: 100%; margin-bottom: 24px;"></div>

                    <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #8A9A8E;">
                      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel restera inchangé.
                    </p>
                  </td>
                </tr>

                <!-- Pied de page -->
                <tr>
                  <td style="padding: 0 32px 32px 32px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #8A9A8E;">
                      Junia'lytics — Plateforme d'analyse académique.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `, 
  };
    await transporter.sendMail(mailOptions);

    writeLogAction(`Reset code sent`, user.userId.toString());

    return { success: true };

  } catch (error) {
    console.error("Erreur lors de la génération/envoi du code :", error);
    return { success: false, error: "Une erreur technique est survenue." };
  }
}
export async function verifyResetCode(targetEmail: string, codeSaisi: string) {
  try {
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        user: {
          mail: targetEmail,
        },
      },
    });

    if (!resetRequest) {
      return { success: false, error: "Aucune demande de récupération n'est active pour ce compte." };
    }

    const maintenant = new Date();
    if (maintenant > resetRequest.validityTime) {
      return { success: false, error: "Ce code a expiré. Veuillez en demander un nouveau." };
    }

    if (codeSaisi !== resetRequest.resetCode) {
      return { success: false, error: "Code de validation incorrect." };
    }

    return { success: true };

  } catch (error) {
    console.error("Erreur lors de la vérification du code :", error);
    return { success: false, error: "Une erreur système est survenue lors de la vérification." };
  }
}

// ÉTAPE 3 : Changement de mdp + nettoyage BDD
export async function updatePasswordAndCleanUp(targetEmail: string, newPasswordRaw: string) {
  try {
    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { mail: targetEmail },
    });

    if (!user) {
      return { success: true };
    }

    // 2. Hachage du mot de passe
    // fonction de hash existante (ex: bcrypt ou argon2), à appliquer ici :
    // const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);
    const passwordToStore = newPasswordRaw; // Remplace par hashedPassword

    // 3. Transaction Prisma : On met à jour le mot de passe ET on supprime le token de reset
    await prisma.$transaction([
      prisma.user.update({
        where: { userId: user.userId },
        data: { password: passwordToStore },
      }),
      // prisma.passwordReset.delete({
      //   where: { userId: user.userId },
      // }),
    ]);

    console.log(`[BDD] Mot de passe mis à jour avec succès pour ${targetEmail} et table PasswordReset nettoyée.`);

    writeLogAction(`Password changed`, user.userId.toString());

    return { success: true };

  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    return { success: false, error: "Impossible d'enregistrer le nouveau mot de passe." };
  }
}

/**
 * Récupère l'ID de l'utilisateur actuellement connecté
 * en vérifiant le jeton de session en base de données.
 */
export async function getCurrentUserId() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return null; // Pas de session active
    }

    // On cherche la session en BDD
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    // Si la session n'existe pas ou est expirée
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // On renvoie le userId converti en string (à cause du BigInt)
    return session.userId.toString();
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur courant :", error);
    return null;
  }
}

export async function writeLogAction(label: string, userIdStr?: string | null) {
  try {
    await prisma.logs.create({
      data: {
        label: label,
        userId: userIdStr ? BigInt(userIdStr) : null, // null = automatique / server
      },
    });
  } catch (error) {
    // On met un console.error pour le debug, mais on ne crash pas l'application pour un log raté
    console.error("Erreur lors de l'écriture du log système :", error);
  }
}

export async function updateUserAction(
  userIdStr: string, 
  data: { firstname: string; surname: string; mail: string; password: string }
) {
  try {
    const currentAdminId = await getCurrentUserId();
    
    await prisma.user.update({
      where: { userId: BigInt(userIdStr) },
      data: {
        firstname: data.firstname,
        surname: data.surname,
        mail: data.mail,
        password: data.password,
      },
    });

    await writeLogAction(`User ${userIdStr} updated details`, currentAdminId);
    return { success: true };
  } catch (error: any) {
    console.error("Erreur modification utilisateur:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(userIdStr: string) {
  try {
    const currentAdminId = await getCurrentUserId();
    
    // Si l'utilisateur a des sessions actives, on les nettoie d'abord
    await prisma.session.deleteMany({
      where: { userId: BigInt(userIdStr) }
    });

    await prisma.user.delete({
      where: { userId: BigInt(userIdStr) },
    });

    await writeLogAction(`User ${userIdStr} deleted`, currentAdminId);
    return { success: true };
  } catch (error: any) {
    console.error("Erreur suppression utilisateur:", error);
    return { success: false, error: error.message };
  }
}

export async function createUserAction(data: {
  firstname: string;
  surname: string;
  mail: string;
  password: string;
}) {
  try {
    const currentAdminId = await getCurrentUserId();
    
    const newUser = await prisma.user.create({
      data: {
        firstname: data.firstname,
        surname: data.surname,
        mail: data.mail,
        password: data.password,
        level: 0, // Par défaut enseignant (0 = prof, 1 = resp, 2 = admin)
      },
    });

    await writeLogAction(`New user account created: ${data.mail}`, currentAdminId);
    return { success: true, userId: newUser.userId.toString() };
  } catch (error: any) {
    console.error("Erreur création utilisateur:", error);
    return { success: false, error: error.message };
  }
}

export async function getSerializableUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { userId: 'asc' },
    });
    
    return users.map(user => ({
      ...user,
      userId: user.userId.toString(), // Évite le crash de sérialisation BigInt
    }));
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    return [];
  }
}

// ====== STATS TABLEAU DE BORD ENSEIGNANT ======
export async function getTeacherDashboardStats(teacherId: bigint) {
  try {
    const teacherAssignments = await prisma.teacherAssignments.findMany({
      where: { teacherId },
      include: { subject: true },
    });

    const subjectIds = teacherAssignments.map((ta) => ta.subjectId);

    if (subjectIds.length === 0) {
      return {
        success: true as const,
        data: {
          subjects: [],
          totalStudents: 0,
          globalAverage: null,
          atRiskCount: 0,
          criticalCount: 0,
          subjectAverages: [],
          atRiskStudents: [],
        },
      };
    }

    const subjectAssignments = await prisma.subjectAssignments.findMany({
      where: { subjectId: { in: subjectIds } },
      include: {
        student: {
          include: {
            grades: {
              include: {
                assessment: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    const studentMap = new Map<
      string,
      (typeof subjectAssignments)[0]["student"]
    >();
    subjectAssignments.forEach((sa) => {
      studentMap.set(sa.studentId.toString(), sa.student);
    });
    const students = Array.from(studentMap.values());

    const studentProfiles = students.map((student) => {
      const relevantGrades = student.grades.filter((g) =>
        subjectIds.includes(g.assessment.subjectId)
      );

      let totalWeightedGrades = 0;
      let totalWeights = 0;
      const studentSubjectMap: Record<
        number,
        { name: string; total: number; weights: number }
      > = {};
      let lowGradesCount = 0;
      const flags: string[] = [];

      relevantGrades.forEach((grade) => {
      const gradeOn20 = (Number(grade.value) / Number(grade.assessment.maxGrade)) * 20;

        totalWeightedGrades += gradeOn20 * grade.assessment.weight;
        totalWeights += grade.assessment.weight;

        const sid = grade.assessment.subjectId;
        if (!studentSubjectMap[sid])
          studentSubjectMap[sid] = {
            name: grade.assessment.subject.label,
            total: 0,
            weights: 0,
          };
        studentSubjectMap[sid].total += gradeOn20 * grade.assessment.weight;
        studentSubjectMap[sid].weights += grade.assessment.weight;

        if (gradeOn20 < 5) lowGradesCount++;
      });

      const globalAverage =
        totalWeights > 0 ? totalWeightedGrades / totalWeights : null;
      let riskScore = 0;

      if (globalAverage !== null) {
        if (globalAverage < 10) {
          riskScore += 40;
          flags.push(`Moyenne critique (${globalAverage.toFixed(2)}/20)`);
        } else if (globalAverage < 12) {
          riskScore += 15;
          flags.push(`Moyenne fragile (${globalAverage.toFixed(2)}/20)`);
        }
      }
      Object.values(studentSubjectMap).forEach((data) => {
        const avg = data.total / data.weights;
        if (avg < 10) {
          riskScore += 10;
          flags.push(`En difficulté en ${data.name} (${avg.toFixed(2)}/20)`);
        }
      });
      if (lowGradesCount > 0) riskScore += Math.min(lowGradesCount * 5, 20);

      riskScore = Math.min(Math.max(riskScore, 0), 100);
      const riskLevel =
        riskScore >= 60 ? "CRITIQUE" : riskScore >= 25 ? "MODERE" : "FAIBLE";

      return {
        studentId: student.studentId.toString(),
        firstname: student.firstname,
        surname: student.surname,
        globalAverage:
          globalAverage !== null
            ? parseFloat(globalAverage.toFixed(2))
            : null,
        riskScore,
        riskLevel,
        flags,
      };
    });

    const validAverages = studentProfiles
      .filter((s) => s.globalAverage !== null)
      .map((s) => s.globalAverage as number);
    const globalAverage =
      validAverages.length > 0
        ? parseFloat(
            (
              validAverages.reduce((a, b) => a + b, 0) / validAverages.length
            ).toFixed(2)
          )
        : null;

    const subjectAverages = teacherAssignments
      .map((ta) => {
        let totalWeighted = 0,
          totalWeights = 0;
        let studentCount = 0;
        students.forEach((student) => {
          const subGrades = student.grades.filter(
            (g) => g.assessment.subjectId === ta.subjectId
          );
          if (subGrades.length > 0) studentCount++;
          subGrades.forEach((g) => {
          const gradeOn20 = (Number(g.value) / Number(g.assessment.maxGrade)) * 20;

            totalWeighted += gradeOn20 * g.assessment.weight;
            totalWeights += g.assessment.weight;
          });
        });
        return {
          subjectId: ta.subjectId,
          name: ta.subject.label,
          average:
            totalWeights > 0
              ? parseFloat((totalWeighted / totalWeights).toFixed(2))
              : null,
          studentCount,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true as const,
      data: {
        subjects: teacherAssignments.map((ta) => ({
          subjectId: ta.subjectId,
          name: ta.subject.label,
        })),
        totalStudents: students.length,
        globalAverage,
        atRiskCount: studentProfiles.filter((s) => s.riskLevel !== "FAIBLE")
          .length,
        criticalCount: studentProfiles.filter((s) => s.riskLevel === "CRITIQUE")
          .length,
        subjectAverages,
        atRiskStudents: studentProfiles
          .filter((s) => s.riskLevel !== "FAIBLE")
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 5),
      },
    };
  } catch (error) {
    console.error("Erreur [getTeacherDashboardStats]:", error);
    return {
      success: false as const,
      error: "Erreur lors du calcul des stats.",
    };
  }
}

// ====== RAPPORT DE CLASSE ======
export async function getClassReportData(classId: number) {
  try {
    const classData = await prisma.class.findUnique({
      where: { classId },
      include: {
        students: {
          include: {
            grades: {
              include: { assessment: { include: { subject: true } } },
            },
          },
        },
      },
    });

    if (!classData)
      return { success: false as const, error: "Classe introuvable" };

    const subjectMap: Record<
      number,
      { name: string; totalWeighted: number; totalWeights: number }
    > = {};

    const studentProfiles = classData.students.map((student) => {
      let totalWeightedGrades = 0;
      let totalWeights = 0;
      const studentSubjectMap: Record<
        number,
        { name: string; total: number; weights: number }
      > = {};
      let lowGradesCount = 0;
      const flags: string[] = [];

      student.grades.forEach((grade) => {
        const assessment = grade.assessment;
  const gradeOn20 = (Number(grade.value) / Number(grade.assessment.maxGrade)) * 20;

        totalWeightedGrades += gradeOn20 * assessment.weight;
        totalWeights += assessment.weight;

        const sid = assessment.subject.subjectId;
        if (!studentSubjectMap[sid])
          studentSubjectMap[sid] = {
            name: assessment.subject.label,
            total: 0,
            weights: 0,
          };
        studentSubjectMap[sid].total += gradeOn20 * assessment.weight;
        studentSubjectMap[sid].weights += assessment.weight;

        if (!subjectMap[sid])
          subjectMap[sid] = {
            name: assessment.subject.label,
            totalWeighted: 0,
            totalWeights: 0,
          };
        subjectMap[sid].totalWeighted += gradeOn20 * assessment.weight;
        subjectMap[sid].totalWeights += assessment.weight;

        if (gradeOn20 < 5) lowGradesCount++;
      });

      const globalAverage =
        totalWeights > 0 ? totalWeightedGrades / totalWeights : null;
      let riskScore = 0;

      if (globalAverage !== null) {
        if (globalAverage < 10) {
          riskScore += 40;
          flags.push(
            `Moyenne générale critique (${globalAverage.toFixed(2)}/20)`
          );
        } else if (globalAverage < 12) {
          riskScore += 15;
          flags.push(
            `Moyenne générale fragile (${globalAverage.toFixed(2)}/20)`
          );
        }
      }
      Object.values(studentSubjectMap).forEach((data) => {
        const avg = data.total / data.weights;
        if (avg < 10) {
          riskScore += 10;
          flags.push(`En difficulté en ${data.name} (${avg.toFixed(2)}/20)`);
        }
      });
      if (lowGradesCount > 0) {
        riskScore += Math.min(lowGradesCount * 5, 20);
        flags.push(`${lowGradesCount} note(s) inférieure(s) à 5/20`);
      }

      riskScore = Math.min(Math.max(riskScore, 0), 100);
      const riskLevel =
        riskScore >= 60 ? "CRITIQUE" : riskScore >= 25 ? "MODERE" : "FAIBLE";

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

    studentProfiles.sort((a, b) => b.riskScore - a.riskScore);

    const validAverages = studentProfiles
      .filter((s) => s.globalAverage !== null)
      .map((s) => s.globalAverage as number);
    const classAverage =
      validAverages.length > 0
        ? validAverages.reduce((a, b) => a + b, 0) / validAverages.length
        : null;

    const subjectAverages = Object.entries(subjectMap)
      .map(([id, data]) => ({
        subjectId: parseInt(id),
        name: data.name,
        average:
          data.totalWeights > 0
            ? parseFloat((data.totalWeighted / data.totalWeights).toFixed(2))
            : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true as const,
      data: {
        classId,
        label: classData.label,
        totalStudents: classData.students.length,
        classAverage:
          classAverage !== null ? parseFloat(classAverage.toFixed(2)) : null,
        subjectAverages,
        studentProfiles,
        atRiskCount: studentProfiles.filter((s) => s.riskLevel !== "FAIBLE")
          .length,
        criticalCount: studentProfiles.filter(
          (s) => s.riskLevel === "CRITIQUE"
        ).length,
      },
    };
  } catch (error) {
    console.error("Erreur [getClassReportData]:", error);
    return {
      success: false as const,
      error: "Erreur lors du calcul du rapport.",
    };
  }
}

// ====== SIMULATION DE RATTRAPAGES ======
export async function getRattrapageData(classId: number) {
  try {
    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        grades: {
          include: {
            assessment: { include: { subject: true } },
          },
        },
      },
      orderBy: { surname: 'asc' },
    });

    const assessmentMap = new Map<string, {
      assessmentId: string;
      label: string;
      subjectId: number;
      subjectName: string;
      maxGrade: number;
      weight: number;
    }>();

    students.forEach(student => {
      student.grades.forEach(grade => {
        const id = grade.assessmentId.toString();
        if (!assessmentMap.has(id)) {
          assessmentMap.set(id, {
            assessmentId: id,
            label: grade.assessment.label,
            subjectId: grade.assessment.subjectId,
            subjectName: grade.assessment.subject.label,
            maxGrade: grade.assessment.maxGrade,
            weight: grade.assessment.weight,
          });
        }
      });
    });

    return {
      students: students.map(s => ({
        studentId: s.studentId.toString(),
        firstname: s.firstname,
        surname: s.surname,
        grades: s.grades.map(g => ({
          assessmentId: g.assessmentId.toString(),
          value: Number(g.value),
          maxGrade: g.assessment.maxGrade,
          weight: g.assessment.weight,
          subjectId: g.assessment.subjectId,
          subjectName: g.assessment.subject.label,
          assessmentLabel: g.assessment.label,
        })),
      })),
      assessments: Array.from(assessmentMap.values())
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName) || a.label.localeCompare(b.label)),
    };
  } catch (error) {
    console.error("Erreur [getRattrapageData]:", error);
    return null;
  }
}

// ====== RAPPORT PAR MATIÈRE (ENSEIGNANT) ======

export async function getTeacherSubjects(teacherId: bigint) {
  return await prisma.teacherAssignments.findMany({
    where: { teacherId },
    include: { subject: true },
    orderBy: { subject: { label: "asc" } },
  });
}

export async function getTeacherSubjectReportData(
  teacherId: bigint,
  subjectId: number
) {
  try {
    const assignment = await prisma.teacherAssignments.findFirst({
      where: { teacherId, subjectId },
    });
    if (!assignment)
      return { success: false as const, error: "Accès refusé" };

    const subject = await prisma.subject.findUnique({ where: { subjectId } });

    const subjectAssignments = await prisma.subjectAssignments.findMany({
      where: { subjectId },
      include: {
        student: {
          include: {
            grades: {
              where: { assessment: { subjectId } },
              include: { assessment: true },
            },
          },
        },
      },
    });

    const studentProfiles = subjectAssignments.map((sa) => {
      const student = sa.student;
      let totalWeighted = 0,
        totalWeights = 0,
        lowCount = 0;
      const flags: string[] = [];

      student.grades.forEach((g) => {
        const gradeOn20 =
          (Number(g.value) / Number(g.assessment.maxGrade)) * 20;
        totalWeighted += gradeOn20 * g.assessment.weight;
        totalWeights += g.assessment.weight;
        if (gradeOn20 < 5) lowCount++;
      });

      const average =
        totalWeights > 0 ? totalWeighted / totalWeights : null;
      let riskScore = 0;

      if (average !== null) {
        if (average < 10) {
          riskScore += 40;
          flags.push(`Moyenne critique (${average.toFixed(2)}/20)`);
        } else if (average < 12) {
          riskScore += 15;
          flags.push(`Moyenne fragile (${average.toFixed(2)}/20)`);
        }
      }
      if (lowCount > 0) {
        riskScore += Math.min(lowCount * 5, 20);
        flags.push(`${lowCount} note(s) < 5/20`);
      }

      riskScore = Math.min(Math.max(riskScore, 0), 100);
      const riskLevel =
        riskScore >= 60 ? "CRITIQUE" : riskScore >= 25 ? "MODERE" : "FAIBLE";

      return {
        studentId: student.studentId.toString(),
        firstname: student.firstname,
        surname: student.surname,
        globalAverage:
          average !== null ? parseFloat(average.toFixed(2)) : null,
        riskScore,
        riskLevel,
        flags,
      };
    });

    studentProfiles.sort((a, b) => b.riskScore - a.riskScore);

    const validAverages = studentProfiles
      .filter((s) => s.globalAverage !== null)
      .map((s) => s.globalAverage as number);
    const subjectAverage =
      validAverages.length > 0
        ? parseFloat(
            (
              validAverages.reduce((a, b) => a + b, 0) / validAverages.length
            ).toFixed(2)
          )
        : null;

    return {
      success: true as const,
      data: {
        subjectId,
        label: subject?.label ?? "",
        totalStudents: studentProfiles.length,
        subjectAverage,
        studentProfiles,
        atRiskCount: studentProfiles.filter((s) => s.riskLevel !== "FAIBLE")
          .length,
        criticalCount: studentProfiles.filter(
          (s) => s.riskLevel === "CRITIQUE"
        ).length,
      },
    };
  } catch (error) {
    console.error("Erreur [getTeacherSubjectReportData]:", error);
    return {
      success: false as const,
      error: "Erreur lors du calcul du rapport.",
    };
  }
}