/**
 * app/components/EnseignantRapportsContent.tsx
 * * Composant de rapport pour les enseignants
 * * Rôle:
 * - Affiche les statistiques d'une matière spécifique
 * - Permet d'identifier les étudiants à risque dans cette matière
 * - Fonctionnalités d'export PDF via impression
 */

"use client";

import { useState } from 'react';
import { getTeacherSubjectReportData } from "@/app/actions";

interface SubjectOption {
  subjectId: number;
  label: string;
}

interface EnseignantRapportsContentProps {
  subjects: SubjectOption[];
  teacherId: string;
}

type RiskLevel = "FAIBLE" | "MODERE" | "CRITIQUE";

const RISK_COLORS: Record<RiskLevel, string> = {
  FAIBLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  MODERE: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  CRITIQUE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const RISK_BAR: Record<RiskLevel, string> = {
  FAIBLE: "bg-emerald-400",
  MODERE: "bg-orange-400",
  CRITIQUE: "bg-red-500",
};

export function EnseignantRapportsContent({
  subjects,
  teacherId,
}: EnseignantRapportsContentProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubjectSelect = async (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setReportData(null);
    setIsLoading(true);
    const result = await getTeacherSubjectReportData(BigInt(teacherId), subjectId);
    if (result.success) setReportData(result.data);
    setIsLoading(false);
  };

  const exportPdf = () => {
    if (!reportData) return;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const name = `rapport-${reportData.label}-${ts}`.replace(/\s+/g, "_");
    document.title = name;
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #subject-report-content, #subject-report-content * { visibility: visible !important; }
        #subject-report-content {
          position: absolute !important;
          top: 0 !important; left: 0 !important;
          width: 100% !important;
          overflow: visible !important;
          background: white !important;
          color: black !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.addEventListener(
      "afterprint",
      () => {
        document.head.removeChild(style);
        document.title = "Junia'lytics";
      },
      { once: true }
    );
    window.print();
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#F4F7F5] dark:bg-[#050A08] p-10 transition-colors duration-300">

      {/* Sélecteur de matière */}
      <div className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 p-6 mb-8">
        <h2 className="text-sm font-semibold text-[#718579] dark:text-emerald-200/70 uppercase tracking-wide mb-3">
          Sélectionner une matière
        </h2>
        {subjects.length === 0 ? (
          <p className="text-sm text-[#718579] dark:text-emerald-200/60 italic">
            Aucune matière ne vous est assignée.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {subjects.map((s) => (
              <button
                key={s.subjectId}
                onClick={() => handleSubjectSelect(s.subjectId)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedSubjectId === s.subjectId
                    ? "bg-[#0F5E3D] dark:bg-emerald-700 text-white border-[#0F5E3D] dark:border-emerald-600"
                    : "bg-white dark:bg-[#0E1B16] text-[#1E2E24] dark:text-emerald-50 border-[#E2EAE5] dark:border-emerald-800 hover:border-[#10B981] dark:hover:border-emerald-500 hover:text-[#0F5E3D] dark:hover:text-emerald-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chargement */}
      {isLoading && (
        <div className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 p-12 text-center text-[#718579] dark:text-emerald-200/60">
          Calcul du rapport en cours...
        </div>
      )}

      {/* Rapport */}
      {!isLoading && reportData && (
        <div>
          <div id="subject-report-content" className="space-y-6 bg-[#F4F7F5] dark:bg-[#050A08] p-1 transition-colors">

            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  label: "Étudiants",
                  value: reportData.totalStudents,
                  color: "text-[#1E2E24] dark:text-emerald-50",
                },
                {
                  label: "Moyenne de la matière",
                  value:
                    reportData.subjectAverage !== null
                      ? `${reportData.subjectAverage}/20`
                      : "—",
                  color:
                    reportData.subjectAverage !== null &&
                    reportData.subjectAverage < 10
                      ? "text-red-500 dark:text-red-400"
                      : "text-[#0F5E3D] dark:text-emerald-400",
                },
                {
                  label: "Étudiants à risque",
                  value: reportData.atRiskCount,
                  color:
                    reportData.atRiskCount > 0
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-[#0F5E3D] dark:text-emerald-400",
                },
                {
                  label: "Risque critique",
                  value: reportData.criticalCount,
                  color:
                    reportData.criticalCount > 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-[#0F5E3D] dark:text-emerald-400",
                },
              ].map((kpi, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 p-5"
                >
                  <p className="text-xs text-[#718579] dark:text-emerald-200/60 font-medium mb-1">
                    {kpi.label}
                  </p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Liste des étudiants avec score de risque */}
            <div className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 p-6">
              <h3 className="text-base font-semibold text-[#1E2E24] dark:text-emerald-50 mb-4">
                Étudiants — Score de risque
              </h3>
              {reportData.studentProfiles.length === 0 ? (
                <p className="text-sm text-[#718579] dark:text-emerald-200/60 italic">
                  Aucun étudiant assigné à cette matière.
                </p>
              ) : (
                <div className="space-y-2">
                  {reportData.studentProfiles.map((student: any) => (
                    <div
                      key={student.studentId}
                      className="flex items-center gap-4 p-3 rounded-lg bg-[#F4F7F5] dark:bg-emerald-900/10 border border-[#E2EAE5] dark:border-emerald-900/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1E2E24] dark:text-emerald-50 truncate">
                          {student.surname} {student.firstname}
                        </p>
                        <p className="text-xs text-[#718579] dark:text-emerald-200/60">
                          Moyenne :{" "}
                          {student.globalAverage !== null
                            ? `${student.globalAverage.toFixed(2)}/20`
                            : "—"}
                        </p>
                        {student.flags.length > 0 && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                            {student.flags.join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="w-32 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#E2EAE5] dark:bg-emerald-900/30 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${RISK_BAR[student.riskLevel as RiskLevel]}`}
                              style={{ width: `${student.riskScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#718579] dark:text-emerald-200/60 w-8 text-right shrink-0">
                            {student.riskScore}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${RISK_COLORS[student.riskLevel as RiskLevel]}`}
                      >
                        {student.riskLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bouton export */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={exportPdf}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5E3D] dark:bg-emerald-700 hover:bg-[#10B981] dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {`Exporter le rapport ${reportData.label} en PDF`}
            </button>
          </div>
        </div>
      )}

      {/* État vide */}
      {!isLoading && !reportData && selectedSubjectId === null && (
        <div className="bg-white dark:bg-[#0B1511] rounded-lg shadow-sm border border-[#EAEFEA] dark:border-emerald-900/30 p-12 text-center text-[#718579] dark:text-emerald-200/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A3B8AC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3"
          >
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <p className="font-medium">
            Sélectionnez une matière pour générer le rapport
          </p>
        </div>
      )}
    </main>
  );
}