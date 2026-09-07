import { create } from "zustand";
import { createClient } from "@/app/utils/supabase/client";
import { childrenOf, positionBetween, reindexSection, subtreeOf } from "./tree";

export type PreviewDevice = "mobile" | "tablet" | "desktop";

export interface ComponentItem {
  id: string;
  type: string;
  colors: Record<string, any>;
  attributes: Record<string, any>;
  // ordem na árvore da section, num contador único compartilhado com as pastas e
  // atribuído em profundidade (ver reindexSection). Como o canvas desenha só os
  // componentes de topo ordenados por `position`, a ordem de empilhamento passa a
  // ser exatamente a ordem que se vê na Structure — igual ao Photoshop.
  position: number;
  parentComponentId: string | null;
  // pasta (grupo) que organiza esse componente na Structure, tipo grupo de camadas
  // no Photoshop. Só se aplica a componentes de topo (parentComponentId === null).
  folderId: string | null;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

// pasta/grupo de organização na árvore de Structure, igual grupo de camadas no
// Photoshop. Pode ser aninhada (parentFolderId) e agrupa componentes de topo de
// uma section — não existe no canvas, é só organização visual da árvore.
export interface FolderItem {
  id: string;
  name: string;
  position: number;
  parentFolderId: string | null;
}

export interface SectionItem {
  id: string;
  name?: string | null;
  background?: string | null;
  colors?: Record<string, any> | null;
  height?: number | null;
  position: number;
  folders: FolderItem[];
  components: ComponentItem[];
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  color_theme?: any;
  owner_id: string;
}

interface ComponentDefLike {
  type: string;
  defaultAttributes: Record<string, any>;
  defaultColors: Record<string, any>;
}

const isTempId = (id: string) => id.startsWith("temp-");
const HISTORY_LIMIT = 50;

interface EditorState {
  page: PageData | null;
  sections: SectionItem[];
  savedSections: SectionItem[];
  history: SectionItem[][];
  future: SectionItem[][];
  isDirty: boolean;
  isSaving: boolean;

  previewDevice: PreviewDevice;
  setPreviewDevice: (device: PreviewDevice) => void;

  setPage: (page: PageData) => void;
  setSections: (sections: SectionItem[]) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  snapshotHistory: () => void;

  addSection: (options?: { background?: string; height?: number }) => void; // na interface EditorState, adicione:
  updateSection: (sectionId: string, patch: Partial<Omit<SectionItem, "id" | "components" | "folders">>) => void;
  removeSection: (sectionId: string) => void;
  addComponent: (def: ComponentDefLike, sectionId: string, parentComponentId?: string | null) => void;
  removeComponent: (sectionId: string, componentId: string) => void;

  addFolder: (sectionId: string, parentFolderId?: string | null) => void;
  renameFolder: (sectionId: string, folderId: string, name: string) => void;
  removeFolder: (sectionId: string, folderId: string, options?: { deleteContents?: boolean }) => void;
  // move qualquer nó da árvore (pasta com tudo dentro, ou componente) pra outro ponto:
  // outra section, outra pasta, outra posição entre irmãos
  moveNode: (nodeId: string, toSectionId: string, toParentFolderId: string | null, toIndex: number) => void;
  updateComponent: (sectionId: string, componentId: string, patch: Partial<ComponentItem>) => void;
  updateComponentGeometry: (
    sectionId: string,
    componentId: string,
    patch: Partial<Pick<ComponentItem, "x" | "y" | "width" | "height">>,
  ) => void;

  selectedSectionId: string | null;
  selectedComponentId: string | null;
  selectSection: (id: string | null) => void;
  selectComponent: (sectionId: string, componentId: string | null) => void;

  undo: () => void;
  redo: () => void;

  save: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => {
  // helper interno, não faz parte da interface pública do store
  function pushHistory() {
    const { sections, history } = get();
    const snapshot = structuredClone(sections);
    set({ history: [...history, snapshot].slice(-HISTORY_LIMIT), future: [] });
  }

  return {
    page: null,
    sections: [],
    savedSections: [],
    history: [],
    future: [],
    isDirty: false,
    isSaving: false,

    previewDevice: "desktop",
    setPreviewDevice: (device) => set({ previewDevice: device }),

    selectedSectionId: null,
    selectedComponentId: null,

    selectSection: (id) => set({ selectedSectionId: id, selectedComponentId: null }),

    selectComponent: (sectionId, componentId) =>
      set({ selectedSectionId: sectionId, selectedComponentId: componentId }),

    setPage: (page) => set({ page }),

    // usado só no load inicial — não entra no histórico nem marca "dirty"
    setSections: (sections) =>
      set({
        sections,
        savedSections: structuredClone(sections),
        history: [],
        future: [],
        isDirty: false,
      }),

    addSection: () => {
      const { sections, page } = get();
      if (!page) return;

      pushHistory();
      const newSection: SectionItem = {
        id: `temp-${crypto.randomUUID()}`,
        background: "#ffffff",
        colors: {},
        height: 300,
        position: sections.length,
        folders: [],
        components: [],
      };
      set({
        sections: [...sections, newSection],
        isDirty: true,
        selectedSectionId: newSection.id,
        selectedComponentId: null,
      });
    },

    updateSection: (sectionId, patch) => {
      // height é coluna integer no banco - o resize da section divide o delta do
      // mouse pela escala do preview (mobile/tablet), o que quase sempre gera um
      // valor fracionário; sem arredondar aqui, o update no Supabase falha com um
      // erro de tipo que passava batido (silenciosamente, sem persistir nada)
      const roundedPatch = patch.height != null ? { ...patch, height: Math.round(patch.height) } : patch;
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) => (s.id === sectionId ? { ...s, ...roundedPatch } : s)),
        isDirty: true,
      }));
    },

    removeSection: (sectionId) => {
      pushHistory();
      set((state) => ({
        sections: state.sections.filter((s) => s.id !== sectionId).map((s, i) => ({ ...s, position: i })),
        isDirty: true,
      }));
    },

    addComponent: (def, sectionId, parentComponentId = null) => {
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const siblings = s.components.filter((c) => c.parentComponentId === parentComponentId);
          const cascade = siblings.length % 8;
          const isTopLevel = parentComponentId === null;
          const rootSiblings = childrenOf(s, null);
          return reindexSection({
            ...s,
            components: [
              ...s.components,
              {
                id: `temp-${crypto.randomUUID()}`,
                type: def.type,
                attributes: structuredClone(def.defaultAttributes),
                colors: structuredClone(def.defaultColors),
                // entra no fim da raiz da section; o reindex normaliza pra inteiro
                position: rootSiblings.length ? rootSiblings[rootSiblings.length - 1].position + 0.5 : 0,
                parentComponentId,
                folderId: null,
                x: isTopLevel ? 24 + cascade * 24 : null,
                y: isTopLevel ? 24 + cascade * 24 : null,
                width: null,
                height: null,
              },
            ],
          });
        }),
        isDirty: true,
      }));
    },

    removeComponent: (sectionId, componentId) => {
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) => {
          if (s.id !== sectionId) return s;

          const idsToRemove = new Set<string>([componentId]);
          let grew = true;
          while (grew) {
            grew = false;
            for (const c of s.components) {
              if (c.parentComponentId && idsToRemove.has(c.parentComponentId) && !idsToRemove.has(c.id)) {
                idsToRemove.add(c.id);
                grew = true;
              }
            }
          }

          return reindexSection({ ...s, components: s.components.filter((c) => !idsToRemove.has(c.id)) });
        }),
        isDirty: true,
      }));
    },

    updateComponent: (
      sectionId,
      componentId,
      values: Partial<{
        attributes: Record<string, any>;
        colors: Record<string, any>;
      }>,
    ) =>
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                components: s.components.map((c) =>
                  c.id !== componentId
                    ? c
                    : {
                        ...c,
                        attributes: { ...c.attributes, ...values.attributes },
                        colors: { ...c.colors, ...values.colors },
                      },
                ),
              },
        ),
        isDirty: true,
      })),

    updateComponentGeometry: (sectionId, componentId, patch) => {
      // x/y/width/height são colunas integer no banco - dividir o delta do mouse
      // pela escala do preview (que quase nunca é exatamente 1, já que a largura
      // do painel raramente bate certinho com CANVAS_REFERENCE_WIDTH) quase sempre
      // gera um valor fracionário; sem arredondar aqui, o update no Supabase falha
      // com um erro de tipo que passava batido (silenciosamente, sem persistir nada)
      const roundedPatch = {
        ...patch,
        ...(patch.x != null && { x: Math.round(patch.x) }),
        ...(patch.y != null && { y: Math.round(patch.y) }),
        ...(patch.width != null && { width: Math.round(patch.width) }),
        ...(patch.height != null && { height: Math.round(patch.height) }),
      };
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                components: s.components.map((c) => (c.id !== componentId ? c : { ...c, ...roundedPatch })),
              },
        ),
        isDirty: true,
      }));
    },

    reorderSections: (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      pushHistory();
      set((state) => {
        const next = [...state.sections];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return {
          sections: next.map((s, i) => ({ ...s, position: i })),
          isDirty: true,
        };
      });
    },

    snapshotHistory: () => {
      pushHistory();
    },

    addFolder: (sectionId, parentFolderId = null) => {
      const { sections } = get();
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      pushHistory();
      const siblings = childrenOf(section, parentFolderId);
      const newFolder: FolderItem = {
        id: `temp-${crypto.randomUUID()}`,
        name: "New folder",
        parentFolderId,
        // entra no fim do escopo; o reindex normaliza pra inteiro
        position: siblings.length ? siblings[siblings.length - 1].position + 0.5 : 0,
      };
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? reindexSection({ ...s, folders: [...s.folders, newFolder] }) : s,
        ),
        isDirty: true,
      }));
    },

    renameFolder: (sectionId, folderId, name) => {
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id !== sectionId ? s : { ...s, folders: s.folders.map((f) => (f.id === folderId ? { ...f, name } : f)) },
        ),
        isDirty: true,
      }));
    },

    removeFolder: (sectionId, folderId, options) => {
      const deleteContents = options?.deleteContents ?? false;
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const folder = s.folders.find((f) => f.id === folderId);
          if (!folder) return s;

          if (deleteContents) {
            const { folderIds, componentIds } = subtreeOf(s, folderId);
            return reindexSection({
              ...s,
              folders: s.folders.filter((f) => !folderIds.has(f.id)),
              components: s.components.filter((c) => !componentIds.has(c.id)),
            });
          }

          // "ungroup": só remove a pasta em si, promovendo os filhos diretos (subpastas
          // e componentes) pro nível onde ela estava — a estrutura interna deles fica intacta
          return reindexSection({
            ...s,
            folders: s.folders
              .filter((f) => f.id !== folderId)
              .map((f) => (f.parentFolderId === folderId ? { ...f, parentFolderId: folder.parentFolderId } : f)),
            components: s.components.map((c) =>
              c.folderId === folderId ? { ...c, folderId: folder.parentFolderId } : c,
            ),
          });
        }),
        isDirty: true,
      }));
    },

    moveNode: (nodeId, toSectionId, toParentFolderId, toIndex) => {
      set((state) => {
        const fromSection = state.sections.find(
          (s) => s.folders.some((f) => f.id === nodeId) || s.components.some((c) => c.id === nodeId),
        );
        const toSection = state.sections.find((s) => s.id === toSectionId);
        if (!fromSection || !toSection) return state;
        if (toParentFolderId && !toSection.folders.some((f) => f.id === toParentFolderId)) return state;

        const folder = fromSection.folders.find((f) => f.id === nodeId);
        const component = folder ? undefined : fromSection.components.find((c) => c.id === nodeId);
        if (!folder && !component) return state;
        // pastas organizam só componentes de topo
        if (component && component.parentComponentId !== null) return state;

        // o que viaja junto: uma pasta leva tudo que está dentro dela, em qualquer nível
        const moving = folder
          ? subtreeOf(fromSection, folder.id)
          : { folderIds: new Set<string>(), componentIds: new Set([nodeId]) };

        // não dá pra soltar uma pasta dentro dela mesma nem de uma descendente sua
        if (toParentFolderId && moving.folderIds.has(toParentFolderId)) return state;

        // posição fracionária entre os vizinhos do destino — o reindex em profundidade
        // logo abaixo normaliza tudo de volta pra inteiros na ordem certa
        const position = positionBetween(toSection, toParentFolderId, toIndex, nodeId);

        const place = <T extends FolderItem | ComponentItem>(node: T): T =>
          node.id !== nodeId
            ? node
            : "parentFolderId" in node
              ? { ...node, parentFolderId: toParentFolderId, position }
              : { ...node, folderId: toParentFolderId, position };

        if (fromSection.id === toSection.id) {
          return {
            sections: state.sections.map((section) =>
              section.id !== toSection.id
                ? section
                : reindexSection({
                    ...section,
                    folders: section.folders.map(place),
                    components: section.components.map(place),
                  }),
            ),
            isDirty: true,
          };
        }

        const movedFolders = fromSection.folders.filter((f) => moving.folderIds.has(f.id)).map(place);
        const movedComponents = fromSection.components.filter((c) => moving.componentIds.has(c.id)).map(place);

        return {
          sections: state.sections.map((section) => {
            if (section.id === fromSection.id) {
              return reindexSection({
                ...section,
                folders: section.folders.filter((f) => !moving.folderIds.has(f.id)),
                components: section.components.filter((c) => !moving.componentIds.has(c.id)),
              });
            }
            if (section.id === toSection.id) {
              return reindexSection({
                ...section,
                folders: [...section.folders, ...movedFolders],
                components: [...section.components, ...movedComponents],
              });
            }
            return section;
          }),
          isDirty: true,
        };
      });
    },

    undo: () => {
      const { history, sections, future } = get();
      if (history.length === 0) return;
      const previous = history[history.length - 1];
      set({
        sections: previous,
        history: history.slice(0, -1),
        future: [structuredClone(sections), ...future],
        isDirty: true,
      });
    },

    redo: () => {
      const { future, sections, history } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        sections: next,
        future: future.slice(1),
        history: [...history, structuredClone(sections)],
        isDirty: true,
      });
    },

    save: async () => {
      const { page, sections, savedSections } = get();
      if (!page) return;

      set({ isSaving: true });
      const supabase = createClient();

      try {
        const newSectionIds = new Set(sections.map((s) => s.id));

        // 1. apagar sections removidas
        const sectionsToDelete = savedSections.filter((s) => !newSectionIds.has(s.id));
        for (const s of sectionsToDelete) {
          const { error } = await supabase.from("sections").delete().eq("id", s.id);
          if (error) throw error;
        }

        // 2. inserir/atualizar sections + resolver ids temporários
        const resolvedSections: SectionItem[] = [];

        for (const section of sections) {
          let sectionId = section.id;

          if (isTempId(section.id)) {
            const { data, error } = await supabase
              .from("sections")
              .insert({
                page_id: page.id,
                name: section.name,
                background: section.background,
                colors: section.colors,
                height: section.height,
                position: section.position,
              })
              .select("id")
              .single();

            if (error || !data) throw error;
            sectionId = data.id;
          } else {
            const { error } = await supabase
              .from("sections")
              .update({
                name: section.name,
                background: section.background,
                colors: section.colors,
                height: section.height,
                position: section.position,
              })
              .eq("id", section.id);

            if (error) throw error;
          }

          // 3. pastas dessa section — apagar removidas, inserir/atualizar as demais
          //    resolvendo ids temporários antes dos componentes (que dependem de folder_id)
          const oldSection = savedSections.find((s) => s.id === section.id);
          const oldFolders = oldSection?.folders ?? [];
          const newFolderIds = new Set(section.folders.map((f) => f.id));

          const foldersToDelete = oldFolders.filter((f) => !newFolderIds.has(f.id));
          for (const f of foldersToDelete) {
            const { error } = await supabase.from("component_folders").delete().eq("id", f.id);
            if (error) throw error;
          }

          // insere/atualiza pastas-pai antes das filhas, pra resolver parent_folder_id
          // de uma pasta com id temporário pro id real da pasta-pai
          const orderedFolders = [...section.folders].sort((a, b) =>
            a.parentFolderId === b.parentFolderId ? 0 : a.parentFolderId === null ? -1 : 1,
          );

          const folderIdMap = new Map<string, string>();
          const resolvedFolders: FolderItem[] = [];
          for (const folder of orderedFolders) {
            const resolvedParentFolderId = folder.parentFolderId
              ? (folderIdMap.get(folder.parentFolderId) ?? folder.parentFolderId)
              : null;

            if (isTempId(folder.id)) {
              const { data, error } = await supabase
                .from("component_folders")
                .insert({
                  section_id: sectionId,
                  name: folder.name,
                  position: folder.position,
                  parent_folder_id: resolvedParentFolderId,
                })
                .select("id")
                .single();

              if (error || !data) throw error;
              folderIdMap.set(folder.id, data.id);
              resolvedFolders.push({ ...folder, id: data.id, parentFolderId: resolvedParentFolderId });
            } else {
              const { error } = await supabase
                .from("component_folders")
                .update({
                  name: folder.name,
                  position: folder.position,
                  parent_folder_id: resolvedParentFolderId,
                })
                .eq("id", folder.id);

              if (error) throw error;
              resolvedFolders.push({ ...folder, parentFolderId: resolvedParentFolderId });
            }
          }

          // 4. componentes dessa section
          const oldComponents = oldSection?.components ?? [];
          const newComponentIds = new Set(section.components.map((c) => c.id));

          const componentsToDelete = oldComponents.filter((c) => !newComponentIds.has(c.id));
          for (const c of componentsToDelete) {
            const { error } = await supabase.from("components").delete().eq("id", c.id);
            if (error) throw error;
          }

          // insere/atualiza pais antes de filhos, para que o parent_component_id de um
          // filho com id temporário possa ser resolvido para o id real do pai
          const orderedComponents = [...section.components].sort((a, b) =>
            a.parentComponentId === b.parentComponentId ? 0 : a.parentComponentId === null ? -1 : 1,
          );

          const parentIdMap = new Map<string, string>();
          const resolvedComponents: ComponentItem[] = [];
          for (const component of orderedComponents) {
            const resolvedParentComponentId = component.parentComponentId
              ? (parentIdMap.get(component.parentComponentId) ?? component.parentComponentId)
              : null;
            const resolvedFolderId = component.folderId
              ? (folderIdMap.get(component.folderId) ?? component.folderId)
              : null;

            if (isTempId(component.id)) {
              const { data, error } = await supabase
                .from("components")
                .insert({
                  section_id: sectionId,
                  type: component.type,
                  colors: component.colors,
                  attributes: component.attributes,
                  position: component.position,
                  parent_component_id: resolvedParentComponentId,
                  folder_id: resolvedFolderId,
                  x: component.x,
                  y: component.y,
                  width: component.width,
                  height: component.height,
                })
                .select("id")
                .single();

              if (error || !data) throw error;
              parentIdMap.set(component.id, data.id);
              resolvedComponents.push({
                ...component,
                id: data.id,
                parentComponentId: resolvedParentComponentId,
                folderId: resolvedFolderId,
              });
            } else {
              const { error } = await supabase
                .from("components")
                .update({
                  colors: component.colors,
                  attributes: component.attributes,
                  position: component.position,
                  parent_component_id: resolvedParentComponentId,
                  folder_id: resolvedFolderId,
                  x: component.x,
                  y: component.y,
                  width: component.width,
                  height: component.height,
                })
                .eq("id", component.id);

              if (error) throw error;
              resolvedComponents.push({ ...component, parentComponentId: resolvedParentComponentId, folderId: resolvedFolderId });
            }
          }

          resolvedSections.push({
            ...section,
            id: sectionId,
            folders: resolvedFolders,
            components: resolvedComponents,
          });
        }

        set({
          sections: resolvedSections,
          savedSections: structuredClone(resolvedSections),
          history: [],
          future: [],
          isDirty: false,
          isSaving: false,
        });
      } catch (err) {
        console.error("Erro ao salvar página:", err);
        set({ isSaving: false });
      }
    },
  };
});
