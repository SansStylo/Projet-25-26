import { requireAuth } from "@/app/lib/auth";
import React from "react";

import EnseignantClientLayout from "@/app/components/enseignant/EnseignantLayout";
import ResponsableClientLayout from "@/app/components/responsable/ResponsableLayout"; 
import AdminClientLayout from "@/app/components/admin/AdminLayout";
import ParametresContentWrapper from "@/app/parametres/ParametresContentWrapper";

export const dynamic = 'force-dynamic';

export default async function ParametresPage() {
  const user = await requireAuth();

  // Définition des thèmes dynamiques
  const sessionThemes = {
    0: { // Enseignant
        primaryBtn: "bg-[#0F5E3D] hover:bg-[#0c4e32] text-white", 
        activeTab: "border-[#0F5E3D] text-[#0F5E3D] bg-[#0F5E3D]/10 font-bold shadow-xs",
        accentText: "text-[#0F5E3D]",
        iconColor: "text-[#0F5E3D]"
    },
  }[user.level as 0 ] || {
        primaryBtn: "bg-[#0F5E3D] hover:bg-[#0c4e32] text-white", 
        activeTab: "border-[#0F5E3D] text-[#0F5E3D] bg-[#0F5E3D]/10 font-bold shadow-xs",
        accentText: "text-[#0F5E3D]",
        iconColor: "text-[#0F5E3D]"
  };

  const pageContent = (
    <ParametresContentWrapper 
      key={user.userId.toString()} // Recrée proprement le composant si on change d'utilisateur
      userTheme={user.theme as "light" | "dark"} // Envoie le thème stocké dans ton schéma Prisma
      theme={sessionThemes} 
    />
  );

  // Injection du bon Layout global
  if (user.level === 1) {
    return <ResponsableClientLayout user={user}>{pageContent}</ResponsableClientLayout>;
  }
  
if (user.level === 2) {
  return <AdminClientLayout user={user}>{pageContent}</AdminClientLayout>;
}

  return <EnseignantClientLayout user={user}>{pageContent}</EnseignantClientLayout>;
}