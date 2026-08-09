"use client";

import { ChevronDown, ChevronRight, LayoutPanelTop } from "lucide-react";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEditorStore, type SectionItem } from "@/app/stores/editorStore";
import { componentRegistry } from "../blocks";
import ActionsMenu from "../../../components/ActionsMenu";
import { SortableComponent } from "./SortableComponent";

type Props = {
  section: SectionItem;
  index: number;
  isOpen: boolean;
  onToggleCollapse: () => void;
};

export function SortableSection({ section, index, isOpen, onToggleCollapse }: Props) {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const removeSection = useEditorStore((s) => s.removeSection);

  const { ref, isDragging } = useSortable({
    id: section.id,
    index,
    type: "section",
    accept: "section",
  });

  const isSectionSelected = selectedSectionId === section.id && !selectedComponentId;

  return (
    <div ref={ref} className={`flex flex-col ${isDragging ? "opacity-50" : ""}`}>
      <div
        className={`group flex items-center gap-1 h-8 px-1 rounded cursor-pointer transition-colors ${
          isSectionSelected ? "bg-(--foreground)/15" : "hover:bg-(--foreground)/10"
        }`}
        onClick={() => selectSection(section.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="cursor-pointer flex items-center justify-center w-4 h-4 shrink-0"
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <LayoutPanelTop size={14} className="shrink-0 opacity-70" />

        <span className="text-sm truncate flex-1">Section {index + 1}</span>

        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <ActionsMenu
            options={[
              { label: "Edit", icon: faPen, onClick: () => selectSection(section.id) },
              { label: "Delete", icon: faTrash, danger: true, onClick: () => removeSection(section.id) },
            ]}
          />
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col ml-6 border-l border-(--foreground)/10 pl-2">
          {section.components.length === 0 ? (
            <p className="text-xs text-(--foreground)/30 py-1">Empty</p>
          ) : (
            section.components.map((component, componentIndex) => (
              <SortableComponent
                key={component.id}
                component={component}
                index={componentIndex}
                sectionId={section.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
