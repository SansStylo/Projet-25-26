<<<<<<< HEAD
import { getAllClassesOverview, getAllSubjectsPerformance, getClassesComparisonBySubject } from '@/app/responsable/responsable-actions';
import ResponsableDashboardClient from './components/ResponsableDashboardClient';

export default async function ResponsableDashboard() {
  const [allClassesRes, allSubjectsRes, comparisonRes] = await Promise.all([
    getAllClassesOverview(),
    getAllSubjectsPerformance(),
    getClassesComparisonBySubject(),
  ]);

  const allClasses = (allClassesRes.data || []).map(c => ({
    classId: c.classId,
    className: c.className,
    totalStudents: c.totalStudents,
    globalAverage: c.globalAverage
  }));
  const allSubjects = allSubjectsRes.data || [];
  const comparison = comparisonRes.data || [];
=======
import { prisma } from "@/app/lib/db";
import {
  getClassOverview,
  getSubjectsPerformance,
  getClassEvolution,
} from "@/app/responsable/responsable-actions";
import { getStudentsAtRisk } from "@/app/responsable/analytics";
import ClassSelector from "../components/responsable/ClassSelector";
import DashboardCharts from "../components/responsable/DashboardCharts";
import KpiCards from "../components/responsable/KpiCards";
import { LogoutButton } from "@/app/components/LogoutButton";

interface PageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function ResponsableDashboard({
  searchParams,
}: PageProps) {
  // 🔄 Adapté au nouveau schéma : "label" et "classId" en minuscules
  const allClasses = await prisma.class.findMany({
    orderBy: { label: "asc" },
    select: { classId: true, label: true },
  });

  const resolvedParams = await searchParams;

  // 🔄 Adapté au nouveau schéma : allClasses[0]?.classId
  const currentClassId = resolvedParams.classId
    ? parseInt(resolvedParams.classId, 10)
    : allClasses[0]?.classId || 1;

  const [overviewRes, riskRes, performanceRes, evolutionRes] =
    await Promise.all([
      getClassOverview(currentClassId),
      getStudentsAtRisk(currentClassId),
      getSubjectsPerformance(currentClassId),
      getClassEvolution(currentClassId),
    ]);

  const overview = overviewRes.data;
  const studentsRisk = riskRes.data || [];
  const subjects = performanceRes.data || [];
  const evolution = evolutionRes.data || [];

  const alertStudents = studentsRisk.filter(
    (s) => s.riskLevel === "MODERE" || s.riskLevel === "CRITIQUE",
  );
>>>>>>> main

  if (allClasses.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
          <p className="text-gray-600 font-medium">
            Aucune classe n'a été détectée dans la base de données.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      
<<<<<<< HEAD
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Responsable Pédagogique
        </h1>
        <p className="text-gray-500 mt-2">Vue globale multi-groupes / multi-matières</p>
      </header>

      <ResponsableDashboardClient 
        initialClasses={allClasses}
        initialSubjects={allSubjects}
        initialComparison={comparison}
      />

=======
      {/* En-tête avec titre à gauche, Sélecteur + Déconnexion à droite */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Tableau de bord Pédagogique
          </h1>
          <p className="text-gray-500 mt-1">
            Analyse macroscopique et aide à la décision
          </p>
        </div>
        
        <div className="flex items-center gap-4 self-start md:self-auto">
          <ClassSelector classes={allClasses} />
          
       
          <ul className="list-none p-0 m-0">
            <LogoutButton />
          </ul>
        </div>
      </header>

      {!overviewRes.success ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm font-medium">
            Impossible de charger les données pour cette classe. Assurez-vous
            qu'elle contient des étudiants inscrits et des notes.
          </p>
        </div>
      ) : (
        <>
          <KpiCards
            studentsRisk={studentsRisk}
            className={overview?.className || ""}
            globalAverage={overview?.globalAverage ?? null}
          />

          <div className="w-full">
            <DashboardCharts 
              subjects={subjects} 
              evolution={evolution
                .filter(item => item.moyenne !== null)
                .map(item => ({
                  ...item,
                  moyenne: item.moyenne as number 
                }))
              } 
            />
          </div>

          <section className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>⚠️</span> Alertes de décrochage en temps réel
              </h2>
            </div>
            <div className="p-6">
              {alertStudents.length === 0 ? (
                <p className="text-green-600 font-semibold text-center py-4">
                  Aucun signalement de décrochage détecté.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {alertStudents.map((student) => (
                    <div
                      key={student.studentId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border rounded-xl border-gray-100 bg-white"
                    >
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {student.firstname} {student.surname}
                        </h4>
                        <p className="text-sm font-medium text-gray-500">
                          Moyenne : {student.globalAverage?.toFixed(2)} / 20
                        </p>
                        <ul className="list-disc pl-5 text-sm text-red-500 mt-2">
                          {student.flags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          student.riskLevel === "CRITIQUE"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        Risque {student.riskLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                📊 Synthèse statistique par matière
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase">
                      Matière
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase">
                      Moyenne
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase">
                      Min
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase">
                      Max
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map((subject) => (
                    <tr key={subject.subjectId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {subject.subjectName}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-green-600">
                        {subject.average.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {subject.minGrade.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {subject.maxGrade.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
>>>>>>> main
    </div>
  );
}