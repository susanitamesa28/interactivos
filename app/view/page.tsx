"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PublicProject = {
  title: string;
  description: string | null;
  content: {
    tabs: Array<{
      id: string;
      title: string;
      blocks: Array<{
        id: string;
        type: string;
        data: any;
      }>;
    }>;
    theme: "default" | "unibe" | "unphu" | "rosario";
  };
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildInteractiveHtml(project: PublicProject) {
  const safeTitle = escapeHtml(project.title);
  const safeDescription = escapeHtml(project.description || "");

  const themeColors = {
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

  const colors = themeColors[project.content.theme] || themeColors.default;
  const tabs = project.content.tabs || [];

  const tabButtons = tabs
    .map(
      (tab, index) =>
        `<button class="tab-button ${
          index === 0 ? "active" : ""
        }" data-tab="${index}">${escapeHtml(tab.title)}</button>`
    )
    .join("");

  const tabPanels = tabs
    .map(
      (tab, index) => `
        <div class="tab-panel ${index === 0 ? "active" : ""}" data-panel="${index}">
          ${tab.blocks
            .map((block) => {
              switch (block.type) {
                case "text":
                  return `<div class="block"><p>${escapeHtml(
                    block.data
                  )}</p></div>`;

                case "image":
                  return `<div class="block"><img src="${escapeHtml(
                    block.data.src
                  )}" alt="${escapeHtml(
                    block.data.alt || ""
                  )}" /></div>`;

                case "button":
                  if (!isValidUrl(block.data.url)) return "";

                  return `<div class="block"><a class="button-link" href="${escapeHtml(
                    block.data.url
                  )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                    block.data.label
                  )}</a></div>`;

                case "video":
                  if (!isValidUrl(block.data.src)) return "";

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
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    :root {
      --primary-color: ${colors.primary};
      --secondary-color: ${colors.secondary};
      --accent-color: ${colors.accent};
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
      ${tabButtons}
    </div>

    ${tabPanels}
  </div>

  <script>
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.getAttribute("data-tab");

        tabButtons.forEach((item) => item.classList.remove("active"));
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
}

export default function PublicProjectPage() {
  const [project, setProject] = useState<PublicProject | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

 useEffect(() => {
async function loadProject() {
  const projectId = new URLSearchParams(
    window.location.search
  ).get("id");

  console.log("ID recibido:", projectId);

  if (!projectId) {
    setErrorMessage("No se recibió el ID del proyecto.");
    return;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("title, description, content")
    .eq("id", projectId)
    .eq("is_public", true)
    .maybeSingle();

  console.log("Proyecto recibido:", data);
  console.log("Error de Supabase:", error);

  if (error) {
    setErrorMessage(`Error de Supabase: ${error.message}`);
    return;
  }

  if (!data) {
    setErrorMessage(
      "No se encontró un proyecto público con ese ID."
    );
    return;
  }

  setProject(data as PublicProject);
}

  loadProject();
}, []);

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p>{errorMessage}</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p>Cargando interactivo...</p>
      </main>
    );
  }

  const html = buildInteractiveHtml(project);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <iframe
        title={project.title}
        srcDoc={html}
        className="min-h-[900px] w-full rounded-lg border-0 bg-white"
      />
    </main>
  );
}