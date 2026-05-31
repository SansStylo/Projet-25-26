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
    // 💡 HACK : On renvoie l'erreur brute de Prisma à l'écran !
    throw new Error(`Erreur Prisma brute : ${error.message || error}`);
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
    //Attention : 'utilisateur' n'existe plus dans ton nouveau schéma, à modifier en 'user' au prochain tour
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user || user.motDePasse !== password) {
      return { error: "Email ou mot de passe incorrect" };
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    //Attention : 'session' n'existe plus dans ton nouveau schéma
    await prisma.session.create({
      data: {
        token: sessionToken,
        utilisateurId: user.id,
        expiresAt: expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    switch (user.role) {
      case 'administrateur':
        redirectPath = '/admin';
        break;
      case 'responsable_pedagogique':
        redirectPath = '/responsable';
        break;
      case 'enseignant':
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