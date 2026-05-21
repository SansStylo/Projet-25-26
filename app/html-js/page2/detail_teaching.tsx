// app/html-js/page2/detail_teaching.tsx
interface BlocDetailsProps {
  blocName: string;       // Le nom du bloc cliqué (ex: "Bloc 1")
  onClose: () => void;    // La fonction pour fermer la vue
}

export default function BlocDetails({ blocName, onClose }: BlocDetailsProps) {
  return (
    // "inset-0" force le bloc à prendre tout l'écran (top:0, left:0, right:0, bottom:0)
    <div className="center absolute w-[95%] h-[95%] inset-0 m-auto bg-slate-100 backdrop-blur-sm z-50 p-10 flex flex-col justify-center items-center">
      
      <h2 className="text-3xl font-bold text-slate-900 mb-4 absolute top-[2%] left-[2%]">
        <label htmlFor="teaching-select"></label>
        <select id="teaching-select" className="cursor-pointer text-2xl font-bold">
            <option className="text-base font-normal text-gray-700 bg-white" value="">--Veuillez choisir une option--</option>
            <option className="text-base font-normal text-gray-700 bg-white" value="">Math</option>
            <option className="text-base font-normal text-gray-700 bg-white" value="">Physique</option>
            <option className="text-base font-normal text-gray-700 bg-white" value="">Informatique</option>
            <option className="text-base font-normal text-gray-700 bg-white" value="">Histoire</option>
            <option className="text-base font-normal text-gray-700 bg-white" value="">Philosophie</option>
            <option className="text-base font-normal text-gray-700 bg-white" value="">Anglais</option>
        </select>
      </h2>
      
      <div className="mt-[3%] text-4 relative inset-0 m-auto w-[95%] bg-slate-200">Intervenant : 
        <div className="text-3 relative inset-0 m-5 w-[95%] bg-slate-200">
            <select>
                <option className="" value="">--Veuillez choisir une option--</option>
                <option className="" value="">...</option>
            </select>
        </div>
      </div>
      <div className="text-4 relative inset-0 m-auto w-[95%] bg-slate-200">Etudiants : 
        <div className="flex justify-end text-3 relative inset-0 m-5 w-[95%] bg-slate-200">
            <button className="h-12 w-40 cursor-pointer bg-green-500 ml-[1%] rounded">Add Student</button>
            <button className="h-12 w-40 cursor-pointer bg-green-500 ml-[1%] rounded">Add Group</button>
            <button className="h-12 w-40 cursor-pointer bg-green-500 ml-[1%] rounded">Add Prom</button>
        </div>
      </div>
      <div className="text-4 relative inset-0 m-auto w-[95%] bg-slate-200">Groupe : 
        <div className="text-3 relative inset-0 m-5 w-[95%] bg-slate-200">
            <button className="h-12 w-40 cursor-pointer bg-purple-600 ml-[1%] rounded">+ Affect Group</button>
        </div>
      </div>
      <div className="text-4 relative inset-0 m-auto w-[95%] bg-slate-200">Promo : 
        <div className="text-3 relative inset-0 m-5 w-[95%] bg-slate-200">
            <button className="h-12 w-40 cursor-pointer bg-purple-600 ml-[1%] rounded">+ Affect Prom</button>
        </div>
      </div>

      <button className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded-lg font-medium absolute right-[2%] top-[2%]" onClick={onClose}>
        ✕
      </button>

    </div>
  );
}