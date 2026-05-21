/**
 * 
 * FICHIER FAIT MAIS NON IMPLEMENTER
 * middleware.ts
 * 
 * Middleware de sécurité et d'authentification pour Next.js
 * 
 * Rôle:
 * - Protège les zones privées (dashboard, admin, responsable) en vérifiant la présence d'un token de session
 * - Redirige les utilisateurs non authentifiés vers la page de connexion
 * - Laisse passer les utilisateurs authentifiés vers leurs zones réservées
 * 
 * Fonctionnement:
 * - Intercepte les requêtes vers /dashboard, /admin et /responsable
 * - Vérifie le cookie 'session_token'
 * - Redirige vers '/' si pas de token (non authentifié)
 * - Permet l'accès si le token existe
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // 1. On récupère le token de session
  const token = request.cookies.get("session_token")?.value;
  
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 2. Si l'utilisateur essaie d'accéder à une zone privée sans être connecté
  const isPrivateArea = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/responsable");

  if (isPrivateArea && !token) {
    url.pathname = "/"; // Redirection vers le formulaire de login
    return NextResponse.redirect(url);
  }

  // 3. Si l'utilisateur est déjà connecté et essaie d'aller sur le login (/)
  if (pathname === "/" && token) {
    // Par sécurité, on le laisse passer, mais l'idéal est de le rediriger 
    // vers son espace dédié, ce que nous allons blinder directement dans les pages.
  }

  return NextResponse.next();
}

// Configuration des routes cibles pour le middleware
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/responsable/:path*"],
};