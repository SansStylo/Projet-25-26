/**
 * app/lib/auth.ts
 * 
 * Utilitaires d'authentification et d'autorisation
 * 
 * Fournit des fonctions pour:
 * - Récupérer l'utilisateur connecté à partir du token de session
 * - Vérifier le niveau d'accès (rôle) de l'utilisateur
 * - Protéger les pages selon le niveau requis
 * 
 * Niveaux d'accès (level):
 * - 0 = Enseignant (accès à /dashboard)
 * - 1 = Responsable pédagogique (accès à /responsable)
 * - 2 = Administrateur (accès à /admin)
 */

"use server";

import { prisma } from "./db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserLevel } from "./auth-constants";

/**
 * Récupère l'utilisateur connecté à partir du token de session
 * 
 * @returns L'objet utilisateur avec tous ses détails ou null si pas de session valide
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Cherche la session dans la base de données
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    // Vérifie que la session existe et n'a pas expiré
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur connecté:", error);
    return null;
  }
}

/**
 * Vérifie que l'utilisateur a le niveau requis
 * Redirige vers la page de connexion si pas d'utilisateur
 * Redirige vers une page d'erreur si niveau insuffisant
 * 
 * @param requiredLevel Le niveau minimum requis (0, 1 ou 2)
 * @returns L'objet utilisateur s'il a le niveau requis
 * @throws Redirige vers / ou une page d'erreur sinon
 */
export async function requireLevel(requiredLevel: UserLevel) {
  const user = await getCurrentUser();

  if (!user) {
    // Pas d'utilisateur connecté, redirection vers login
    redirect("/");
  }

  if (user.level < requiredLevel) {
    // Utilisateur avec niveau insuffisant
    // On le redirige vers son espace approprié selon son niveau
    switch (user.level) {
      case 2:
        redirect("/admin");
      case 1:
        redirect("/responsable");
      case 0:
      default:
        redirect("/dashboard");
    }
  }

  return user;
}

/**
 * Vérifie que l'utilisateur a exactement le niveau requis
 * 
 * @param requiredLevel Le niveau exact requis (0, 1 ou 2)
 * @returns L'objet utilisateur s'il a le bon niveau
 * @throws Redirige vers / ou vers son espace sinon
 */
export async function requireExactLevel(requiredLevel: UserLevel) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.level !== requiredLevel) {
    // Redirige vers son espace approprié
    switch (user.level) {
      case 2:
        redirect("/admin");
      case 1:
        redirect("/responsable");
      case 0:
      default:
        redirect("/dashboard");
    }
  }

  return user;
}

/**
 * Vérifie que l'utilisateur est connecté
 * 
 * @returns L'objet utilisateur s'il est connecté
 * @throws Redirige vers / sinon
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return user;
}

/**
 * Déconnecte l'utilisateur
 * Supprime la session de la base de données et le cookie
 */
export async function logout() {
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
