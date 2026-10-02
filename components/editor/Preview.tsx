"use client";

import type { Block, Tab } from "@/types/interactive";

import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import ButtonBlock from "./blocks/ButtonBlock";
import VideoBlock from "./blocks/VideoBlock";

interface PreviewProps {
  title: string;
  description: string;
  tabs: Tab[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  theme: "default" | "unibe" | "unphu" | "rosario";
}

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

function renderBlock(
  block: Block,
  primaryColor: string,
  secondaryColor: string
) {
  switch (block.type) {
    case "text":
      return (
        <TextBlock
          block={block}
          secondaryColor={secondaryColor}
        />
      );

    case "image":
      if (!block.data.src.trim()) {
        return (
          <div className="rounded-lg border border-dashed border-gray-600 bg-gray-50 p-3 text-sm text-gray-600">
            Agrega una URL de imagen en el panel de edición.
          </div>
        );
      }

      return <ImageBlock block={block} />;

    case "button":
      return (
        <ButtonBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      );

    case "video":
      return (
        <VideoBlock
          block={block}
          secondaryColor={secondaryColor}
        />
      );

    default:
      return null;
  }
}

export default function Preview({
  title,
  description,
  tabs,
  activeTab,
  setActiveTab,
  theme,
}: PreviewProps) {
  const currentTab = tabs[activeTab];
  const colors = themeColors[theme];

  return (
    <div
      className="overflow-hidden rounded-xl bg-white shadow"
      style={{
        borderColor: colors.secondary,
        borderWidth: "1px",
      }}
    >
      <div
        className="p-6 text-white"
        style={{ backgroundColor: colors.primary }}
      >
        <h2 className="text-2xl font-bold">
          {title || "Título del módulo"}
        </h2>

        <p className="mt-2">
          {description || "Descripción del módulo"}
        </p>
      </div>

      <div className="p-6">
        {tabs.length > 0 && (
          <div
            className="mb-6 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Pestañas del interactivo"
          >
            {tabs.map((tab, index) => {
              const isActive = index === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(index)}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold transition"
                  style={{
                    borderColor: colors.secondary,
                    backgroundColor: isActive
                      ? colors.primary
                      : "white",
                    color: isActive
                      ? "white"
                      : colors.primary,
                  }}
                >
                  {tab.title || `Pestaña ${index + 1}`}
                </button>
              );
            })}
          </div>
        )}

        {!currentTab && (
          <div className="rounded-xl border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
            Crea una pestaña para comenzar.
          </div>
        )}

        {currentTab && currentTab.blocks.length === 0 && (
          <div className="rounded-xl border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
            Esta pestaña no tiene contenido todavía.
          </div>
        )}

        <div className="space-y-4">
          {currentTab?.blocks.map((block) => (
            <div key={block.id}>
              {renderBlock(
                block,
                colors.primary,
                colors.secondary
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}