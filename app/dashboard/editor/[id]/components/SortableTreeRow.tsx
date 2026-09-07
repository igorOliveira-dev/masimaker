"use client";

import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { faPen, faTrash, faFolderPlus, faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEditorStore } from "@/app/stores/editorStore";
import { componentRegistry } from "../blocks";
import ActionsMenu from "../../../components/ActionsMenu";
import ConfirmModal from "../../../components/ConfirmModal";
import { INDENT_WIDTH, type TreeRow } from "@/app/stores/tree";

// toda a árvore de uma section é uma lista plana única: pastas e componentes são o
// mesmo tipo de nó arrastável, e o nível de aninhamento vem do quanto o usuário
// arrasta pro lado (ver projectDrop). É o que deixa pasta e componente se
// intercalarem livremente, como camadas e grupos no Photoshop.
export function treeGroupKey(sectionId: string) {
  return `tree::${sectionId}`;
}

export function parseTreeGroupKey(group: string) {
  return group.slice("tree::".length);
}

type Props = {
  row: TreeRow;
  index: number;
  sectionId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onExpandFolder: (folderId: string) => void;
  // nível da linha indicadora quando ela cai logo acima desta linha; null = escondida
  indicatorDepth: number | null;
};

export function SortableTreeRow({
  row,
  index,
  sectionId,
  isCollapsed,
  onToggleCollapse,
  onExpandFolder,
  indicatorDepth,
}: Props) {
  const { ref, isDragging } = useSortable({
    id: row.id,
    index,
    group: treeGroupKey(sectionId),
    type: "node",
    accept: "node",
    transition: null,
    // sem plugins: o reordenamento otimista do dnd-kit troca as linhas de lugar durante
    // o arraste como se a lista fosse plana, o que não sabe distinguir "acima da pasta"
    // de "dentro da pasta". Aqui nada se mexe até soltar — quem mostra o destino é a
    // linha indicadora, que já leva o nível de aninhamento em conta.
    plugins: [],
  });

  return (
    <div ref={ref} className={`relative ${isDragging ? "opacity-40" : ""}`}>
      <DropIndicator depth={indicatorDepth} />

      {/* linhas verticais de escopo: uma por nível de pasta acima desta linha */}
      {Array.from({ length: row.depth }, (_, level) => (
        <span
          key={level}
          aria-hidden
          className="absolute top-0 bottom-0 w-px bg-(--foreground)/15"
          // alinhada com o centro do chevron da pasta daquele nível
          style={{ left: level * INDENT_WIDTH + 11 }}
        />
      ))}

      {row.kind === "folder" ? (
        <FolderRow
          row={row}
          sectionId={sectionId}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onExpandFolder={onExpandFolder}
        />
      ) : (
        <ComponentRow row={row} sectionId={sectionId} />
      )}
    </div>
  );
}

function FolderRow({
  row,
  sectionId,
  isCollapsed,
  onToggleCollapse,
  onExpandFolder,
}: {
  row: Extract<TreeRow, { kind: "folder" }>;
  sectionId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onExpandFolder: (folderId: string) => void;
}) {
  const renameFolder = useEditorStore((s) => s.renameFolder);
  const removeFolder = useEditorStore((s) => s.removeFolder);
  const addFolder = useEditorStore((s) => s.addFolder);
  const sections = useEditorStore((s) => s.sections);

  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(row.folder.name);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteContents, setDeleteContents] = useState(false);

  const section = sections.find((s) => s.id === sectionId);
  const isEmpty = !section
    ? true
    : !section.folders.some((f) => f.parentFolderId === row.id) &&
      !section.components.some((c) => c.folderId === row.id);

  function commitRename() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== row.folder.name) renameFolder(sectionId, row.id, trimmed);
    setIsRenaming(false);
  }

  return (
    <>
      <div
        style={{ marginLeft: row.depth * INDENT_WIDTH }}
        onClick={onToggleCollapse}
        className="group flex items-center gap-1 h-7 px-1 rounded cursor-pointer transition-colors hover:bg-(--foreground)/10"
      >
        <span className="flex items-center justify-center w-4 h-4 shrink-0">
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </span>

        {isCollapsed ? (
          <Folder size={13} className="shrink-0 opacity-70" />
        ) : (
          <FolderOpen size={13} className="shrink-0 opacity-70" />
        )}

        {isRenaming ? (
          <input
            autoFocus
            value={nameDraft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setNameDraft(row.folder.name);
                setIsRenaming(false);
              }
            }}
            className="text-xs flex-1 min-w-0 bg-transparent border-b border-(--foreground)/30 outline-none"
          />
        ) : (
          <span
            className="text-xs truncate flex-1"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setNameDraft(row.folder.name);
              setIsRenaming(true);
            }}
          >
            {row.folder.name}
          </span>
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <ActionsMenu
            options={[
              {
                label: "New folder inside",
                icon: faFolderPlus,
                onClick: () => {
                  onExpandFolder(row.id);
                  addFolder(sectionId, row.id);
                },
              },
              {
                label: "Rename",
                icon: faPen,
                onClick: () => {
                  setNameDraft(row.folder.name);
                  setIsRenaming(true);
                },
              },
              ...(isEmpty
                ? []
                : [
                    {
                      label: "Ungroup",
                      icon: faArrowUpFromBracket,
                      onClick: () => removeFolder(sectionId, row.id),
                    },
                  ]),
              { label: "Delete", icon: faTrash, danger: true, onClick: () => setIsDeleteModalOpen(true) },
            ]}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => removeFolder(sectionId, row.id, { deleteContents })}
        title="Delete folder"
        description={
          <span className="flex flex-col gap-3">
            <span>
              {isEmpty
                ? `Are you sure you want to delete "${row.folder.name}"?`
                : `"${row.folder.name}" is not empty. Its contents move up one level unless you delete them too.`}
            </span>
            {!isEmpty && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteContents}
                  onChange={(e) => setDeleteContents(e.target.checked)}
                />
                <span>Also delete everything inside this folder</span>
              </label>
            )}
          </span>
        }
        confirmLabel="Delete"
        danger
      />
    </>
  );
}

function ComponentRow({
  row,
  sectionId,
}: {
  row: Extract<TreeRow, { kind: "component" }>;
  sectionId: string;
}) {
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const removeComponent = useEditorStore((s) => s.removeComponent);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const def = componentRegistry[row.component.type as keyof typeof componentRegistry];
  const isSelected = selectedComponentId === row.id;
  const label = def?.label ?? row.component.type;

  return (
    <>
      <div
        style={{ marginLeft: row.depth * INDENT_WIDTH }}
        onClick={(e) => {
          e.stopPropagation();
          selectComponent(sectionId, row.id);
        }}
        className={`group flex items-center gap-2 h-7 px-1 rounded cursor-pointer transition-colors ${
          isSelected ? "bg-(--foreground)/15" : "hover:bg-(--foreground)/10"
        }`}
      >
        {def?.icon ? <def.icon size={13} className="shrink-0 opacity-70" /> : null}
        <span className="text-xs truncate flex-1">{label}</span>
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <ActionsMenu
            options={[
              { label: "Edit", icon: faPen, onClick: () => selectComponent(sectionId, row.id) },
              { label: "Delete", icon: faTrash, danger: true, onClick: () => setIsDeleteModalOpen(true) },
            ]}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => removeComponent(sectionId, row.id)}
        title="Delete component"
        description={`Are you sure you want to delete "${label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}

// Mostra onde o item vai cair, já no nível de aninhamento projetado.
//
// Fica sempre montado e só muda de posição/opacidade: montar e desmontar um nó entre
// as linhas no meio do arraste briga com o dnd-kit, que também mexe no DOM — o React
// perde a referência e estoura "Child to insert before is not a child of this node".
// Marca o topo da linha em que está montado. Nunca é montado nem desmontado durante o
// arraste (só muda de opacidade): mexer na estrutura do DOM no meio do gesto briga com
// o dnd-kit, que também mexe, e estoura "Child to insert before is not a child".
// Também não depende de medir posição em pixels — ele vive exatamente onde vai cair.
export function DropIndicator({ depth }: { depth: number | null }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-px right-0 z-10 h-0.5 rounded-full bg-(--purple)"
      style={{ opacity: depth === null ? 0 : 1, left: (depth ?? 0) * INDENT_WIDTH }}
    />
  );
}

// única linha "fantasma" do sistema: uma section vazia não tem nenhuma linha real com
// que colidir, então sem isso não haveria como arrastar nada pra dentro dela
export function EmptyTreeSlot({
  sectionId,
  isDropTargetHint,
}: {
  sectionId: string;
  isDropTargetHint: boolean;
}) {
  const { ref } = useSortable({
    id: `empty-${sectionId}`,
    index: 0,
    group: treeGroupKey(sectionId),
    type: "node",
    accept: "node",
    disabled: { draggable: true },
    transition: null,
    plugins: [],
  });

  return (
    <div
      ref={ref}
      className={`text-xs py-1 px-2 rounded border border-dashed transition-colors ${
        isDropTargetHint
          ? "border-(--purple) bg-(--purple)/10 text-(--foreground)/60"
          : "border-transparent text-(--foreground)/30"
      }`}
    >
      Empty
    </div>
  );
}
