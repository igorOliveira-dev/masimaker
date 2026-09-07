"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useEditorStore } from "@/app/stores/editorStore";
import { useTreeDragStore } from "@/app/stores/treeDragStore";
import { SortableSection } from "./SortableSection";
import { parseTreeGroupKey, DropIndicator } from "./SortableTreeRow";
import { flattenSection, projectDrop, subtreeOf, type Projection, type TreeRow } from "@/app/stores/tree";

// o que o arraste em curso precisa saber e que não vale um re-render a cada frame —
// mora num ref; o que a tela mostra (linha indicadora) mora no useTreeDragStore
type DragRef = {
  nodeId: string;
  draggedIds: Set<string>;
  // a árvore congelada no início do arraste: como nada se move até soltar, ela
  // continua válida do começo ao fim do gesto
  rows: Record<string, TreeRow[]>;
  projection: Projection | null;
  toSectionId: string | null;
};

// o cursor está na metade de baixo da linha alvo? (aí a inserção vai depois dela —
// é o que faz "soltar em cima da pasta" virar "entrar na pasta")
function isBelowMiddle(
  operation: { shape: { current: { center: { y: number } } } | null; position: { current: { y: number } } },
  target: { shape?: { center: { y: number } } | null; element?: Element | null },
) {
  const y = operation.shape?.current.center.y ?? operation.position.current.y;

  // shape é o caminho normal, mas ele nem sempre está calculado no primeiro frame —
  // sem o fallback, a metade de baixo nunca seria detectada e nada entraria em pasta
  const middle =
    target.shape?.center.y ??
    (target.element ? target.element.getBoundingClientRect().top + target.element.getBoundingClientRect().height / 2 : null);

  return middle === null ? false : y > middle;
}

const ComponentTree = () => {
  const sections = useEditorStore((s) => s.sections);
  const addSection = useEditorStore((s) => s.addSection);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const snapshotHistory = useEditorStore((s) => s.snapshotHistory);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // guarda quais pastas estão ABERTAS, não fechadas: assim o padrão ao carregar a
  // página já é tudo fechado, sem precisar sincronizar com as pastas que chegam do banco
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Nada é movido de verdade até soltar: durante o arraste o que muda é só a linha
  // indicadora, que vem do store externo (ver treeDragStore para o porquê).
  const dragRef = useRef<DragRef | null>(null);
  const sectionDragRef = useRef<{ fromIndex: number; toIndex: number } | null>(null);
  const draggedIds = useTreeDragStore((s) => s.draggedIds);
  const dropSectionId = useTreeDragStore((s) => s.toSectionId);
  const dropProjection = useTreeDragStore((s) => s.projection);
  const sectionDropIndex = useTreeDragStore((s) => s.sectionDropIndex);
  const autoCollapsedId = useTreeDragStore((s) => s.autoCollapsedId);

  // a pasta sendo arrastada anda fechada, pra deixar claro que ela leva o conteúdo junto
  const isFolderCollapsed = (folderId: string) => folderId === autoCollapsedId || !expandedFolders[folderId];

  function toggleCollapse(sectionId: string) {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  function toggleFolder(folderId: string) {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  }

  function expandFolder(folderId: string) {
    setExpandedFolders((prev) => (prev[folderId] ? prev : { ...prev, [folderId]: true }));
  }

  const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = ({ operation }) => {
    const { source } = operation;
    if (!isSortable(source)) return;

    if (source.type === "section") {
      sectionDragRef.current = { fromIndex: source.index, toIndex: source.index };
      useTreeDragStore.getState().beginSectionDrag(source.index);
      return;
    }
    if (source.type !== "node") return;

    const nodeId = source.id as string;
    const { sections: current } = useEditorStore.getState();

    // uma pasta viaja com tudo que está dentro dela: a subárvore inteira sai da conta
    // dos vizinhos, senão a pasta poderia ser projetada pra dentro de si mesma
    const holding = current.find((s) => s.folders.some((f) => f.id === nodeId));
    const subtree = holding ? subtreeOf(holding, nodeId) : null;
    const draggedIds = new Set<string>([nodeId, ...(subtree?.folderIds ?? []), ...(subtree?.componentIds ?? [])]);

    // o snapshot já enxerga a pasta arrastada fechada, que é como ela vai ser
    // renderizada durante o gesto — projeção e tela concordam do início ao fim
    const isFolder = Boolean(holding);
    const collapsedDuringDrag = (id: string) =>
      (isFolder && id === nodeId) || !expandedFolders[id];

    const rows: Record<string, TreeRow[]> = {};
    for (const section of current) rows[section.id] = flattenSection(section, collapsedDuringDrag);

    dragRef.current = { nodeId, draggedIds, rows, projection: null, toSectionId: null };
    useTreeDragStore.getState().beginDrag(draggedIds, isFolder ? nodeId : null);
  };

  // o dnd-kit não reordena mais nada sozinho (ver `plugins: []` em SortableTreeRow),
  // então o destino é derivado da linha sob o cursor: metade de cima insere antes dela,
  // metade de baixo insere depois — e o deslocamento horizontal escolhe o nível.
  // Ligado tanto no dragmove (todo movimento do cursor) quanto no dragover (quando o
  // alvo muda), pra não depender de um único evento.
  const updateProjection: React.ComponentProps<typeof DragDropProvider>["onDragMove"] = ({ operation }) => {
    const { source, target } = operation;
    if (!isSortable(source) || !target) return;

    // sections seguem a mesma regra, só que numa lista de um nível só
    if (source.type === "section" && sectionDragRef.current) {
      const sections = useEditorStore.getState().sections;
      const overIndex = sections.findIndex((section) => section.id === target.id);
      if (overIndex === -1) return;

      const toIndex = overIndex + (isBelowMiddle(operation, target) ? 1 : 0);
      sectionDragRef.current = { ...sectionDragRef.current, toIndex };
      useTreeDragStore.getState().setSectionDropIndex(toIndex);
      return;
    }

    const state = dragRef.current;
    if (!state || source.type !== "node") return;

    const group = (target as typeof target & { group?: string }).group;
    const toSectionId = typeof group === "string" ? parseTreeGroupKey(group) : null;
    if (!toSectionId) return;

    const rows = state.rows[toSectionId];
    if (!rows) return;

    const targetIndex = rows.findIndex((row) => row.id === target.id);
    // alvo é o slot de section vazia: só existe uma posição possível
    const insertionIndex =
      targetIndex === -1 ? 0 : targetIndex + (isBelowMiddle(operation, target) ? 1 : 0);

    const projection = projectDrop({
      rows,
      draggedId: state.nodeId,
      draggedSubtreeIds: state.draggedIds,
      insertionIndex,
      offsetX: operation.transform.x,
    });

    dragRef.current = { ...state, projection, toSectionId };
    useTreeDragStore.getState().setProjection(toSectionId, projection);
  };

  const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = ({ operation, canceled }) => {
    const { source } = operation;
    const state = dragRef.current;
    dragRef.current = null;
    useTreeDragStore.getState().endDrag();
    if (canceled) sectionDragRef.current = null;

    if (canceled || !isSortable(source)) return;

    if (source.type === "section") {
      const drag = sectionDragRef.current;
      sectionDragRef.current = null;
      if (!drag) return;

      // toIndex é medido na lista com a section ainda no lugar; ao remover a origem,
      // tudo que estava depois dela anda uma casa pra trás
      const toIndex = drag.toIndex > drag.fromIndex ? drag.toIndex - 1 : drag.toIndex;
      if (toIndex === drag.fromIndex) return;

      snapshotHistory();
      reorderSections(drag.fromIndex, toIndex);
      return;
    }

    if (source.type === "node" && state?.projection && state.toSectionId) {
      const { parentFolderId, index } = state.projection;
      snapshotHistory();
      useEditorStore.getState().moveNode(state.nodeId, state.toSectionId, parentFolderId, index);
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
      <div className="sticky top-0 z-10 bg-(--background-secondary) flex items-center justify-between mb-3 py-1">
        <p className="text-sm">Structure</p>
        <button
          onClick={() => addSection()}
          className="cursor-pointer flex px-2 py-0.5 gap-2 items-center justify-center text-sm bg-(--foreground)/10 mx-2 rounded hover:opacity-80 transition-opacity"
        >
          + section
        </button>
      </div>

      <DragDropProvider
        onDragStart={handleDragStart}
        onDragMove={updateProjection}
        onDragOver={updateProjection}
        onDragEnd={handleDragEnd}
      >
        {sections.map((section, sectionIndex) => (
          <SortableSection
            key={section.id}
            section={section}
            index={sectionIndex}
            isOpen={!collapsed[section.id]}
            onToggleCollapse={() => toggleCollapse(section.id)}
            isFolderCollapsed={isFolderCollapsed}
            onToggleFolder={toggleFolder}
            onExpandFolder={expandFolder}
            dropProjection={dropSectionId === section.id ? dropProjection : null}
            draggingIds={draggedIds}
            showSectionIndicator={sectionDropIndex === sectionIndex}
          />
        ))}

        {/* soltar depois da última section */}
        <div className="relative h-0">
          <DropIndicator depth={sectionDropIndex === sections.length ? 0 : null} />
        </div>
      </DragDropProvider>
    </div>
  );
};

export default ComponentTree;
