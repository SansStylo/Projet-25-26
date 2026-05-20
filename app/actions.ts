"use server";

import { prisma } from "./lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // 👈 Import pour gérer les cookies
import crypto from "crypto";

export async function loginAction(
  prevState: { error: string | null },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("mot_de_passe") as string;

  let redirectPath: string | null = null;

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user || user.motDePasse !== password) {
      return { error: "Email ou mot de passe incorrect" };
    }

    // 🔑 1. Génération d'un token de session unique
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // Expire dans 24h

    // 📝 2. Enregistrement de la session dans ta table Prisma "Session"
    await prisma.session.create({
      data: {
        token: sessionToken,
        utilisateurId: user.id,
        expiresAt: expiresAt,
      },
    });

    // 🍪 3. Stockage du token dans un Cookie HTTP-Only (sécurisé, invisible en JS côté client)
    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/", // Valable sur tout le site
    });

    // Définition de la redirection selon le rôle
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