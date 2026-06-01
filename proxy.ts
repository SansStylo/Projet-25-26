/**
 * proxy.ts
 * 
 * Proxy de sécurité et d'authentification pour Next.js
 * 
 * Rôle:
 * - Protège les zones privées (dashboard, admin, responsable) en vérifiant la présence d'un token de session
 * - Redirige les utilisateurs non authentifiés vers la page de connexion
 * - Redirige les utilisateurs authentifiés qui essayent d'accéder au login
 * - Laisse passer les utilisateurs authentifiés vers leurs zones réservées
 * 
 * Fonctionnement:
 * - Intercepte les requêtes vers /dashboard, /admin, /responsable
 * - Vérifie le cookie 'session_token'
 * - Redirige vers '/' si pas de token (non authentifié)
 * - Permet l'accès si le token existe
 * 
 * Note: La vérification du rôle spécifique est effectuée côté serveur dans les pages
 * car le proxy n'a pas accès à la base de données.
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
    // Laisse passer - l'utilisateur peut se déconnecter s'il veut
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configuration des routes cibles pour le proxy
export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/responsable/:path*"],
};