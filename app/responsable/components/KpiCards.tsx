'use client';

import { useState } from 'react';
import StudentListsModal from './StudentListsModal';

interface StudentProfile {
  studentId: string;
  firstname: string;
  surname: string;
  globalAverage: number | null;
  riskScore: number;
  riskLevel: 'FAIBLE' | 'MODERE' | 'CRITIQUE';
  flags: string[];
}

interface KpiCardsProps {
  studentsRisk: StudentProfile[];
  className: string;
  globalAverage: number | null;
}

export default function KpiCards({ studentsRisk, className, globalAverage }: KpiCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ALL' | 'CRITIQUE'>('ALL');

  const totalStudents = studentsRisk.length;
  const criticalCount = studentsRisk.filter(s => s.riskLevel === 'CRITIQUE').length;

  const openStudentModal = (type: 'ALL' | 'CRITIQUE') => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div 
          onClick={() => openStudentModal('ALL')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group flex flex-col justify-between min-w-0"
        >
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Effectif Total</h3>
            <p className="text-4xl font-extrabold mt-4 text-gray-900">
              {totalStudents}{' '}
              <span className="text-sm font-normal text-gray-400 tracking-normal">étudiants inscrits</span>
            </p>
          </div>
          <div className="text-xs text-blue-600 font-medium mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir la liste complète ➔
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Moyenne Générale ({className})
            </h3>
            <p className="text-4xl font-extrabold mt-4 text-blue-600">
              {globalAverage ? globalAverage.toFixed(2) : "N/A"}{' '}
              <span className="text-sm font-normal text-gray-400 tracking-normal">/ 20</span>
            </p>
          </div>
        </div>

        <div 
          onClick={() => openStudentModal('CRITIQUE')}
          className={`p-6 rounded-xl shadow-sm border flex flex-col justify-between cursor-pointer transition-all group min-w-0 ${
            criticalCount > 0 ? 'bg-red-50/50 border-red-100 hover:border-red-300' : 'bg-white border-gray-100 hover:border-gray-300'
          }`}
        >
          <div>
            <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
              Étudiants en situation de risque
            </h3>
            <p className="text-4xl font-extrabold mt-4 text-red-600">
              {criticalCount}
            </p>
          </div>
          <div className="text-xs text-red-600 font-medium mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Afficher les cas critiques ➔
          </div>
        </div>

      </section>

      <StudentListsModal 
        students={studentsRisk} 
        isOpen={modalOpen} 
        filterType={modalType} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
}