"use client";

import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEditorStore, type ComponentItem } from "@/app/stores/editorStore";
import { componentRegistry, isContainer } from "../blocks";
import ActionsMenu from "../../../components/ActionsMenu";
import ConfirmModal from "../../../components/ConfirmModal";

export function groupKey(sectionId: string, parentComponentId: string | null) {
  return `${sectionId}::${parentComponentId ?? "root"}`;
}

type Props = {
  component: ComponentItem;
  index: number;
  sectionId: string;
  parentComponentId: string | null;
  depth: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

export function SortableComponent({
  component,
  index,
  sectionId,
  parentComponentId,
  depth,
  isCollapsed,
  onToggleCollapse,
}: Props) {
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const removeComponent = useEditorStore((s) => s.removeComponent);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { ref, isDragging } = useSortable({
    id: component.id,
    index,
    group: groupKey(sectionId, parentComponentId),
    type: "component",
    accept: "component",
  });

  const def = componentRegistry[component.type as keyof typeof componentRegistry];
  const isSelected = selectedComponentId === component.id;
  const container = isContainer(component.type);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(sectionId, component.id);
      }}
      style={{ marginLeft: depth * 16 }}
      className={`group flex items-center gap-2 h-7 px-1 rounded cursor-pointer transition-colors ${
        isSelected ? "bg-(--foreground)/15" : "hover:bg-(--foreground)/10"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      {container ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="cursor-pointer flex items-center justify-center w-4 h-4 shrink-0"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </button>
      ) : null}
      {def?.icon ? <def.icon size={13} className="shrink-0 opacity-70" /> : null}
      <span className="text-xs truncate flex-1">{def?.label ?? component.type}</span>
      <div
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <ActionsMenu
          options={[
            { label: "Edit", icon: faPen, onClick: () => selectComponent(sectionId, component.id) },
            { label: "Delete", icon: faTrash, danger: true, onClick: () => setIsDeleteModalOpen(true) },
          ]}
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => removeComponent(sectionId, component.id)}
        title="Delete component"
        description={`Are you sure you want to delete "${def?.label ?? component.type}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

export function EmptyContainerSlot({
  sectionId,
  parentComponentId,
  depth,
}: {
  sectionId: string;
  parentComponentId: string;
  depth: number;
}) {
  const { ref } = useSortable({
    id: `empty-${parentComponentId}`,
    index: 0,
    group: groupKey(sectionId, parentComponentId),
    type: "component",
    accept: "component",
  });

  return (
    <div
      ref={ref}
      style={{ marginLeft: depth * 16 }}
      className="text-xs text-(--foreground)/30 py-1 px-2 border border-dashed border-(--foreground)/10 rounded"
    >
      Drop here
    </div>
  );
}
