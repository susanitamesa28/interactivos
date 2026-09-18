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
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "interactive-editor-project";

type UniversityTheme = "default" | "unibe" | "unphu" | "rosario";
type CloudProject = {
  id: string;
  title: string;
  description: string;
  content: {
    tabs: Tab[];
    theme: UniversityTheme;
  };
  created_at: string;
  updated_at: string;
};
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

function historyReducer(
  state: HistoryState,
  action: HistoryAction
): HistoryState {
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
      return isRecord(value.data) && typeof value.data.src === "string";
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
  theme?: UniversityTheme;
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
const [cloudProjectId, setCloudProjectId] = useState<string | null>(null);
const [isCloudSaving, setIsCloudSaving] = useState(false);
const [isCloudLoading, setIsCloudLoading] = useState(false);
const [cloudMessage, setCloudMessage] = useState("");

const [isProjectsOpen, setIsProjectsOpen] = useState(false);
const [projects, setProjects] = useState<CloudProject[]>([]);
const [isProjectsLoading, setIsProjectsLoading] = useState(false);
const [projectsMessage, setProjectsMessage] = useState("");

useEffect(() => {
  if (!user) {
    setCloudProjectId(null);
    return;
  }

  let isMounted = true;

  async function loadExistingProject() {
    setIsCloudLoading(true);
    setCloudMessage("");

    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!isMounted) return;

    setIsCloudLoading(false);

    if (error) {
      console.error("No se pudo buscar el proyecto existente:", error);
      setCloudMessage(
        "No se pudo comprobar si ya existe un proyecto guardado."
      );
      return;
    }

    if (data) {
      setCloudProjectId(data.id);
    }
  }

  void loadExistingProject();

  return () => {
    isMounted = false;
  };
}, [user]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        console.error("No se pudo recuperar la sesión:", error);
        setAuthMessage("No se pudo comprobar la sesión.");
      }

      setUser(data.session?.user ?? null);
      setIsAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
      setAuthMessage("");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setAuthMessage("");

    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      console.error("No se pudo cerrar la sesión:", error);
      setAuthMessage("No se pudo cerrar sesión. Inténtalo nuevamente.");
      return;
    }

    setUser(null);
    setCloudProjectId(null);
    setCloudMessage("");
  }

  async function handleSaveToCloud() {
    setCloudMessage("");

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const projectTitle = title.trim() || "Nuevo interactivo";
    const projectDescription = description.trim();
    const projectContent = { tabs, theme };

    setIsCloudSaving(true);

    if (cloudProjectId) {
      const { data, error } = await supabase
        .from("projects")
        .update({
          title: projectTitle,
          description: projectDescription,
          content: projectContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cloudProjectId)
        .select("id, updated_at")
        .single();

      setIsCloudSaving(false);

      if (error) {
        console.error("No se pudo actualizar el proyecto:", error);
        setCloudMessage(
          "No se pudo actualizar el proyecto en la nube. Inténtalo nuevamente."
        );
        return;
      }

      setCloudProjectId(data.id);
      setCloudMessage("Cambios guardados en la nube.");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: projectTitle,
        description: projectDescription,
        content: projectContent,
      })
      .select("id, updated_at")
      .single();

    setIsCloudSaving(false);

    if (error) {
      console.error("No se pudo guardar el proyecto:", error);
      setCloudMessage(
        "No se pudo guardar el proyecto en la nube. Inténtalo nuevamente."
      );
      return;
    }

    setCloudProjectId(data.id);
    setCloudMessage("Proyecto guardado en la nube.");
  }
  function handleNewProject() {
  const confirmed = window.confirm(
    "¿Deseas iniciar un nuevo proyecto? El proyecto actual permanecerá guardado."
  );

  if (!confirmed) return;

  dispatch({
    type: "RESET_HISTORY",
    project: createInitialProject(),
  });

  setCloudProjectId(null);
  setCloudMessage("Nuevo proyecto iniciado.");
  setProjectsMessage("");
  setIsProjectsOpen(false);
}
async function loadProjects() {
  if (!user) {
    setIsAuthModalOpen(true);
    return;
  }

  setIsProjectsLoading(true);
  setProjectsMessage("");

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, description, content, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  setIsProjectsLoading(false);

  if (error) {
    console.error("No se pudieron cargar los proyectos:", error);
    setProjectsMessage(
      "No se pudieron cargar los proyectos. Inténtalo nuevamente."
    );
    return;
  }

  setProjects((data ?? []) as CloudProject[]);
}
async function handleDuplicateProject(project: CloudProject) {
  if (!user) {
    setIsAuthModalOpen(true);
    return;
  }

  setProjectsMessage("");

  const duplicateTitle = `${project.title || "Sin título"} (copia)`;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: duplicateTitle,
      description: project.description,
      content: project.content,
    })
    .select("id, title, description, content, created_at, updated_at")
    .single();

  if (error) {
    console.error("No se pudo duplicar el proyecto:", error);
    setProjectsMessage(
      "No se pudo duplicar el proyecto. Inténtalo nuevamente."
    );
    return;
  }

  const duplicatedProject = data as CloudProject;

  setProjects((currentProjects) => [
    duplicatedProject,
    ...currentProjects,
  ]);

  setCloudProjectId(duplicatedProject.id);
  setCloudMessage("Proyecto duplicado correctamente.");
}
async function handleDeleteProject(project: CloudProject) {
  if (!user) {
    setIsAuthModalOpen(true);
    return;
  }

  const confirmed = window.confirm(
    `¿Seguro que deseas eliminar "${project.title || "Sin título"}"? Esta acción no se puede deshacer.`
  );

  if (!confirmed) return;

  setProjectsMessage("");

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("No se pudo eliminar el proyecto:", error);
    setProjectsMessage(
      "No se pudo eliminar el proyecto. Inténtalo nuevamente."
    );
    return;
  }

  setProjects((currentProjects) =>
    currentProjects.filter(
      (currentProject) => currentProject.id !== project.id
    )
  );

  if (cloudProjectId === project.id) {
    setCloudProjectId(null);
    setCloudMessage(
      "El proyecto abierto fue eliminado. Guarda como un proyecto nuevo si lo necesitas."
    );
  } else {
    setProjectsMessage("Proyecto eliminado correctamente.");
  }
}
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
    updateProject((project) => ({ ...project, theme: value }));
  };

  useEffect(() => {
    if (exportErrors.length > 0) exportErrorsRef.current?.focus();
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
              title: parsed.title ?? "Nuevo interactivo",
              description: parsed.description ?? "Descripción del interactivo",
              tabs: parsed.tabs,
              activeTab: 0,
              theme: parsed.theme ?? "default",
            },
          });
        } else {
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
  }, [title, description, tabs, theme, hasLoaded]);

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
    const blob = new Blob(
      [JSON.stringify({ title, description, tabs, theme }, null, 2)],
      { type: "application/json" }
    );
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
          title: parsed.title ?? "Nuevo interactivo",
          description: parsed.description ?? "Descripción del interactivo",
          tabs: parsed.tabs.length > 0 ? parsed.tabs : createDefaultTabs(),
          activeTab: 0,
          theme: parsed.theme ?? "default",
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
        errors.push(`La pestaña "${tab.title || tabIndex + 1}" no tiene bloques.`);
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
      default: { primary: "#0035E5", secondary: "#002BB8", accent: "#E6EBFF" },
      unibe: { primary: "#0033A0", secondary: "#00A3E1", accent: "#E6F4FF" },
      unphu: { primary: "#439441", secondary: "#006837", accent: "#ECF8E8" },
      rosario: { primary: "#DA0921", secondary: "#3100A0", accent: "#FBE6E9" },
    } as const;
    const exportColors = exportThemeColors[theme];

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    :root { --primary-color: ${exportColors.primary}; --secondary-color: ${exportColors.secondary}; --accent-color: ${exportColors.accent}; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; color: #222; }
    .wrap { max-width: 1000px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
    h1 { margin-top: 0; color: var(--primary-color); }
    .tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 24px 0 16px; }
    .tab-button { border: 1px solid var(--secondary-color); background: #fff; padding: 10px 14px; border-radius: 8px; cursor: pointer; color: var(--primary-color); }
    .tab-button.active, .button-link { background: var(--primary-color); color: #fff; border-color: var(--primary-color); }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .block { margin-bottom: 16px; padding: 16px; border: 1px solid var(--accent-color); border-radius: 10px; background: var(--accent-color); }
    .block img, .block iframe { max-width: 100%; border-radius: 8px; }
    .button-link { display: inline-block; padding: 10px 14px; border-radius: 8px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${safeTitle}</h1>
    <p>${safeDescription}</p>
    <div class="tabs">
      ${tabs.map((tab, index) => `<button class="tab-button ${index === 0 ? "active" : ""}" data-tab="${index}">${escapeHtml(tab.title)}</button>`).join("")}
    </div>
    ${tabs.map((tab, index) => `<div class="tab-panel ${index === 0 ? "active" : ""}" data-panel="${index}">${tab.blocks.map((block) => {
      switch (block.type) {
        case "text": return `<div class="block"><p>${escapeHtml(block.data)}</p></div>`;
        case "image": return `<div class="block"><img src="${escapeHtml(block.data.src)}" alt="${escapeHtml(block.data.alt || "")}" /></div>`;
        case "button": return `<div class="block"><a class="button-link" href="${escapeHtml(block.data.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.data.label)}</a></div>`;
        case "video": return `<div class="block"><iframe src="${escapeHtml(block.data.src)}" title="Video" width="100%" height="400" allowfullscreen></iframe></div>`;
        default: return "";
      }
    }).join("")}</div>`).join("")}
  </div>
  <script>
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanels = document.querySelectorAll(".tab-panel");
    tabButtons.forEach((button) => button.addEventListener("click", () => {
      const index = button.getAttribute("data-tab");
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanels.forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.querySelector('[data-panel="' + index + '"]')?.classList.add("active");
    }));
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
      window.alert("Ingresa una URL pública válida que comience con http:// o https://.");
      return;
    }

    const safeIframeTitle = escapeHtml(title.trim() || "Interactivo educativo");
    const safeHeight = /^\d+$/.test(iframeHeight.trim()) ? iframeHeight.trim() : "720";
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
      window.alert("No se pudo copiar automáticamente. Revisa los permisos del navegador.");
    }
  }

  if (!hasLoaded) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-500">Cargando editor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <div className="flex min-h-screen min-w-0 overflow-x-hidden">
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportJson}
          className="hidden"
        />

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
        />

        <section className="min-w-0 flex-1 overflow-x-hidden p-4">
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Guardado en la nube</h2>
              {isAuthLoading ? (
                <p className="mt-1 text-sm text-gray-600">Comprobando sesión...</p>
              ) : user ? (
                <p className="mt-1 text-sm text-gray-600">Sesión activa: {user.email}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-600">Inicia sesión para guardar tus interactivos y recuperarlos desde otro dispositivo.</p>
              )}
              {authMessage && <p role="alert" className="mt-2 text-sm text-red-700">{authMessage}</p>}
              {cloudMessage && (
                <p role="status" className={`mt-2 text-sm ${cloudMessage.startsWith("No se pudo") ? "text-red-700" : "text-green-700"}`}>
                  {cloudMessage}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {isAuthLoading ? null : user ? (
                <>
                <button
  type="button"
  onClick={() => {
    setIsProjectsOpen(true);
    void loadProjects();
  }}
  className="rounded-md border border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  Mis proyectos
</button>
                  <button
                    type="button"
                    onClick={handleSaveToCloud}
                    disabled={isCloudSaving || isCloudLoading}
                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {isCloudLoading
  ? "Comprobando..."
  : isCloudSaving
    ? "Guardando..."
    : cloudProjectId
      ? "Guardar cambios"
      : "Guardar en la nube"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cerrar sesión
                  </button>
                  <button
  type="button"
  onClick={handleNewProject}
  className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
>
  Nuevo proyecto
</button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>

          {exportErrors.length > 0 && (
            <div ref={exportErrorsRef} tabIndex={-1} role="alert" className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Revisa antes de exportar:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {exportErrors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </div>
          )}

          <p className="mb-3 text-sm text-gray-500">{saved ? "Guardado" : "Cambios pendientes..."}</p>

          <div className="mb-4 rounded-xl border border-gray-400 bg-gray-50 p-4">
            <h2 className="text-base font-semibold text-gray-900">Integración LMS</h2>
            <p className="mt-1 text-sm text-gray-600">Pega la URL pública del HTML publicado en GitHub Pages para generar el código iframe.</p>
            <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">URL pública del interactivo</span>
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
                <span className="mb-1 block text-sm font-medium text-gray-700">Alto del iframe en píxeles</span>
                <input
                  type="number"
                  min="300"
                  value={iframeHeight}
                  onChange={(event) => setIframeHeight(event.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
            </div>
            <button type="button" onClick={handleCopyIframeCode} className="mt-4 rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              {iframeCopied ? "Código copiado" : "Copiar código iframe"}
            </button>
          </div>
{isProjectsOpen && (
  <div
    className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4"
    role="dialog"
    aria-labelledby="projects-title"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2
          id="projects-title"
          className="text-base font-semibold text-gray-900"
        >
          Mis proyectos
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Materiales guardados en tu cuenta.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsProjectsOpen(false)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Cerrar
      </button>
    </div>

    {isProjectsLoading && (
      <p className="mt-4 text-sm text-gray-600">
        Cargando proyectos...
      </p>
    )}

    {projectsMessage && (
      <p role="alert" className="mt-4 text-sm text-red-700">
        {projectsMessage}
      </p>
    )}

    {!isProjectsLoading && !projectsMessage && projects.length === 0 && (
      <p className="mt-4 rounded-md border border-blue-200 bg-white p-3 text-sm text-gray-600">
        Todavía no tienes proyectos guardados.
      </p>
    )}

    {!isProjectsLoading && projects.length > 0 && (
      <div className="mt-4 space-y-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <h3 className="font-semibold text-gray-900">
              {project.title || "Sin título"}
            </h3>

            {project.description && (
              <p className="mt-1 text-sm text-gray-600">
                {project.description}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Modificado:{" "}
              {new Date(project.updated_at).toLocaleString("es-MX")}
            </p>

            <div className="mt-3">
              <button
  type="button"
  onClick={() => {
    if (
      !project.content ||
      !Array.isArray(project.content.tabs) ||
      project.content.tabs.length === 0
    ) {
      setProjectsMessage(
        "Este proyecto no tiene un contenido válido para abrir."
      );
      return;
    }

    dispatch({
      type: "RESET_HISTORY",
      project: {
        title: project.title,
        description: project.description,
        tabs: project.content.tabs,
        activeTab: 0,
        theme: project.content.theme ?? "default",
      },
    });

    setCloudProjectId(project.id);
    setCloudMessage(`Proyecto "${project.title}" abierto.`);
    setProjectsMessage("");
    setIsProjectsOpen(false);
  }}
  className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
>
  Abrir
</button>
<button
  type="button"
  onClick={() => void handleDuplicateProject(project)}
  className="rounded-md border border-blue-700 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
>
  Duplicar
</button>
<div className="mt-3 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => {
      if (
        !project.content ||
        !Array.isArray(project.content.tabs) ||
        project.content.tabs.length === 0
      ) {
        setProjectsMessage(
          "Este proyecto no tiene un contenido válido para abrir."
        );
        return;
      }

      dispatch({
        type: "RESET_HISTORY",
        project: {
          title: project.title,
          description: project.description,
          tabs: project.content.tabs,
          activeTab: 0,
          theme: project.content.theme ?? "default",
        },
      });

      setCloudProjectId(project.id);
      setCloudMessage(`Proyecto "${project.title}" abierto.`);
      setProjectsMessage("");
      setIsProjectsOpen(false);
    }}
    className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
  >
    Abrir
  </button>

  <button
    type="button"
    onClick={() => void handleDuplicateProject(project)}
    className="rounded-md border border-blue-700 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
  >
    Duplicar
  </button>

  <button
    type="button"
    onClick={() => void handleDeleteProject(project)}
    className="rounded-md border border-red-600 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
  >
    Eliminar
  </button>
</div>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
)}
          <Preview
            title={title}
            description={description}
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
          />
        </section>

        <RightPanel
          title={title}
          description={description}
          setTitle={setTitle}
          setDescription={setDescription}
          tabs={tabs}
          activeTab={activeTab}
          setTabs={setTabs}
          setActiveTab={setActiveTab}
          addTab={addTab}
        />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}
