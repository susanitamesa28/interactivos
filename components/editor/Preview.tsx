"use client";

import { Block, Tab } from "@/types/interactive";
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
  if (
    !block ||
    typeof block.data !== "object" ||
    !block.data?.src
  ) {
    return (
      <div className="rounded-lg border border-dashed border-gray-600 bg-gray-50 p-3 text-sm text-gray-600">
        Agrega una URL de imagen en el panel de edición.
      </div>
    );
  }

  return <ImageBlock block={block} secondaryColor={secondaryColor} />;

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
console.log("Preview:", { activeTab, totalTabs: tabs.length, currentTabTitle: currentTab?.title });
  return (
   <div
  className="overflow-hidden rounded-xl bg-white shadow"
  style={{ borderColor: colors.secondary, borderWidth: "1px" }}
>
  <div className="p-6 text-white" style={{ backgroundColor: colors.primary }}>
        <h2 className="text-2xl font-bold">
          {title || "Título del módulo"}
        </h2>

        <p className="mt-2">
          {description || "Descripción del módulo"}
        </p>
      </div>

      <div className="p-6">
        

        {currentTab?.blocks?.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed bg-gray600 p-4 text-sm text-gray-500">
            Esta pestaña no tiene contenido todavía.
          </div>
        )}

        <div className="mt-6 space-y-4">
          {currentTab?.blocks?.map((block) => (
            <div key={block.id}>
              {renderBlock(block, colors.primary, colors.secondary)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}