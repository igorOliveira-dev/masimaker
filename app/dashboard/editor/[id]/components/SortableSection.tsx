"use client";

import { ChevronDown, ChevronRight, LayoutPanelTop } from "lucide-react";
import { faPen, faTrash, faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEditorStore, type SectionItem } from "@/app/stores/editorStore";
import ActionsMenu from "../../../components/ActionsMenu";
import ConfirmModal from "../../../components/ConfirmModal";
import { SortableTreeRow, EmptyTreeSlot, DropIndicator } from "./SortableTreeRow";
import { flattenSection, type Projection } from "@/app/stores/tree";

type Props = {
  section: SectionItem;
  index: number;
  isOpen: boolean;
  onToggleCollapse: () => void;
  isFolderCollapsed: (folderId: string) => boolean;
  onToggleFolder: (folderId: string) => void;
  onExpandFolder: (folderId: string) => void;
  // destino projetado do arraste em curso, quando ele aponta pra esta section
  dropProjection: Projection | null;
  // o nó arrastado e, se for pasta, tudo que ele carrega — some da contagem de linhas
  draggingIds: Set<string>;
  // uma section sendo arrastada vai parar logo acima desta
  showSectionIndicator: boolean;
};

export function SortableSection({
  section,
  index,
  isOpen,
  onToggleCollapse,
  isFolderCollapsed,
  onToggleFolder,
  onExpandFolder,
  dropProjection,
  draggingIds,
  showSectionIndicator,
}: Props) {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const removeSection = useEditorStore((s) => s.removeSection);
  const addFolder = useEditorStore((s) => s.addFolder);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const rows = flattenSection(section, isFolderCollapsed);

  // a projeção conta índices na lista sem o item arrastado, mas a lista renderizada
  // continua com ele (só esmaecido) — converte pra posição visual, isto é: acima de
  // qual linha renderizada a marca deve aparecer (rows.length = depois da última)
  const indicatorRow = (() => {
    if (!dropProjection) return null;
    let seen = 0;
    for (let i = 0; i < rows.length; i++) {
      if (seen === dropProjection.insertionIndex) return i;
      if (!draggingIds.has(rows[i].id)) seen++;
    }
    return rows.length;
  })();

  const { ref, isDragging } = useSortable({
    id: section.id,
    index,
    type: "section",
    accept: "section",
    // igual às linhas da árvore: nada se move sozinho durante o arraste. E é
    // obrigatório aqui — os plugins de um sortable são registrados no manager inteiro,
    // então bastava esta section trazer o OptimisticSortingPlugin pra ele voltar a
    // reordenar também as linhas da árvore, por mais que elas peçam `plugins: []`.
    plugins: [],
  });

  const isSectionSelected = selectedSectionId === section.id && !selectedComponentId;

  return (
    <div ref={ref} className={`relative flex flex-col ${isDragging ? "opacity-50" : ""}`}>
      <DropIndicator depth={showSectionIndicator ? 0 : null} />

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
              { label: "New folder", icon: faFolderPlus, onClick: () => addFolder(section.id) },
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
        <div className="relative flex flex-col ml-6 border-l border-(--foreground)/10 pl-2">
          {rows.length === 0 ? (
            <EmptyTreeSlot sectionId={section.id} isDropTargetHint={indicatorRow !== null} />
          ) : (
            rows.map((row, rowIndex) => (
              <SortableTreeRow
                key={row.id}
                row={row}
                index={rowIndex}
                sectionId={section.id}
                isCollapsed={isFolderCollapsed(row.id)}
                onToggleCollapse={() => onToggleFolder(row.id)}
                onExpandFolder={onExpandFolder}
                indicatorDepth={indicatorRow === rowIndex ? (dropProjection?.depth ?? 0) : null}
              />
            ))
          )}

          {/* posição "depois da última linha" — sempre montada, igual às outras */}
          <div className="relative h-0">
            <DropIndicator depth={indicatorRow === rows.length && rows.length > 0 ? (dropProjection?.depth ?? 0) : null} />
          </div>
        </div>
      )}
    </div>
  );
}
