"use client";

import { componentList } from "../blocks/index";
import { useEditorStore } from "@/app/stores/editorStore";

const ComponentPalette = () => {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const addComponent = useEditorStore((s) => s.addComponent);

  function handleAddComponent(def: (typeof componentList)[number]) {
    if (!selectedSectionId) return;
    addComponent(def, selectedSectionId);
  }

  return (
    <div className="flex flex-col">
      <p className="px-2 pt-3">Components</p>
      {!selectedSectionId && (
        <p className="px-2 pb-1 text-xs text-(--foreground)/40">Select a section to add components.</p>
      )}
      {componentList.map((def) => (
        <button
          key={def.type}
          disabled={!selectedSectionId}
          onClick={() => handleAddComponent(def)}
          className="flex items-center justify-between gap-1 h-10 m-2 p-2 rounded border-2 border-(--foreground)/10 hover:opacity-80 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>{def.label}</span>
          <def.icon size={20} />
        </button>
      ))}
    </div>
  );
};

export default ComponentPalette;
