'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface ClassOption {
  classId: number;
  label: string;
}

interface ClassSelectorProps {
  classes: ClassOption[];
}

export default function ClassSelector({ classes }: ClassSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentClassId = searchParams.get('classId') || '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      router.push(`/responsable?classId=${selectedId}`);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-sm">
      <label htmlFor="class-select" className="text-sm font-medium text-gray-600 whitespace-nowrap">
        Choisir une classe :
      </label>
      <select
        id="class-select"
        value={currentClassId}
        onChange={handleChange}
        className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
      >
        <option value="" disabled>-- Sélectionner --</option>
        {classes.map((cls) => (
          <option key={cls.classId} value={cls.classId}>
            {cls.label}
          </option>
        ))}
      </select>
    </div>
  );
}