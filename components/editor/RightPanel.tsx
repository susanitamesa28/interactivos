"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type { Tab, Block } from "@/types/interactive";
import Properties from "./Properties";
import TabManager from "./TabManager";
import BlockManager from "./BlockManager";

type ImageField =
  | "src"
  | "alt"
  | "size"
  | "alignment"
  | "fit";

interface RightPanelProps {
  title: string;
  description: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  tabs: Tab[];
  activeTab: number;
  setTabs: Dispatch<SetStateAction<Tab[]>>;
  setActiveTab: (index: number) => void;
  addTab: () => void;

  onUpdateImageBlock: (
    blockId: string,
    field: ImageField,
    value: string
  ) => void;
}

export default function RightPanel({
  title,
  description,
  setTitle,
  setDescription,
  tabs,
  activeTab,
  setTabs,
  setActiveTab,
  addTab,
  onUpdateImageBlock,
}: RightPanelProps) {
  const currentBlocks =
    tabs[activeTab]?.blocks ?? [];

  function setCurrentBlocks(nextBlocks: Block[]) {
    setTabs((currentTabs) =>
      currentTabs.map((tab, index) =>
        index === activeTab
          ? {
              ...tab,
              blocks: nextBlocks,
            }
          : tab
      )
    );
  }

  function handleAddBlock(block: Block) {
    setCurrentBlocks([
      ...currentBlocks,
      block,
    ]);
  }

  function handleRemoveBlock(blockId: string) {
    setCurrentBlocks(
      currentBlocks.filter(
        (block) => block.id !== blockId
      )
    );
  }

  function handleMoveBlock(
    blockId: string,
    direction: "up" | "down"
  ) {
    const currentIndex = currentBlocks.findIndex(
      (block) => block.id === blockId
    );

    if (currentIndex === -1) return;

    const nextIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      nextIndex < 0 ||
      nextIndex >= currentBlocks.length
    ) {
      return;
    }

    const reorderedBlocks = [...currentBlocks];

    const currentBlock =
      reorderedBlocks[currentIndex];

    reorderedBlocks[currentIndex] =
      reorderedBlocks[nextIndex];

    reorderedBlocks[nextIndex] = currentBlock;

    setCurrentBlocks(reorderedBlocks);
  }

  function handleUpdateBlock(
    blockId: string,
    value: string
  ) {
    setCurrentBlocks(
      currentBlocks.map((block) => {
        if (
          block.id !== blockId ||
          block.type !== "text" &&
          block.type !== "video"
        ) {
          return block;
        }

        if (block.type === "text") {
          return {
            ...block,
            data: value,
          };
        }

        return {
          ...block,
          data: {
            ...block.data,
            src: value,
          },
        };
      })
    );
  }

  function handleUpdateButtonBlock(
    blockId: string,
    field: "label" | "url",
    value: string
  ) {
    setCurrentBlocks(
      currentBlocks.map((block) => {
        if (
          block.id !== blockId ||
          block.type !== "button"
        ) {
          return block;
        }

        return {
          ...block,
          data: {
            ...block.data,
            [field]: value,
          },
        };
      })
    );
  }

  return (
    <aside className="w-full min-w-0 shrink-0 border-t bg-white p-4 sm:p-6 lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0">
      <Properties
        title={title}
        description={description}
        setTitle={setTitle}
        setDescription={setDescription}
      />

      <div className="my-4 border-t" />

      <TabManager
        tabs={tabs}
        activeTab={activeTab}
        setTabs={setTabs}
        setActiveTab={setActiveTab}
        addTab={addTab}
      />

      <div className="my-4 border-t" />

      <BlockManager
        blocks={currentBlocks}
        onUpdateBlock={handleUpdateBlock}
        onUpdateImageBlock={onUpdateImageBlock}
        onAddBlock={handleAddBlock}
        onRemoveBlock={handleRemoveBlock}
        onMoveBlock={handleMoveBlock}
        onUpdateButtonBlock={
          handleUpdateButtonBlock
        }
      />
    </aside>
  );
}