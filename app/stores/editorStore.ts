// Este arquivo define o store global do editor com estado, ações e persistência.

import { create } from "zustand";
import { createClient } from "@/app/utils/supabase/client";

export type PreviewDevice = "mobile" | "tablet" | "desktop";

export interface ComponentItem {
  id: string;
  type: string;
  colors: Record<string, any>;
  attributes: Record<string, any>;
  position: number;
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

  addSection: (options?: { background?: string; height?: number }) => void; // na interface EditorState, adicione:
  updateSection: (
    sectionId: string,
    patch: Partial<Omit<SectionItem, "id" | "components">>,
  ) => void;
  removeSection: (sectionId: string) => void;
  addComponent: (def: ComponentDefLike, sectionId: string) => void;
  removeComponent: (sectionId: string, componentId: string) => void;
  updateComponent: (
    sectionId: string,
    componentId: string,
    patch: Partial<ComponentItem>,
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
  // Salva o estado atual das sections no histórico para permitir desfazer e refazer.
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

    selectSection: (id) =>
      set({ selectedSectionId: id, selectedComponentId: null }),

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

    // Cria uma nova section vazia e a seleciona automaticamente no editor.
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

    // Atualiza os campos de uma section existente no estado do editor.
    updateSection: (sectionId, patch) => {
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, ...patch } : s,
        ),
        isDirty: true,
      }));
    },

    // Remove uma section do estado e reajusta suas posições.
    removeSection: (sectionId) => {
      pushHistory();
      set((state) => ({
        sections: state.sections
          .filter((s) => s.id !== sectionId)
          .map((s, i) => ({ ...s, position: i })),
        isDirty: true,
      }));
    },

    // Adiciona um novo component à section selecionada usando a definição do bloco.
    addComponent: (def, sectionId) => {
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                components: [
                  ...s.components,
                  {
                    id: `temp-${crypto.randomUUID()}`,
                    type: def.type,
                    attributes: structuredClone(def.defaultAttributes),
                    colors: structuredClone(def.defaultColors),
                    position: s.components.length,
                  },
                ],
              }
            : s,
        ),
        isDirty: true,
      }));
    },

    // Remove um component específico da section indicada.
    removeComponent: (sectionId, componentId) => {
      pushHistory();
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                components: s.components.filter((c) => c.id !== componentId),
              }
            : s,
        ),
        isDirty: true,
      }));
    },

    // Atualiza os atributos e cores de um component já existente.
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

    // Restaura o estado anterior das sections a partir do histórico.
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

    // Reaplica um estado removido pelo undo, se existir no futuro.
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

    // Persiste as sections e components no banco Supabase e atualiza o estado salvo.
    save: async () => {
      const { page, sections, savedSections } = get();
      if (!page) return;

      set({ isSaving: true });
      const supabase = createClient();

      try {
        const newSectionIds = new Set(sections.map((s) => s.id));

        // 1. apagar sections removidas
        const sectionsToDelete = savedSections.filter(
          (s) => !newSectionIds.has(s.id),
        );
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

          const componentsToDelete = oldComponents.filter(
            (c) => !newComponentIds.has(c.id),
          );
          for (const c of componentsToDelete) {
            await supabase.from("components").delete().eq("id", c.id);
          }

          const resolvedComponents: ComponentItem[] = [];
          for (const component of section.components) {
            if (isTempId(component.id)) {
              const { data, error } = await supabase
                .from("components")
                .insert({
                  section_id: sectionId,
                  type: component.type,
                  colors: component.colors,
                  attributes: component.attributes,
                  position: component.position,
                })
                .select("id")
                .single();

              if (error || !data) throw error;
              resolvedComponents.push({ ...component, id: data.id });
            } else {
              await supabase
                .from("components")
                .update({
                  colors: component.colors,
                  attributes: component.attributes,
                  position: component.position,
                })
                .eq("id", component.id);
              resolvedComponents.push(component);
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
