/**
 * app/admin/layout.tsx
 * 
 * Layout protégé pour la section admin
 * Vérifie que l'utilisateur a le rôle d'administrateur (level 2)
 * Redirige sinon vers son espace approprié
 */

import { requireExactLevel } from "@/app/lib/auth";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifie que l'utilisateur est admin (level 2)
  // Redirige automatiquement vers /dashboard, /responsable ou / sinon
  await requireExactLevel(2);

  return <>{children}</>;
}
