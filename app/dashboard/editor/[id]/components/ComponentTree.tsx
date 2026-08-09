"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useEditorStore } from "@/app/stores/editorStore";
import { SortableSection } from "./SortableSection";

const ComponentTree = () => {
  const sections = useEditorStore((s) => s.sections);
  const addSection = useEditorStore((s) => s.addSection);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const moveComponent = useEditorStore((s) => s.moveComponent);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleCollapse(sectionId: string) {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = ({ operation, canceled }) => {
    if (canceled) return;
    const { source } = operation;
    if (!isSortable(source)) return;

    if (source.type === "section") {
      const { initialIndex, index } = source;
      reorderSections(initialIndex, index);
      return;
    }

    if (source.type === "component") {
      const { group, initialGroup, index, initialIndex } = source as typeof source & {
        group: string;
        initialGroup: string;
      };
      moveComponent({
        fromSectionId: initialGroup,
        toSectionId: group,
        fromIndex: initialIndex,
        toIndex: index,
      });
    }
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col">
        <p className="px-2 text-sm">Structure</p>
        <p className="text-xs text-(--foreground)/40 px-2 py-3">No sections yet.</p>
        <button
          onClick={() => addSection()}
          className="cursor-pointer p-2 flex gap-2 items-center justify-center text-sm bg-(--foreground)/10 mx-2 rounded hover:opacity-80 transition-opacity"
        >
          <Plus size={18} />
          <span>Create first section</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm">Structure</p>
        <button
          onClick={() => addSection()}
          className="cursor-pointer flex px-2 py-0.5 gap-2 items-center justify-center text-sm bg-(--foreground)/10 mx-2 rounded hover:opacity-80 transition-opacity"
        >
          + section
        </button>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        {sections.map((section, sectionIndex) => (
          <SortableSection
            key={section.id}
            section={section}
            index={sectionIndex}
            isOpen={!collapsed[section.id]}
            onToggleCollapse={() => toggleCollapse(section.id)}
          />
        ))}
      </DragDropProvider>
    </div>
  );
};

export default ComponentTree;
