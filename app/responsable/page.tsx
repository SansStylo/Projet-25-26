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

  if (allClasses.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
          <p className="text-gray-600 font-medium">Aucune classe n'a été détectée dans la base de données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      
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

    </div>
  );
}