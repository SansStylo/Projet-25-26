/**
 * app/dashboard/layout.tsx
 * 
 * Layout protégé pour la section enseignant
 * Vérifie que l'utilisateur a le rôle d'enseignant (level 0)
 * Redirige sinon vers son espace approprié
 */

import { requireExactLevel } from "@/app/lib/auth";
import React from "react";
import EnseignantClientLayout from "@/app/components/enseignant/EnseignantLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifie que l'utilisateur est enseignant (level 0)
  // Redirige automatiquement vers /responsable, /admin ou / sinon
  await requireExactLevel(0);

 return (
    <EnseignantClientLayout>
      {children}
    </EnseignantClientLayout>
  );
}
