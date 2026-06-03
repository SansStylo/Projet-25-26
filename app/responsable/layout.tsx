/**
 * app/responsable/layout.tsx
 * 
 * Layout protégé pour la section coordinateur/responsable
 * Vérifie que l'utilisateur a le rôle de responsable (level 1)
 * Redirige sinon vers son espace approprié
 */

import { requireExactLevel } from "@/app/lib/auth";
import React from "react";

export default async function ResponsableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifie que l'utilisateur est responsable (level 1)
  // Redirige automatiquement vers /dashboard, /admin ou / sinon
  await requireExactLevel(1);

  return <>{children}</>;
}
