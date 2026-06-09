import { prisma } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth"; // Ta fonction pour récupérer la session
import { ROLE_LABELS } from "@/app/lib/auth-constants";
import React from "react";

import EnseignantClientLayout from "@/app/components/enseignant/EnseignantLayout";
import ResponsableClientLayout from "@/app/components/responsable/ResponsableLayout"; 
// import AdminClientLayout from "@/app/components/admin/AdminLayout";

async function getProfileData(userId: bigint, isAdmin: boolean) {
  // Récupération des matières
  let modules: string[] = [];
  if (!isAdmin) {
    const assignments = await prisma.teacherAssignments.findMany({
      where: { teacherId: userId },
      include: { subject: true },
    });
    modules = assignments.map((a) => a.subject.label);
  }

  // Nombre d'évaluations créées par cet utilisateur
  const assessmentCount = await prisma.assessment.count({
    where: { userId: userId }
  });

  return { modules, assessmentCount };
}

export default async function ProfilPage() {
  // Récupération de l'utilisateur connecté
  const user = await requireAuth();

  // Récupération des modules (sauf l'admin)
  const isAdmin = user.level === 2;
  const { modules, assessmentCount } = await getProfileData(user.userId, isAdmin);

  // Thèmes dynamiques par session
  const sessionThemes = {
    0: { // Enseignant : Vert
      titleText: "text-[#0F5E3D]",
      iconColor: "text-[#128455]",
      badge: "bg-[#F4F7F5] text-[#0F5E3D] border-[#E2EAE5]",
      gradient: "from-[#0F5E3D] to-emerald-500", 
      cardGradient: "from-slate-50 to-[#F4F7F5]/30",
      moduleBadge: "bg-gradient-to-r from-[#F4F7F5] to-slate-50 text-[#128455] border-[#E2EAE5]"
    }
    // 1: { // Responsable : Ambre
    //   titleText: "text-amber-700",
    //   iconColor: "text-amber-600",
    //   badge: "bg-amber-50 text-amber-800 border-amber-200",
    //   gradient: "from-orange-600 to-amber-500",
    //   cardGradient: "from-slate-50 to-orange-50/10",
    //   moduleBadge: "bg-gradient-to-r from-orange-50 to-slate-50 text-orange-800 border-orange-200"
    // },
    // 2: { // Admin : Violet
    //   titleText: "text-purple-700",
    //   iconColor: "text-purple-600",
    //   badge: "bg-purple-50 text-purple-700 border-purple-200",
    //   gradient: "from-purple-600 to-indigo-500",
    //   cardGradient: "from-slate-50 to-purple-50/10",
    //   moduleBadge: "bg-gradient-to-r from-purple-50 to-slate-50 text-purple-800 border-purple-200"
    // }
  }[user.level as 0 ] || {
    titleText: "text-[#0F5E3D]",
    iconColor: "text-[#128455]", 
    badge: "bg-[#F4F7F5] text-[#0F5E3D] border-[#E2EAE5]", 
    gradient: "from-[#0F5E3D] to-emerald-500",
    cardGradient: "from-slate-50 to-[#F4F7F5]/30",
    moduleBadge: "bg-gradient-to-r from-[#F4F7F5] to-slate-50 text-[#128455] border-[#E2EAE5]"
  };

  const profileContent = (
    <div className="p-6 md:p-10 flex-1 overflow-y-auto bg-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl bg-white rounded-3xl p-6 md:p-10 border border-[#E2EAE5] shadow-[0_8px_30px_rgba(18,38,30,0.015)] mx-auto transition-all">
        
        {/* En-tête (Header) de la carte */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-8 border-b border-[#E2EAE5]">
          <div className={`w-20 h-20 bg-linear-to-tr ${sessionThemes.gradient} rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/5 tracking-wider select-none`}>
            {user.firstname[0]}{user.surname[0]}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-[#1E2E24] tracking-tight mb-2">
              {user.firstname} {user.surname}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${sessionThemes.badge}`}>
                {ROLE_LABELS[user.level as 0 | 1 | 2]}
              </span>
            </div>
          </div>
        </div>

        {/* Structure en 2 Colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne de gauche */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Email */}
            <div className={`bg-linear-to-r ${sessionThemes.cardGradient} p-6 rounded-2xl border border-[#E2EAE5]`}>
            <span className={`text-sm font-bold ${sessionThemes.titleText} uppercase tracking-widest flex items-center gap-2 mb-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={sessionThemes.iconColor}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Adresse email académique
            </span>
            <span className="text-base font-semibold text-[#1E2E24] break-all bg-white/60 px-4 py-2.5 rounded-xl border border-white/80 inline-block shadow-xs">
                {user.mail}
            </span>
            </div>

            {/* Modules */}
            {!isAdmin && (
            <div className={`bg-linear-to-r ${sessionThemes.cardGradient} p-6 rounded-2xl border border-[#E2EAE5]`}>
                <h3 className={`text-sm font-bold ${sessionThemes.titleText} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={sessionThemes.iconColor}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Modules assignés
                </h3>
                {modules.length === 0 ? (
                <div className="p-4 bg-white/60 border border-[#E2EAE5] rounded-xl text-[#718579] text-sm italic">
                    Aucun module assigné pour le moment.
                </div>
                ) : (
                <div className="flex flex-wrap gap-2.5">
                    {modules.map((moduleLabel, idx) => (
                    <span 
                        key={idx} 
                        className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-[#1E2E24] bg-white/60 border border-white/80 rounded-xl shadow-xs transition-transform hover:scale-[1.01]"
                    >
                        {moduleLabel}
                    </span>
                    ))}
                </div>
                )}
            </div>
            )}
          </div>

          {/* Colonne de droite */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2EAE5] p-6 flex flex-col justify-between h-full min-h-45">
              <div>
                <span className="text-xs font-bold text-[#718579] uppercase tracking-widest block mb-1">
                  Activité globale
                </span>
                <h4 className="text-sm font-bold text-[#1E2E24] mb-4">
                  Évaluations créées
                </h4>
                <div className="text-5xl font-black text-[#1E2E24] tracking-tight">
                  {assessmentCount}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  // Choix dynamique du layout selon la session
  if (user.level === 1) {
    return <ResponsableClientLayout user={user}>{profileContent}</ResponsableClientLayout>;
  }
  
  if (user.level === 2) {
    // return <AdminLayout user={user}>{profileContent}</AdminLayout>;
  }

  // Par défaut (Enseignant)
  return <EnseignantClientLayout user={user}>{profileContent}</EnseignantClientLayout>;
}
