"use client";

interface PropertiesProps {
  title: string;
  description: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
}

export default function Properties({
  title,
  description,
  setTitle,
  setDescription,
}: PropertiesProps) {
  return (
<aside className="w-80 border-l border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
        Propiedades
      </h2>

      <label className="block mb-2 font-medium text-gray-700">
        Título
      </label>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Título del interactivo"
        aria-label="Título del interactivo"
className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"      />

      <label className="block mt-4 mb-2 font-medium text-gray-700">
        Descripción
      </label>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripción del interactivo"
        aria-label="Descripción del interactivo"
className="w-full rounded border border-gray-300 px-3 py-2 text-gray-700 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"      />
    </aside>
  );
}