import type { ComponentItem, FolderItem, SectionItem } from "./editorStore";

// a pasta e tudo que vive dentro dela, em qualquer nível
export function subtreeOf(section: SectionItem, folderId: string) {
  const folderIds = new Set<string>([folderId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const folder of section.folders) {
      if (folder.parentFolderId && folderIds.has(folder.parentFolderId) && !folderIds.has(folder.id)) {
        folderIds.add(folder.id);
        grew = true;
      }
    }
  }

  const componentIds = new Set(
    section.components.filter((c) => c.folderId && folderIds.has(c.folderId)).map((c) => c.id),
  );

  return { folderIds, componentIds };
}

// filhos diretos de um escopo (raiz da section ou uma pasta) em ordem: pastas e
// componentes disputam o mesmo `position`, então a árvore tem uma ordem única
export function childrenOf(section: SectionItem, parentFolderId: string | null) {
  return [
    ...section.folders.filter((f) => f.parentFolderId === parentFolderId),
    ...section.components.filter((c) => c.folderId === parentFolderId && c.parentComponentId === null),
  ].sort((a, b) => a.position - b.position);
}

// `position` fracionário que coloca um nó exatamente entre dois irmãos do destino
export function positionBetween(
  section: SectionItem,
  parentFolderId: string | null,
  index: number,
  movingNodeId: string,
) {
  const siblings = childrenOf(section, parentFolderId).filter((node) => node.id !== movingNodeId);
  const before = siblings[Math.min(index, siblings.length) - 1];
  const after = siblings[Math.min(index, siblings.length)];

  if (before && after) return (before.position + after.position) / 2;
  if (before) return before.position + 0.5;
  if (after) return after.position - 0.5;
  return 0;
}

// renumera a section inteira percorrendo a árvore em profundidade, com um contador
// único compartilhado por pastas e componentes. Isso mantém duas coisas verdadeiras ao
// mesmo tempo: a ordem entre irmãos na Structure, e a ordem de empilhamento no canvas
// (que lê só os componentes de topo ordenados por `position`) — como no Photoshop, a
// ordem que se vê no painel é a ordem em que as coisas se sobrepõem.
export function reindexSection(section: SectionItem): SectionItem {
  const positions = new Map<string, number>();
  let counter = 0;

  function walk(parentFolderId: string | null) {
    for (const node of childrenOf(section, parentFolderId)) {
      positions.set(node.id, counter++);
      if ("parentFolderId" in node) walk(node.id);
    }
  }

  walk(null);

  return {
    ...section,
    folders: section.folders.map((f) => (positions.has(f.id) ? { ...f, position: positions.get(f.id)! } : f)),
    components: section.components.map((c) =>
      positions.has(c.id) ? { ...c, position: positions.get(c.id)! } : c,
    ),
  };
}


// largura de um nível de indentação na árvore, em px — é também a "unidade" que o
// arraste horizontal usa pra decidir em que nível o item vai cair
export const INDENT_WIDTH = 16;

export type TreeRow = {
  id: string;
  depth: number;
  parentFolderId: string | null;
} & ({ kind: "folder"; folder: FolderItem } | { kind: "component"; component: ComponentItem });

// achata a árvore da section na lista de linhas visíveis, na ordem em que aparecem na
// tela. Pastas recolhidas não expõem seus filhos — eles simplesmente não existem como
// alvo de drop, e cair "depois" de uma pasta recolhida em um nível mais fundo é o que
// significa entrar nela.
export function flattenSection(section: SectionItem, isCollapsed: (folderId: string) => boolean): TreeRow[] {
  const rows: TreeRow[] = [];

  function walk(parentFolderId: string | null, depth: number) {
    for (const child of childrenOf(section, parentFolderId)) {
      if ("parentFolderId" in child) {
        rows.push({ id: child.id, depth, parentFolderId, kind: "folder", folder: child });
        if (!isCollapsed(child.id)) walk(child.id, depth + 1);
      } else {
        rows.push({ id: child.id, depth, parentFolderId, kind: "component", component: child });
      }
    }
  }

  walk(null, 0);
  return rows;
}

export type Projection = {
  parentFolderId: string | null;
  index: number;
  depth: number;
  // posição da linha indicadora na lista visível (sem o item arrastado)
  insertionIndex: number;
};

/**
 * Traduz "entre quais linhas o cursor está" + "o quanto o usuário arrastou pro lado"
 * em um destino concreto na árvore (pasta-pai + índice entre os irmãos).
 *
 * É o mesmo modelo que Figma/Notion/VS Code usam: a lista é plana e o nível vem do
 * deslocamento horizontal, limitado pelos vizinhos — não dá pra ficar mais fundo que
 * "um nível dentro da linha de cima", nem mais raso que a linha de baixo (senão a linha
 * de baixo seria adotada por um pai que não é dela).
 *
 * O nível padrão (sem arrastar pro lado) é o mais fundo permitido: soltar logo abaixo
 * do cabeçalho de uma pasta entra nela, em vez de virar irmão dela. Pra tirar de dentro,
 * arrasta pra esquerda.
 */
export function projectDrop({
  rows,
  draggedId,
  draggedSubtreeIds,
  insertionIndex: rawInsertionIndex,
  offsetX,
}: {
  rows: TreeRow[];
  draggedId: string;
  draggedSubtreeIds: Set<string>;
  insertionIndex: number;
  offsetX: number;
}): Projection {
  const isDragged = (row: TreeRow) => row.id === draggedId || draggedSubtreeIds.has(row.id);

  // a lista como ela fica sem o item arrastado (e sem o que ele carrega junto), que é
  // contra quem os vizinhos do ponto de soltura devem ser medidos
  const rest = rows.filter((row) => !isDragged(row));
  const insertionIndex = rows.slice(0, rawInsertionIndex).filter((row) => !isDragged(row)).length;

  const previous = rest[insertionIndex - 1];
  const next = rest[insertionIndex];

  // só dá pra entrar um nível abaixo de uma pasta; abaixo de um componente o máximo é
  // continuar no mesmo nível dele
  const maxDepth = previous ? (previous.kind === "folder" ? previous.depth + 1 : previous.depth) : 0;
  const minDepth = next ? next.depth : 0;

  const desiredDepth = maxDepth + Math.round(offsetX / INDENT_WIDTH);
  const depth = Math.max(minDepth, Math.min(desiredDepth, maxDepth));

  let parentFolderId: string | null = null;
  if (depth > 0) {
    // o pai é a pasta mais próxima acima do ponto de soltura que está exatamente um
    // nível acima do nível escolhido
    for (let i = insertionIndex - 1; i >= 0; i--) {
      const row = rest[i];
      if (row.depth === depth - 1 && row.kind === "folder") {
        parentFolderId = row.id;
        break;
      }
      if (row.depth < depth - 1) break;
    }
  }

  const index = rest
    .slice(0, insertionIndex)
    .filter((row) => row.parentFolderId === parentFolderId && row.depth === depth).length;

  return { parentFolderId, index, depth, insertionIndex };
}
