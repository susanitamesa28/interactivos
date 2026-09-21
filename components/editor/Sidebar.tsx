"use client";

interface SidebarProps {
  onExport: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onImportHtml: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  theme: "default" | "unibe" | "unphu" | "rosario";
  onThemeChange: (
    theme: "default" | "unibe" | "unphu" | "rosario"
  ) => void;
}

export default function Sidebar({
  onExport,
  onExportJson,
  onImportJson,
  onImportHtml,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  theme,
  onThemeChange,
}: SidebarProps) {
  return (
    <aside className="w-full shrink-0 border-b bg-white p-4 lg:w-64 lg:border-b-0 lg:border-r">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Herramientas
      </h2>

      <div className="mb-5">
        <label
          htmlFor="university-theme"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Tema institucional
        </label>

        <select
          id="university-theme"
          value={theme}
          onChange={(event) =>
            onThemeChange(
              event.target.value as
                | "default"
                | "unibe"
                | "unphu"
                | "rosario"
            )
          }
          className="w-full rounded border border-blue-300 bg-white px-3 py-2 text-sm text-blue-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="default">AP Latam</option>
          <option value="unibe">UNIBE</option>
          <option value="unphu">UNPHU</option>
          <option value="rosario">U Rosario</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="w-full rounded border border-blue-600 px-4 py-2 text-blue-800 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Deshacer
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="w-full rounded border border-blue-600 px-4 py-2 text-blue-800 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Rehacer
        </button>

        <hr className="my-1 border-blue-300 sm:col-span-2 lg:col-span-1" />

        <button
          type="button"
          onClick={onExport}
          className="w-full rounded border border-blue-600 px-4 py-2 text-blue-800 hover:bg-blue-50"
        >
          Exportar HTML
        </button>

        <button
          type="button"
          onClick={onImportHtml}
          className="w-full rounded border border-blue-600 px-4 py-2 text-blue-800 hover:bg-blue-50"
        >
          Importar HTML
        </button>

        <button
          type="button"
          onClick={onExportJson}
          className="w-full rounded border border-blue-600 px-4 py-2 text-blue-800 hover:bg-blue-50"
        >
          Exportar JSON
        </button>

        <button
          type="button"
          onClick={onImportJson}
          className="w-full rounded border border-blue-600 px-4 py-2 text-blue-800 hover:bg-blue-50"
        >
          Importar JSON
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
        >
          Nuevo proyecto
        </button>
      </div>
    </aside>
  );
}