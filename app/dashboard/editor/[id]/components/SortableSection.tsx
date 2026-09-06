"use client";

import { ChevronDown, ChevronRight, LayoutPanelTop } from "lucide-react";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEditorStore, type SectionItem, type ComponentItem } from "@/app/stores/editorStore";
import ActionsMenu from "../../../components/ActionsMenu";
import ConfirmModal from "../../../components/ConfirmModal";
import { SortableComponent } from "./SortableComponent";

type Row = { component: ComponentItem; parentComponentId: string | null; index: number; depth: number };

function flattenComponents(components: ComponentItem[], rows: Row[]) {
  const siblings = components
    .filter((c) => c.parentComponentId === null)
    .sort((a, b) => a.position - b.position);

  siblings.forEach((component, index) => {
    rows.push({ component, parentComponentId: null, index, depth: 0 });
  });
}

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const rows: Row[] = [];
  flattenComponents(section.components, rows);

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

        <span className="text-sm truncate flex-1">{section.name || `Section ${index + 1}`}</span>

        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <ActionsMenu
            options={[
              { label: "Edit", icon: faPen, onClick: () => selectSection(section.id) },
              { label: "Delete", icon: faTrash, danger: true, onClick: () => setIsDeleteModalOpen(true) },
            ]}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => removeSection(section.id)}
        title="Delete section"
        description={`Are you sure you want to delete "${section.name || `Section ${index + 1}`}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />

      {isOpen && (
        <div className="flex flex-col ml-6 border-l border-(--foreground)/10 pl-2">
          {rows.length === 0 ? (
            <p className="text-xs text-(--foreground)/30 py-1">Empty</p>
          ) : (
            rows.map((row) => (
              <SortableComponent
                key={row.component.id}
                component={row.component}
                index={row.index}
                sectionId={section.id}
                parentComponentId={row.parentComponentId}
                depth={row.depth}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
