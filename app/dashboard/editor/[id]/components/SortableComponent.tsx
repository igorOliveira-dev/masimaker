"use client";

import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEditorStore, type ComponentItem } from "@/app/stores/editorStore";
import { componentRegistry } from "../blocks";
import ActionsMenu from "../../../components/ActionsMenu";

type Props = {
  component: ComponentItem;
  index: number;
  sectionId: string;
};

export function SortableComponent({ component, index, sectionId }: Props) {
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const removeComponent = useEditorStore((s) => s.removeComponent);

  const { ref, isDragging } = useSortable({
    id: component.id,
    index,
    group: sectionId,
    type: "component",
    accept: "component",
  });

  const def = componentRegistry[component.type as keyof typeof componentRegistry];
  const isSelected = selectedComponentId === component.id;

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(sectionId, component.id);
      }}
      className={`group flex items-center gap-2 h-7 px-1 rounded cursor-pointer transition-colors ${
        isSelected ? "bg-(--foreground)/15" : "hover:bg-(--foreground)/10"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      {def?.icon ? <def.icon size={13} className="shrink-0 opacity-70" /> : null}
      <span className="text-xs truncate flex-1">{def?.label ?? component.type}</span>
      <div
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <ActionsMenu
          options={[
            { label: "Edit", icon: faPen, onClick: () => selectComponent(sectionId, component.id) },
            { label: "Delete", icon: faTrash, danger: true, onClick: () => removeComponent(sectionId, component.id) },
          ]}
        />
      </div>
    </div>
  );
}
