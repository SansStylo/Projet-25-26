'use client';

import { useState, useEffect } from 'react';
import GlobalKpiCards from './GlobalKpiCards';
import ComparisonCharts from './ComparisonCharts';
import ClassesOverview from './ClassesOverview';
import KeyMetrics from './KeyMetrics';
import SubjectsPerformanceTable from './SubjectsPerformanceTable';
import { fetchFilteredData } from '@/app/responsable/server-actions';

interface ClassData {
  classId: number;
  className: string;
  totalStudents: number;
  globalAverage: number | null;
}

interface FilteredData {
  globalStats: {
    totalClasses: number;
    totalStudents: number;
    globalAverage: number | null;
  };
  subjectsPerformance: any[];
  comparisonData: any[];
  selectedClasses: any[];
}

interface ResponsableDashboardClientProps {
  initialClasses: ClassData[];
  initialSubjects: any[];
  initialComparison: any[];
}

export default function ResponsableDashboardClient({
  initialClasses,
  initialSubjects,
  initialComparison
}: ResponsableDashboardClientProps) {
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>(
    initialClasses.map(c => c.classId)
  );

  // Données affichées : filtrées ou initiales
  const displaySubjects = filteredData?.subjectsPerformance || initialSubjects;
  const displayComparison = filteredData?.comparisonData || initialComparison;
  const displayClasses = filteredData?.selectedClasses || initialClasses;

  const globalStats = {
    totalClasses: displayClasses.length,
    totalStudents: displayClasses.reduce((sum: number, c: any) => sum + c.totalStudents, 0),
    globalAverage: displayClasses.length > 0 
      ? parseFloat(
          (displayClasses.reduce((sum: number, c: any) => sum + (c.globalAverage || 0), 0) / displayClasses.length).toFixed(2)
        )
      : null
  };

  const handleFilterChange = async (newClassIds: number[]) => {
    setSelectedClassIds(newClassIds);
    if (newClassIds.length === 0) {
      setFilteredData(null);
      return;
    }

    try {
      const result = await fetchFilteredData(newClassIds);
      if (result.success && result.data) {
        setFilteredData(result.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleReset = () => {
    setSelectedClassIds(initialClasses.map(c => c.classId));
    setFilteredData(null);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Indicateurs clés */}
      <section>
        <KeyMetrics 
          totalClasses={globalStats.totalClasses}
          totalStudents={globalStats.totalStudents}
          globalAverage={globalStats.globalAverage}
          hasFilter={filteredData !== null}
        />
      </section>

      {/* Section 2: Sélecteur de groupes */}
      <section>
        <GlobalKpiCards 
          totalClasses={initialClasses.length}
          totalStudents={initialClasses.reduce((sum, c) => sum + c.totalStudents, 0)}
          globalAverage={
            initialClasses.length > 0 
              ? parseFloat(
                  (initialClasses.reduce((sum, c) => sum + (c.globalAverage || 0), 0) / initialClasses.length).toFixed(2)
                )
              : null
          }
          classes={initialClasses}
          onFilterChange={handleFilterChange}
          hasFilter={filteredData !== null}
          onReset={handleReset}
        />
      </section>

      {/* Section 3: Aperçu des groupes */}
      <section>
        <ClassesOverview classes={displayClasses} />
      </section>

      {/* Section 4: Tableau des matières */}
      <section>
        <SubjectsPerformanceTable subjects={displaySubjects} />
      </section>

      {/* Section 5: Graphiques de comparaison */}
      <section>
        <ComparisonCharts 
          subjects={displaySubjects}
          comparison={displayComparison}
        />
      </section>
    </div>
  );
}
