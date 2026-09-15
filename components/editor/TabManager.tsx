import { Tab } from "@/types/interactive";


interface TabManagerProps {
  tabs: Tab[];
  activeTab: number;
  setTabs: (tabs: Tab[]) => void;
  setActiveTab: (index: number) => void;
  addTab: () => void;
}


export default function TabManager({
  tabs,
  activeTab,
  setTabs,
  setActiveTab,
  addTab,
}: TabManagerProps) {
  function removeTab(index: number) {
    if (tabs.length === 1) return;

    const updated = tabs.filter((_, i) => i !== index);

    setTabs(updated);

    if (activeTab >= updated.length) {
      setActiveTab(updated.length - 1);
    }
  }

  function updateTitle(index: number, value: string) {
    const updated = [...tabs];
    updated[index].title = value;
    setTabs(updated);
  }

  function updateContent(index: number, value: string) {
    const updated = [...tabs];
    updated[index].content = value;
    setTabs(updated);
  }

  return (
    <div className="min-w-0 overflow-x-hidden">
      <h2 className="text-lg font-bold mb-4">
        Pestañas
      </h2>

      <button
        onClick={addTab}
        className="w-full bg-blue-600 text-white rounded p-3 mb-6"
      >
        + Agregar pestaña
      </button>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={`border rounded p-4 mb-4 ${
            activeTab === index
              ? "border-bg-blue-600"
              : ""
          }`}
        >
          <input
  value={tab.title}
  onChange={(e) => updateTitle(index, e.target.value)}
  placeholder={`Pestaña ${index + 1}`}
  aria-label={`Título de la pestaña ${index + 1}`}
  className="w-full rounded border border-blue-300 p-2 text-blue-900 placeholder:text-blue-600"
/>

         <textarea
  value={tab.content}
  onChange={(e) => updateContent(index, e.target.value)}
  placeholder="Descripción o contenido de la pestaña"
  aria-label={`Contenido de la pestaña ${index + 1}`}
  className="h-24 w-full rounded border border-blue-300 p-2 text-blue-900 placeholder:text-blue-600"
/>

          <div className="flex justify-between mt-3">
            <button
              onClick={() => setActiveTab(index)}
              className="text-blue-600"
            >
              Seleccionar
            </button>

            <button
              onClick={() => removeTab(index)}
              className="text-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}