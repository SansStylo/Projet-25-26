'use client';

interface KeyMetricsProps {
  totalClasses: number;
  totalStudents: number;
  globalAverage: number | null;
  hasFilter: boolean;
}

export default function KeyMetrics({ 
  totalClasses, 
  totalStudents, 
  globalAverage,
  hasFilter 
}: KeyMetricsProps) {
  return (
    <div className={`transition-all ${hasFilter ? 'ring-2 ring-blue-400' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Nombre de groupes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Groupes</h3>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-4xl font-bold text-blue-900">{totalClasses}</p>
          <p className="text-xs text-blue-700 mt-2">promotions/groupes</p>
        </div>

        {/* Effectif total */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">Effectif</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-4xl font-bold text-green-900">{totalStudents}</p>
          <p className="text-xs text-green-700 mt-2">étudiants</p>
        </div>

        {/* Moyenne générale */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wide">Moyenne</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-purple-900">
            {globalAverage?.toFixed(2) || '—'}
          </p>
          <p className="text-xs text-purple-700 mt-2">/ 20</p>
        </div>

        {/* Moyenne par étudiant */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide">Par étudiant</h3>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-4xl font-bold text-amber-900">
            {totalStudents > 0 ? (globalAverage?.toFixed(2) || '—') : '—'}
          </p>
          <p className="text-xs text-amber-700 mt-2">moyenne</p>
        </div>

      </div>
      
      {hasFilter && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          ✓ Vous consultez les données filtrées. Cliquez sur « Réinitialiser » pour voir toutes les données.
        </div>
      )}
    </div>
  );
}
