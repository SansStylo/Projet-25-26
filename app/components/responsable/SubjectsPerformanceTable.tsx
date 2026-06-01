'use client';

interface SubjectStats {
  subjectId: number;
  subjectName: string;
  average: number;
}

interface SubjectsPerformanceTableProps {
  subjects: SubjectStats[];
}

export default function SubjectsPerformanceTable({ subjects }: SubjectsPerformanceTableProps) {
  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Trier par moyenne descendante
  const sorted = [...subjects].sort((a, b) => b.average - a.average);
  const avgOfAvgs = sorted.reduce((sum, s) => sum + s.average, 0) / sorted.length;

  const getColor = (value: number) => {
    if (value >= 16) return 'bg-green-50 text-green-900 border-green-200';
    if (value >= 13) return 'bg-blue-50 text-blue-900 border-blue-200';
    if (value >= 10) return 'bg-amber-50 text-amber-900 border-amber-200';
    return 'bg-red-50 text-red-900 border-red-200';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Performances par matière</h2>
        <p className="text-sm text-gray-600 mt-1">Moyennes générales de toutes les promotions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Rang</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Matière</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">Moyenne</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">Écart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sorted.map((subject, index) => {
              const ecart = (subject.average - avgOfAvgs).toFixed(2);
              const isAboveAvg = subject.average >= avgOfAvgs;

              return (
                <tr key={subject.subjectId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg">{getRankIcon(index)}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{subject.subjectName}</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold border ${getColor(subject.average)}`}>
                      {subject.average.toFixed(2)}
                      <span className="text-xs font-normal opacity-75">/ 20</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-semibold ${isAboveAvg ? 'text-green-600' : 'text-red-600'}`}>
                      {isAboveAvg ? '+' : ''}{ecart}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-gray-900">Moyenne générale</td>
              <td className="px-6 py-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  {avgOfAvgs.toFixed(2)}
                  <span className="text-xs font-normal opacity-75">/ 20</span>
                </div>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
