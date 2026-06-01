'use client';

import { useState } from 'react';

interface ClassData {
  classId: number;
  className: string;
  totalStudents: number;
  globalAverage: number | null;
}

interface GlobalKpiCardsProps {
  totalClasses: number;
  totalStudents: number;
  globalAverage: number | null;
  classes: ClassData[];
  onFilterChange: (classIds: number[]) => Promise<void>;
  hasFilter: boolean;
  onReset: () => void;
}

export default function GlobalKpiCards({ 
  totalClasses, 
  totalStudents, 
  globalAverage,
  classes,
  onFilterChange,
  hasFilter,
  onReset
}: GlobalKpiCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>(classes.map(c => c.classId));
  const [loading, setLoading] = useState(false);

  const handleSelectClass = (classId: number) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleApplyFilter = async () => {
    if (selectedClassIds.length === 0) return;
    
    setLoading(true);
    try {
      await onFilterChange(selectedClassIds);
      setModalOpen(false);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetLocal = () => {
    setSelectedClassIds(classes.map(c => c.classId));
    onReset();
  };

  const handleSelectAll = () => {
    setSelectedClassIds(classes.map(c => c.classId));
  };

  const handleDeselectAll = () => {
    setSelectedClassIds([]);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sélection des groupes</h2>
              <p className="text-sm text-gray-600 mt-1">Filtrez les données par groupes/promotions</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
            >
              ⚙️ Personnaliser
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {classes.map(cls => (
              <span 
                key={cls.classId} 
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedClassIds.includes(cls.classId)
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 opacity-50'
                }`}
              >
                {cls.className}
                <span className="text-xs opacity-75">({cls.totalStudents})</span>
              </span>
            ))}
          </div>
          {hasFilter && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Filtre actif:</strong> {selectedClassIds.length} groupe(s) sélectionné(s)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de sélection */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-6 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Sélectionner les groupes</h2>
              <p className="text-sm text-gray-600 mt-1">Choisissez les groupes à afficher</p>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleSelectAll}
                  className="flex-1 px-3 py-2 text-sm font-semibold text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  ✓ Tous
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="flex-1 px-3 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ✗ Aucun
                </button>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                {classes.map(classItem => (
                  <label key={classItem.classId} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(classItem.classId)}
                      onChange={() => handleSelectClass(classItem.classId)}
                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{classItem.className}</p>
                      <p className="text-sm text-gray-500">{classItem.totalStudents} étudiants • Moy: {classItem.globalAverage?.toFixed(2)}/20</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={handleResetLocal}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                🔄 Réinitialiser
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleApplyFilter}
                disabled={loading || selectedClassIds.length === 0}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Chargement...' : '✓ Appliquer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
