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

export async function addDebugStudent(classId : number, firstname : string, surname : string) {
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
    await prisma.assessment.delete({
      where: { assessmentId: BigInt(assessmentIdStr) }
    });
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
    await prisma.grade.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId: BigInt(assessmentIdStr),
          studentId: BigInt(studentIdStr)
        }
      },
      update: {
        value: value,
        feedback: feedback
      },
      create: {
        assessmentId: BigInt(assessmentIdStr),
        studentId: BigInt(studentIdStr),
        value: value,
        feedback: feedback
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Erreur :", error);
    return { success: false, error: `Erreur : ${error.message}` };
  }
}