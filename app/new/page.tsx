"use client";

import {
  ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import Sidebar from "../../components/editor/Sidebar";
import Preview from "../../components/editor/Preview";
import RightPanel from "../../components/editor/RightPanel";
import { Tab } from "../../types/interactive";
const STORAGE_KEY = "interactive-editor-project";
type UniversityTheme = "default" | "unibe" | "unphu" | "rosario";

type ProjectState = {
  title: string;
  description: string;
  tabs: Tab[];
  activeTab: number;
  theme: UniversityTheme;
};

type HistoryState = {
  past: ProjectState[];
  present: ProjectState;
  future: ProjectState[];
};

type HistoryAction =
  | { type: "SET_PROJECT"; project: ProjectState }
  | { type: "RESET_HISTORY"; project: ProjectState }
  | { type: "UNDO" }
  | { type: "REDO" };

function createDefaultTabs(): Tab[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      blocks: [
        {
          id: crypto.randomUUID(),
          type: "text",
          data: "Nuevo bloque de texto",
        },
      ],
    },
  ];
}

function createInitialProject(): ProjectState {
  return {
    title: "",
    description: "",
    tabs: createDefaultTabs(),
    activeTab: 0,
    theme: "default",
  };
}

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  if (action.type === "RESET_HISTORY") {
    return { past: [], present: action.project, future: [] };
  }

  if (action.type === "SET_PROJECT") {
    return {
      past: [...state.past, state.present].slice(-30),
      present: action.project,
      future: [],
    };
  }

  if (action.type === "UNDO") {
    const previous = state.past.at(-1);
    if (!previous) return state;

    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === "REDO") {
    const next = state.future[0];
    if (!next) return state;

    return {
      past: [...state.past, state.present].slice(-30),
      present: next,
      future: state.future.slice(1),
    };
  }

  return state;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidImportedBlock(
  value: unknown
): value is Tab["blocks"][number] {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.type !== "string"
  ) {
    return false;
  }

  switch (value.type) {
    case "text":
      return typeof value.data === "string";

    case "image":
      return (
        isRecord(value.data) &&
        typeof value.data.src === "string" &&
        typeof value.data.alt === "string"
      );

    case "video":
      return (
        isRecord(value.data) &&
        typeof value.data.src === "string"
      );

    case "button":
      return (
        isRecord(value.data) &&
        typeof value.data.label === "string" &&
        typeof value.data.url === "string"
      );

    default:
      return false;
  }
}

function isValidImportedTab(value: unknown): value is Tab {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    Array.isArray(value.blocks) &&
    value.blocks.every(isValidImportedBlock)
  );
}

function isValidImportedProject(
  value: unknown
): value is {
  title?: string;
  description?: string;
  tabs: Tab[];
  theme?: "default" | "unibe" | "unphu" | "rosario" ;
} {
  return (
    isRecord(value) &&
    (typeof value.title === "undefined" || typeof value.title === "string") &&
    (typeof value.description === "undefined" ||
      typeof value.description === "string") &&
    Array.isArray(value.tabs) &&
    value.tabs.every(isValidImportedTab) &&
    (typeof value.theme === "undefined" ||
      value.theme === "default" ||
      value.theme === "unibe" ||
      value.theme === "unphu" ||
      value.theme === "rosario")
  );
}
 
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
export default function NewInteractivePage() { 
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: createInitialProject(),
    future: [],
  });
const { title, description, tabs, activeTab, theme } = history.present;

  const [hasLoaded, setHasLoaded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [exportErrors, setExportErrors] = useState<string[]>([]);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const exportErrorsRef = useRef<HTMLDivElement>(null);
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
const [publicUrl, setPublicUrl] = useState("");
const [iframeHeight, setIframeHeight] = useState("720");
const [iframeCopied, setIframeCopied] = useState(false);

  function updateProject(updater: (project: ProjectState) => ProjectState) {
    dispatch({ type: "SET_PROJECT", project: updater(history.present) });
  }
const addTab = () => {
  updateProject((project) => {
    const newTabIndex = project.tabs.length;

    const newTab: Tab = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      blocks: [
        {
          id: crypto.randomUUID(),
          type: "text",
          data: "Nuevo bloque de texto",
        },
      ],
    };

    return {
      ...project,
      tabs: [...project.tabs, newTab],
      activeTab: newTabIndex,
    };
  });
};
  const setTitle: Dispatch<SetStateAction<string>> = (value) => {
    updateProject((project) => ({
      ...project,
      title: typeof value === "function" ? value(project.title) : value,
    }));
  };

  const setDescription: Dispatch<SetStateAction<string>> = (value) => {
    updateProject((project) => ({
      ...project,
      description:
        typeof value === "function" ? value(project.description) : value,
    }));
  };

  const setTabs: Dispatch<SetStateAction<Tab[]>> = (value) => {
    updateProject((project) => ({
      ...project,
      tabs: typeof value === "function" ? value(project.tabs) : value,
    }));
  };

  const setActiveTab: Dispatch<SetStateAction<number>> = (value) => {
    updateProject((project) => ({
      ...project,
      activeTab:
        typeof value === "function" ? value(project.activeTab) : value,
    }));
  };
const setTheme = (value: UniversityTheme) => {
  updateProject((project) => ({
    ...project,
    theme: value,
  }));
};
  useEffect(() => {
    if (exportErrors.length > 0) {
      exportErrorsRef.current?.focus();
    }
  }, [exportErrors]);

  useEffect(() => {
    const savedProject = localStorage.getItem(STORAGE_KEY);

  if (savedProject) {
  try {
    const parsed: unknown = JSON.parse(savedProject);

    if (isValidImportedProject(parsed) && parsed.tabs.length > 0) {
  dispatch({
    type: "RESET_HISTORY",
    project: {
      title:
        typeof parsed.title === "string"
          ? parsed.title
          : "Nuevo interactivo",
      description:
        typeof parsed.description === "string"
          ? parsed.description
          : "Descripción del interactivo",
      tabs: parsed.tabs,
      activeTab: 0,
      theme:
        parsed.theme === "unibe" ||
        parsed.theme === "unphu" ||
        parsed.theme === "rosario"
          ? parsed.theme
          : "default",
    },
  });
    } else {
      console.warn(
        "El proyecto guardado en localStorage no tiene una estructura válida. Se usará un proyecto por defecto."
      );
      dispatch({ type: "RESET_HISTORY", project: createInitialProject() });
    }
  } catch (error) {
    console.error("No se pudo leer el proyecto guardado:", error);
    dispatch({ type: "RESET_HISTORY", project: createInitialProject() });
  }
}

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    setSaved(false);
    const timer = setTimeout(() => setSaved(true), 600);
    return () => clearTimeout(timer);
  }, [title, description, tabs, hasLoaded]);

  useEffect(() => {
  if (!hasLoaded) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ title, description, tabs, theme })
  );
}, [title, description, tabs, theme, hasLoaded]);

  function handleUndo() {
    if (canUndo) dispatch({ type: "UNDO" });
  }

  function handleRedo() {
    if (canRedo) dispatch({ type: "REDO" });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.key.toLowerCase() !== "z") return;

      event.preventDefault();
      if (event.shiftKey) handleRedo();
      else handleUndo();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, history]);

  function handleResetProject() {
    const confirmed = window.confirm(
      "Esto borrará el proyecto guardado en este navegador. ¿Deseas continuar?"
    );
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "RESET_HISTORY", project: createInitialProject() });
    setExportErrors([]);
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify({ title, description, tabs }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "interactivo-proyecto.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleOpenImportDialog() {
    importInputRef.current?.click();
  }

  async function handleImportJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
     const parsed: unknown = JSON.parse(await file.text());

if (!isValidImportedProject(parsed)) {
  window.alert("El archivo JSON no tiene un formato válido.");
  return;
}

      dispatch({
        type: "RESET_HISTORY",
        project: {
  title:
    typeof parsed.title === "string"
      ? parsed.title
      : "Nuevo interactivo",
  description:
    typeof parsed.description === "string"
      ? parsed.description
      : "Descripción del interactivo",
  tabs: parsed.tabs.length > 0 ? parsed.tabs : createDefaultTabs(),
  activeTab: 0,
  theme:
    parsed.theme === "unibe" || parsed.theme === "unphu" || parsed.theme === "rosario"
      ? parsed.theme
      : "default",
},
      });
      setExportErrors([]);
    } catch (error) {
      console.error("No se pudo importar el archivo JSON:", error);
      window.alert("No se pudo importar el archivo. Verifica que sea un JSON válido.");
    } finally {
      event.target.value = "";
    }
  }

  function handleExport() {
    const errors: string[] = [];
    if (!title.trim()) errors.push("El título del interactivo es obligatorio.");
    if (tabs.length === 0) errors.push("Debe existir al menos una pestaña.");

    tabs.forEach((tab, tabIndex) => {
      if (!tab.title.trim()) errors.push(`La pestaña ${tabIndex + 1} no tiene título.`);
      if (tab.blocks.length === 0) {
        errors.push(`La pestaña \"${tab.title || tabIndex + 1}\" no tiene bloques.`);
      }

      tab.blocks.forEach((block, blockIndex) => {
        const label = `Pestaña ${tabIndex + 1}, bloque ${blockIndex + 1}`;
        switch (block.type) {
          case "text":
            if (!block.data.trim()) errors.push(`${label}: el bloque de texto está vacío.`);
            break;
          case "image":
            if (!block.data.src.trim()) errors.push(`${label}: la imagen no tiene URL.`);
            else if (!isValidUrl(block.data.src.trim())) errors.push(`${label}: la URL de la imagen no es válida.`);
            break;
          case "button":
            if (!block.data.label.trim()) errors.push(`${label}: el botón no tiene texto.`);
            if (!block.data.url.trim()) errors.push(`${label}: el botón no tiene URL.`);
            else if (!isValidUrl(block.data.url.trim())) errors.push(`${label}: la URL del botón no es válida.`);
            break;
          case "video":
            if (!block.data.src.trim()) errors.push(`${label}: el video no tiene URL.`);
            else if (!isValidUrl(block.data.src.trim())) errors.push(`${label}: la URL del video no es válida.`);
            break;
        }
      });
    });

    if (errors.length > 0) {
      setExportErrors(errors);
      return;
    }

    setExportErrors([]);

const safeTitle = escapeHtml(title);
const safeDescription = escapeHtml(description);

const exportThemeColors = {
  default: {
  primary: "#0035E5",
  secondary: "#002BB8",
  accent: "#E6EBFF",
},
  unibe: {
    primary: "#0033A0",
    secondary: "#00A3E1",
    accent: "#E6F4FF",
  },
  unphu: {
    primary: "#439441",
    secondary: "#006837",
    accent: "#ECF8E8",
  },
  rosario: {
    primary: "#DA0921",
    secondary: "#3100A0",
    accent: "#FBE6E9",
  },
} as const;

const exportColors = exportThemeColors[theme];

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
 <style>
    :root {
      --primary-color: ${exportColors.primary};
      --secondary-color: ${exportColors.secondary};
      --accent-color: ${exportColors.accent};
    }

    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f5f5f5;
      color: #222;
    }

    .wrap {
      max-width: 1000px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin-top: 0;
      color: var(--primary-color);
    }

    .tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 24px 0 16px;
    }

    .tab-button {
      border: 1px solid var(--secondary-color);
      background: #fff;
      padding: 10px 14px;
      border-radius: 8px;
      cursor: pointer;
      color: var(--primary-color);
    }

    .tab-button.active,
    .button-link {
      background: var(--primary-color);
      color: #fff;
      border-color: var(--primary-color);
    }

    .tab-panel {
      display: none;
    }

    .tab-panel.active {
      display: block;
    }

    .block {
      margin-bottom: 16px;
      padding: 16px;
      border: 1px solid var(--accent-color);
      border-radius: 10px;
      background: var(--accent-color);
    }

    .block img,
    .block iframe {
      max-width: 100%;
      border-radius: 8px;
    }

    .button-link {
      display: inline-block;
      padding: 10px 14px;
      border-radius: 8px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${safeTitle}</h1>
    <p>${safeDescription}</p>

    <div class="tabs">
      ${tabs
  .map((tab, index) => {
    const safeTabTitle = escapeHtml(tab.title);

    return `<button class="tab-button ${
      index === 0 ? "active" : ""
    }" data-tab="${index}">${safeTabTitle}</button>`;
  })
  .join("")}
    </div>

    ${tabs
      .map(
        (tab, index) => `
          <div class="tab-panel ${
            index === 0 ? "active" : ""
          }" data-panel="${index}">
            ${tab.blocks
              .map((block) => {
                switch (block.type) {
                  case "text":
  return `<div class="block"><p>${escapeHtml(block.data)}</p></div>`;
                  case "image":
  return `<div class="block"><img src="${escapeHtml(
    block.data.src
  )}" alt="${escapeHtml(block.data.alt || "")}" /></div>`;

                  case "button":
  return `<div class="block"><a class="button-link" href="${escapeHtml(
    block.data.url
  )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
    block.data.label
  )}</a></div>`;

case "video":
  return `<div class="block"><iframe src="${escapeHtml(
    block.data.src
  )}" title="Video" width="100%" height="400" allowfullscreen></iframe></div>`;

                  default:
                    return "";
                }
              })
              .join("")}
          </div>
        `
      )
      .join("")}
  </div>

  <script>
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.getAttribute("data-tab");

        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabPanels.forEach((panel) => panel.classList.remove("active"));

        button.classList.add("active");

        document
          .querySelector('[data-panel="' + index + '"]')
          ?.classList.add("active");
      });
    });
  <\/script>
</body>
</html>`;

const blob = new Blob([html], { type: "text/html;charset=utf-8" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");

link.href = url;
link.download = "interactivo.html";

document.body.appendChild(link);
link.click();
document.body.removeChild(link);

URL.revokeObjectURL(url);
    }
    async function handleCopyIframeCode() {
  const url = publicUrl.trim();

  if (!isValidUrl(url)) {
    window.alert(
      "Ingresa una URL pública válida que comience con http:// o https://."
    );
    return;
  }

  const safeIframeTitle = escapeHtml(
    title.trim() || "Interactivo educativo"
  );

  const safeHeight = /^\d+$/.test(iframeHeight.trim())
    ? iframeHeight.trim()
    : "720";

  const iframeCode = `<iframe
  src="${escapeHtml(url)}"
  title="${safeIframeTitle}"
  width="100%"
  height="${safeHeight}"
  frameborder="0"
  scrolling="auto"
  loading="lazy"
  allowfullscreen
></iframe>`;

  try {
    await navigator.clipboard.writeText(iframeCode);
    setIframeCopied(true);
    window.setTimeout(() => setIframeCopied(false), 2000);
  } catch (error) {
    console.error("No se pudo copiar el código iframe:", error);
    window.alert(
      "No se pudo copiar automáticamente. Revisa los permisos del navegador."
    );
  }
}
  if (!hasLoaded) {
    return <main className="min-h-screen bg-white"><div className="flex min-h-screen items-center justify-center"><p className="text-sm text-gray-500">Cargando editor...</p></div></main>;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
  <div className="flex min-h-screen min-w-0 overflow-x-hidden">
        <input ref={importInputRef} type="file" accept=".json,application/json" onChange={handleImportJson} className="hidden" />
<Sidebar
  onExport={handleExport}
  onExportJson={handleExportJson}
  onImportJson={handleOpenImportDialog}
  onReset={handleResetProject}
  onUndo={handleUndo}
  onRedo={handleRedo}
  canUndo={canUndo}
  canRedo={canRedo}
  theme={theme}
  onThemeChange={setTheme}
/>        <section className="min-w-0 flex-1 overflow-x-hidden p-4">
  {exportErrors.length > 0 && (
    <div
      ref={exportErrorsRef}
      tabIndex={-1}
      role="alert"
      className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-800"
    >
      <p className="font-semibold">Revisa antes de exportar:</p>

      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {exportErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  )}

  <p className="mb-3 text-sm text-gray-500">
    {saved ? "Guardado" : "Cambios pendientes..."}
  </p>
<div className="mb-4 rounded-xl border border-gray-400 bg-gray-50 p-4">
  <h2 className="text-base font-semibold text-gray-900">
    Integración LMS
  </h2>

  <p className="mt-1 text-sm text-gray-600">
    Pega la URL pública del HTML publicado en GitHub Pages para generar el
    código iframe.
  </p>

  <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        URL pública del interactivo
      </span>

      <input
        type="url"
        value={publicUrl}
        onChange={(event) => setPublicUrl(event.target.value)}
        placeholder="https://susanitamesa28.github.io/interactivos/demo.html"
        aria-label="URL pública del interactivo"
       className="w-full min-w-0 rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-600"
      />
    </label>

    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        Alto del iframe en píxeles
      </span>

      <input
        type="number"
        min="300"
        value={iframeHeight}
        onChange={(event) => setIframeHeight(event.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
      />
    </label>
  </div>

  <button
    type="button"
    onClick={handleCopyIframeCode}
    className="mt-4 rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
  >
    {iframeCopied ? "Código copiado" : "Copiar código iframe"}
  </button>
</div>
 <Preview
  title={title}
  description={description}
  tabs={tabs}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  theme={theme}
/>
</section>
        <RightPanel title={title} description={description} setTitle={setTitle} setDescription={setDescription} tabs={tabs} activeTab={activeTab} setTabs={setTabs} setActiveTab={setActiveTab}  addTab={addTab}/>
      </div>
    </main>
  );
}