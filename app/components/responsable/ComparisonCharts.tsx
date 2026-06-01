'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubjectStats {
  subjectId: number;
  subjectName: string;
  average: number;
}

interface ComparisonData {
  subjectName: string;
  [key: string]: string | number | null;
}

interface ComparisonChartsProps {
  subjects: SubjectStats[];
  comparison: ComparisonData[];
}

export default function ComparisonCharts({ subjects, comparison }: ComparisonChartsProps) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

  if (subjects.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">Aucune donnée disponible pour la comparaison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Moyennes par matière - Vue globale */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Moyennes par matière</h3>
          <p className="text-sm text-gray-600 mt-1">Vue globale</p>
        </div>
        <div className="h-80 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="subjectName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any) => [value?.toFixed(2) || '—', 'Moyenne']}
              />
              <Bar dataKey="average" name="Moyenne" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparaison des groupes par matière */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-violet-50 to-violet-100 px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Comparaison par promotion</h3>
          <p className="text-sm text-gray-600 mt-1">Performance de chaque groupe</p>
        </div>
        <div className="h-80 p-6 overflow-x-auto">
          <ResponsiveContainer width={Math.max(400, comparison.length * 100)} height="100%">
            <BarChart data={comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="subjectName" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any) => value?.toFixed?.(2)?.toString() || '—'}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {Object.keys(comparison[0] || {})
                .filter(key => key !== 'subjectName')
                .map((classLabel, idx) => (
                  <Bar 
                    key={classLabel} 
                    dataKey={classLabel} 
                    fill={colors[idx % colors.length]} 
                    radius={[2, 2, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
