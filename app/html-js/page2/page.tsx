'use client';

import { useState } from 'react';
import BlocDetails from './detail_teaching'; // 1. On importe ton fichier lourd

export default function DashboardPage() {
  const [activeBloc, setActiveBloc] = useState<string | null>(null);

  return (
    // Conteneur principal qui prend tout l'écran. "flex" aligne la barre et le contenu côte à côte.
    <div className="min-h-screen flex bg-b text-gray-800">
      
      <nav className="w-64 min-h-screen bg-blue border-r border-gray-200 p-6 flex flex-col gap-3">
        
        {/* Titre de l'application */}
        <div className="font-bold text-lg mb-4 text-gray-800">Junia'lytics</div>

        {/* Boutons en colonne */}
        <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg bg-gray-900 text-white font-medium transition-colors">
          Option 1 (Actif)
        </button>
        
        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 2
        </button>
        
        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 3
        </button>
        
        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 4
        </button>
        
        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 5
        </button>

        <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Option 6
        </button>
      </nav>

      <main className="flex-1 p-10 bg-white overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Matières</h1>
        <div className=" flex flex-row flex-wrap items-center justify-center flex-shrink-0 gap-1 border border-black-200 [&>*]:w-[150px] [&>*]:h-[150px] [&>*]:flex [&>*]:flex-shrink-0 [&>*]:items-center [&>*]:justify-center [&>*]:border [&>*]:border-black-200 [&>*]:mt-[2px] [&>*]:mb-[2px]">
          <div className="cursor-pointer" onClick={() => setActiveBloc('Bloc 1 (Mathématiques)')}>Bloc 1</div>
          <div>Bloc 2</div>
          <div>Bloc 3</div>
          <div>Bloc 1</div>
          <div>Bloc 2</div>
          <div>Bloc 3</div>
          <div>Bloc 1</div>
          <div>Bloc 2</div>
          <div>Bloc 3</div>
          <div>Bloc 1</div>
          <div>Bloc 2</div>
          <div>Bloc 3</div>
        </div>
      </main>

      {activeBloc && (
        <BlocDetails 
          blocName={activeBloc} 
          onClose={() => setActiveBloc(null)} 
        />
      )}

    </div>
  );
}