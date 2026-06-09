/**
 * app/gestion_compte/layout.tsx
 * 
 * Layout protégé pour la section admin
 * Vérifie que l'utilisateur a le rôle d'administrateur (level 2)
 * Redirige sinon vers son espace approprié
 */

import { requireExactLevel } from "@/app/lib/auth";
import React from "react";
import AdminClientLayout from "@/app/components/admin/AdminLayout";

export default async function AdminLayout({ children,}: { children: React.ReactNode;}) 
{
  // Vérifie que l'utilisateur est admin (level 2)
  // Redirige automatiquement vers /dashboard, /responsable ou / sinon
  const user = await requireExactLevel(2);

  return (
    <AdminClientLayout user={user}>
      {children}
    </AdminClientLayout>
  );
}
