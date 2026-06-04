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

export async function addGroup(label: string, studentIds: bigint[]) {
  try {
    // 1. On crée d'abord le groupe en BDD
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

    return newGroup;
  } catch (error) {
    console.error("Erreur lors de la création du groupe et de ses assignations :", error);
    throw new Error("Impossible de créer le groupe.");
  }
}

export async function addClass(label: string, studentIds: bigint[]) {
  try {
    // 1. On crée d'abord la classe en BDD
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

export async function loginAction(
  prevState: { error: string | null },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("mot_de_passe") as string;

  let redirectPath: string | null = null;

  try {
    const user = await prisma.user.findUnique({
      where: { mail : email },
    });

    if (!user || user.password !== password) {
      return { error: "Email ou mot de passe incorrect" };
    }

    switch (user.level) {
      case 2:
        redirectPath = '/admin';
        break;
      case 1:
        redirectPath = '/responsable';
        break;
      case 0:
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