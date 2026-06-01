'use client';

import ClassStatsCard from './ClassStatsCard';

interface ClassData {
  classId: number;
  className: string;
  totalStudents: number;
  globalAverage: number | null;
}

interface ClassesOverviewProps {
  classes: ClassData[];
}

export default function ClassesOverview({ classes }: ClassesOverviewProps) {
  // Trier les classes par moyenne descendante
  const sortedClasses = [...classes].sort(
    (a, b) => (b.globalAverage || 0) - (a.globalAverage || 0)
  );

  // Identifier la meilleure et pire classe
  const bestClass = sortedClasses[0];
  const worstClass = sortedClasses[sortedClasses.length - 1];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Aperçu des groupes</h2>
        <p className="text-sm text-gray-600 mt-1">Classement par performance moyenne</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedClasses.map((classItem) => (
            <div key={classItem.classId} className="relative">
              {classItem.classId === bestClass?.classId && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  🏆 Meilleur
                </div>
              )}
              {classItem.classId === worstClass?.classId && sortedClasses.length > 1 && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ⚠ À suivre
                </div>
              )}
              <ClassStatsCard class={classItem} />
            </div>
          ))}
        </div>

        {classes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {parseFloat(
                  (classes.reduce((sum, c) => sum + (c.globalAverage || 0), 0) / classes.length).toFixed(2)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Moyenne tous groupes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.max(...classes.map(c => c.globalAverage || 0)).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Meilleure moyenne</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Math.min(...classes.map(c => c.globalAverage || 0)).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Plus faible moyenne</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
