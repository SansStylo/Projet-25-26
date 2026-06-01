'use client';

interface ClassData {
  classId: number;
  className: string;
  totalStudents: number;
  globalAverage: number | null;
}

interface ClassStatsCardProps {
  class: ClassData;
}

export default function ClassStatsCard({ class: classData }: ClassStatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{classData.className}</h3>
        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {classData.totalStudents} étudiants
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-blue-600">
          {classData.globalAverage?.toFixed(2) || '—'}
        </div>
        <span className="text-sm text-gray-500">/ 20</span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">Moyenne générale</p>
      </div>
    </div>
  );
}
