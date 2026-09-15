"use client";

import { Tab } from "@/types/interactive";

interface TabsBlockProps {
  title: string;
  description: string;
  tabs: Tab[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function TabsBlock({
  title,
  description,
  tabs,
  activeTab,
  setActiveTab,
  primaryColor,
  secondaryColor,
}: TabsBlockProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: "#111827" }}
      >
        {title}
      </h2>

      {description && (
        <p
          className="mb-6"
          style={{ color: "#374151" }}
        >
          {description}
        </p>
      )}

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(index)}
              className="border-b-2 px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: isActive ? primaryColor : "transparent",
                color: isActive ? primaryColor : "#374151",
                outlineColor: secondaryColor,
              }}
            >
              {tab.title}
            </button>
          );
        })}
      </div>

      <div>{tabs[activeTab]?.content}</div>
    </div>
  );
}