"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useEditorStore, type SectionItem } from "@/app/stores/editorStore";
import { isContainer } from "../blocks";
import { SortableSection } from "./SortableSection";

function findComponentById(sections: SectionItem[], id: string) {
  for (const section of sections) {
    const found = section.components.find((c) => c.id === id);
    if (found) return found;
  }
  return null;
}

const ComponentTree = () => {
  const sections = useEditorStore((s) => s.sections);
  const addSection = useEditorStore((s) => s.addSection);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const moveComponentTo = useEditorStore((s) => s.moveComponentTo);
  const snapshotHistory = useEditorStore((s) => s.snapshotHistory);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [collapsedComponents, setCollapsedComponents] = useState<Record<string, boolean>>({});

  // enquanto o cursor ainda está sobre a linha do container que acabou de ser expandido
  // (por estar colapsado), segura a reordenação — só libera quando o alvo muda pra
  // outra coisa, ou seja, quando o cursor realmente passa por cima do container
  const pendingExpandContainerRef = useRef<string | null>(null);

  function toggleCollapse(sectionId: string) {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = ({ operation }) => {
    if (isSortable(operation.source)) snapshotHistory();
  };

  const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = ({ operation }) => {
    const { source, target } = operation;
    if (!isSortable(source) || source.type !== "component") return;

    if (isSortable(target) && target.type === "component") {
      const targetId = target.id as string;
      const found = targetId.startsWith("empty-") ? null : findComponentById(sections, targetId);

      if (found && isContainer(found.type)) {
        if (collapsedComponents[found.id]) {
          pendingExpandContainerRef.current = found.id;
          setCollapsedComponents((prev) => ({ ...prev, [found.id]: false }));
          return;
        }
        if (pendingExpandContainerRef.current === found.id) {
          return;
        }
      }
    }

    pendingExpandContainerRef.current = null;

    const { group, index } = source as typeof source & { group: string };
    const [toSectionId, parentKey] = group.split("::");
    const toParentComponentId = parentKey === "root" ? null : parentKey;
    moveComponentTo(source.id as string, toSectionId, toParentComponentId, index);
  };

  const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = ({ operation, canceled }) => {
    if (canceled) return;
    const { source } = operation;
    if (!isSortable(source)) return;

    if (source.type === "section") {
      const { initialIndex, index } = source;
      reorderSections(initialIndex, index);
    }
    // componentes já foram movidos em tempo real pelo onDragOver — nada a fazer aqui
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
      <div className="sticky top-0 z-10 bg-(--background-secondary) flex items-center justify-between mb-3 py-1">
        <p className="text-sm">Structure</p>
        <button
          onClick={() => addSection()}
          className="cursor-pointer flex px-2 py-0.5 gap-2 items-center justify-center text-sm bg-(--foreground)/10 mx-2 rounded hover:opacity-80 transition-opacity"
        >
          + section
        </button>
      </div>

      <DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        {sections.map((section, sectionIndex) => (
          <SortableSection
            key={section.id}
            section={section}
            index={sectionIndex}
            isOpen={!collapsed[section.id]}
            onToggleCollapse={() => toggleCollapse(section.id)}
            collapsedComponents={collapsedComponents}
            setCollapsedComponents={setCollapsedComponents}
          />
        ))}
      </DragDropProvider>
    </div>
  );
};

export default ComponentTree;
