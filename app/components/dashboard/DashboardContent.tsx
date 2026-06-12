"use client";

import Link from 'next/link';

type RiskLevel = 'FAIBLE' | 'MODERE' | 'CRITIQUE';

const RISK_COLORS: Record<RiskLevel, string> = {
  FAIBLE: 'bg-emerald-100 text-emerald-700',
  MODERE: 'bg-orange-100 text-orange-700',
  CRITIQUE: 'bg-red-100 text-red-700',
};

interface DashboardStats {
  subjects: { subjectId: number; name: string }[];
  totalStudents: number;
  globalAverage: number | null;
  atRiskCount: number;
  criticalCount: number;
  subjectAverages: { subjectId: number; name: string; average: number | null; studentCount: number }[];
  atRiskStudents: { studentId: string; firstname: string; surname: string; globalAverage: number | null; riskScore: number; riskLevel: string; flags: string[] }[];
}

interface DashboardContentProps {
  teacherName: string;
  stats: DashboardStats | null;
}

export function DashboardContent({ teacherName, stats }: DashboardContentProps) {
  return (
    <main className="flex-1 overflow-y-auto p-10 space-y-8">

      {/* Bandeau de bienvenue */}
      <div className="bg-gradient-to-r from-[#0F5E3D] to-[#10B981] rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Bonjour {teacherName}</h2>
        <p className="text-white/80 text-sm">
          {stats && stats.subjects.length > 0
            ? `Vous enseignez ${stats.subjects.length} matière${stats.subjects.length > 1 ? 's' : ''} pour ${stats.totalStudents} étudiant${stats.totalStudents > 1 ? 's' : ''}.`
            : "Aucune matière assignée pour l'instant."}
        </p>
      </div>

      {stats && stats.subjects.length > 0 ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Matières enseignées', value: stats.subjects.length, color: 'text-[#1E2E24]', icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></> },
              { label: 'Étudiants suivis', value: stats.totalStudents, color: 'text-[#1E2E24]', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></> },
              { label: 'Moyenne générale', value: stats.globalAverage !== null ? `${stats.globalAverage}/20` : '—', color: stats.globalAverage !== null && stats.globalAverage < 10 ? 'text-red-500' : 'text-[#0F5E3D]', icon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></> },
              { label: 'Étudiants à risque', value: stats.atRiskCount, color: stats.atRiskCount > 0 ? 'text-orange-500' : 'text-[#0F5E3D]', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></> },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#EAEFEA] shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[#F4F7F5] rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F5E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{kpi.icon}</svg>
                  </div>
                  <p className="text-xs text-[#718579] font-medium">{kpi.label}</p>
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Grille détaillée */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Moyennes par matière */}
            <div className="bg-white rounded-xl border border-[#EAEFEA] shadow-sm p-6">
              <h3 className="text-base font-semibold text-[#1E2E24] mb-4">Moyennes par matière</h3>
              <div className="space-y-4">
                {stats.subjectAverages.map(s => (
                  <div key={s.subjectId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-[#1E2E24] truncate pr-2">{s.name}</span>
                      <span className="text-sm font-bold text-[#1E2E24] shrink-0">
                        {s.average !== null ? `${s.average}/20` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#E2EAE5] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${s.average === null ? '' : s.average < 10 ? 'bg-red-400' : s.average < 12 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                          style={{ width: s.average !== null ? `${(s.average / 20) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-[#718579] shrink-0">{s.studentCount} étud.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Étudiants à risque */}
            <div className="bg-white rounded-xl border border-[#EAEFEA] shadow-sm p-6">
              <h3 className="text-base font-semibold text-[#1E2E24] mb-4">
                Étudiants à surveiller
                {stats.criticalCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                    {stats.criticalCount} critique{stats.criticalCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              {stats.atRiskStudents.length > 0 ? (
                <div className="space-y-3">
                  {stats.atRiskStudents.map(student => (
                    <div key={student.studentId} className="flex items-center gap-3 p-3 rounded-lg bg-[#F4F7F5] border border-[#E2EAE5]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1E2E24] truncate">{student.surname} {student.firstname}</p>
                        <p className="text-xs text-[#718579]">Moy. {student.globalAverage !== null ? `${student.globalAverage}/20` : '—'} · Score {student.riskScore}/100</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${RISK_COLORS[student.riskLevel as RiskLevel]}`}>
                        {student.riskLevel}
                      </span>
                    </div>
                  ))}
                  {stats.atRiskCount > 5 && (
                    <p className="text-xs text-[#718579] text-center pt-1">
                      +{stats.atRiskCount - 5} autre{stats.atRiskCount - 5 > 1 ? 's' : ''} —{' '}
                      <Link href="/dashboard/etudiants" className="text-[#0F5E3D] hover:underline">voir tous les étudiants</Link>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="mb-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <p className="text-sm text-[#718579] font-medium">Aucun étudiant à risque détecté</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-[#EAEFEA] shadow-sm p-12 text-center text-[#718579]">
          <p className="font-medium">Aucune matière ne vous est encore assignée.</p>
          <p className="text-sm mt-1">Contactez l'administrateur pour obtenir vos affectations.</p>
        </div>
      )}
    </main>
  );
}
