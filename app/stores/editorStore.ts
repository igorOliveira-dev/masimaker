import { create } from "zustand";
import { createClient } from "@/app/utils/supabase/client";

export type PreviewDevice = "mobile" | "tablet" | "desktop";

export interface ComponentItem {
  id: string;
  type: string;
  colors: Record<string, any>;
  attributes: Record<string, any>;
  position: number;
  parentComponentId: string | null;
}

export interface SectionItem {
  id: string;
  name?: string | null;
  background?: string | null;
  colors?: Record<string, any> | null;
  height?: number | null;
  position: number;
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
  moveComponentTo: (
    componentId: string,
    toSectionId: string,
    toParentComponentId: string | null,
    toIndex: number,
  ) => void;

  addSection: (options?: { background?: string; height?: number }) => void; // na interface EditorState, adicione:
  updateSection: (sectionId: string, patch: Partial<Omit<SectionItem, "id" | "components">>) => void;
  removeSection: (sectionId: string) => void;
  addComponent: (def: ComponentDefLike, sectionId: string, parentComponentId?: string | null) => void;
  removeComponent: (sectionId: string, componentId: string) => void;
  updateComponent: (sectionId: string, componentId: string, patch: Partial<ComponentItem>) => void;

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
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
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
          return {
            ...s,
            components: [
              ...s.components,
              {
                id: `temp-${crypto.randomUUID()}`,
                type: def.type,
                attributes: structuredClone(def.defaultAttributes),
                colors: structuredClone(def.defaultColors),
                position: siblings.length,
                parentComponentId,
              },
            ],
          };
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

          const removed = s.components.find((c) => c.id === componentId);
          const remaining = s.components.filter((c) => !idsToRemove.has(c.id));
          const siblingScope = removed?.parentComponentId ?? null;

          let siblingIndex = 0;
          const components = remaining.map((c) =>
            c.parentComponentId === siblingScope ? { ...c, position: siblingIndex++ } : c,
          );

          return { ...s, components };
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

    moveComponentTo: (componentId, toSectionId, toParentComponentId, toIndex) => {
      set((state) => {
        const sections = state.sections.map((s) => ({ ...s, components: [...s.components] }));

        let fromSection: SectionItem | undefined;
        let fromIndex = -1;
        for (const s of sections) {
          const idx = s.components.findIndex((c) => c.id === componentId);
          if (idx !== -1) {
            fromSection = s;
            fromIndex = idx;
            break;
          }
        }
        if (!fromSection) return state;

        const toSection = sections.find((s) => s.id === toSectionId);
        if (!toSection) return state;

        // impede que um componente seja solto dentro de si mesmo ou de um descendente seu
        if (toParentComponentId) {
          if (toParentComponentId === componentId) return state;
          let ancestorId: string | null = toParentComponentId;
          while (ancestorId) {
            const ancestor = toSection.components.find((c) => c.id === ancestorId);
            if (!ancestor) break;
            if (ancestor.id === componentId) return state;
            ancestorId = ancestor.parentComponentId;
          }
        }

        const [moved] = fromSection.components.splice(fromIndex, 1);
        const fromParentComponentId = moved.parentComponentId;
        moved.parentComponentId = toParentComponentId;

        const toSiblings = toSection.components.filter((c) => c.parentComponentId === toParentComponentId);
        const clampedIndex = Math.max(0, Math.min(toIndex, toSiblings.length));

        // encontra a posição real de inserção dentro do array completo da section,
        // logo antes do sibling que hoje ocupa clampedIndex no escopo do pai alvo
        const insertAt =
          clampedIndex < toSiblings.length
            ? toSection.components.indexOf(toSiblings[clampedIndex])
            : toSection.components.length;
        toSection.components.splice(insertAt, 0, moved);

        const reindexScope = (section: SectionItem, parentId: string | null) => {
          let i = 0;
          section.components = section.components.map((c) =>
            c.parentComponentId === parentId ? { ...c, position: i++ } : c,
          );
        };

        reindexScope(fromSection, fromParentComponentId);
        reindexScope(toSection, toParentComponentId);

        return { sections, isDirty: true };
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
          await supabase.from("sections").delete().eq("id", s.id);
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
            await supabase
              .from("sections")
              .update({
                name: section.name,
                background: section.background,
                colors: section.colors,
                height: section.height,
                position: section.position,
              })
              .eq("id", section.id);
          }

          // 3. componentes dessa section
          const oldSection = savedSections.find((s) => s.id === section.id);
          const oldComponents = oldSection?.components ?? [];
          const newComponentIds = new Set(section.components.map((c) => c.id));

          const componentsToDelete = oldComponents.filter((c) => !newComponentIds.has(c.id));
          for (const c of componentsToDelete) {
            await supabase.from("components").delete().eq("id", c.id);
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
                })
                .select("id")
                .single();

              if (error || !data) throw error;
              parentIdMap.set(component.id, data.id);
              resolvedComponents.push({ ...component, id: data.id, parentComponentId: resolvedParentComponentId });
            } else {
              await supabase
                .from("components")
                .update({
                  colors: component.colors,
                  attributes: component.attributes,
                  position: component.position,
                  parent_component_id: resolvedParentComponentId,
                })
                .eq("id", component.id);
              resolvedComponents.push({ ...component, parentComponentId: resolvedParentComponentId });
            }
          }

          resolvedSections.push({
            ...section,
            id: sectionId,
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
