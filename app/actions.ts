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
  });
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

export async function searchStudents(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    
    return await prisma.student.findMany({
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
  } catch (error) {
    console.error("Erreur lors de la recherche d'étudiants :", error);
    return [];
  }
}

export async function getStudentDetail(studentId: bigint) {
  try {
    return await prisma.student.findUnique({
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
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'étudiant :", error);
    return null;
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

export async function sendResetCodeEmail(targetEmail: string, code: string) {
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

  try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email envoyé avec succès : ", info.messageId);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email : ", error);
      return { success: false, error: "Impossible d'envoyer le mail." };
    }
}