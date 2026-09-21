import { Dispatch, SetStateAction } from "react";
import { Tab, Block } from "@/types/interactive";
import Properties from "./Properties";
import TabManager from "./TabManager";
import BlockManager from "./BlockManager";

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
}: RightPanelProps) {
  const currentBlocks = tabs[activeTab]?.blocks || [];

  function setCurrentBlocks(blocks: Block[]) {
    const updatedTabs = tabs.map((tab, index) =>
      index === activeTab ? { ...tab, blocks } : tab
    );

    setTabs(updatedTabs);
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
        setBlocks={setCurrentBlocks}
      />
    </aside>
  );
}