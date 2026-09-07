import { create } from "zustand";
import type { Projection } from "./tree";

// Estado transitório do arraste na Structure. Fica fora do editorStore porque não é
// conteúdo da página (não entra em histórico nem em save), e fica fora de useState
// porque quem atualiza são os callbacks do dnd-kit, que rodam dentro de um insertion
// effect — agendar um setState de dentro dali é proibido pelo React, enquanto um store
// externo (useSyncExternalStore, que é como o zustand se liga ao React) é justamente o
// mecanismo previsto pra mudanças vindas de fora.
interface TreeDragState {
  draggedIds: Set<string>;
  toSectionId: string | null;
  projection: Projection | null;
  // arraste de section: índice onde ela vai cair (a marca aparece acima dessa section)
  sectionDropIndex: number | null;
  // pasta que fica recolhida enquanto está sendo arrastada, pra ficar claro que o que
  // se move é a pasta inteira e não só o cabeçalho dela
  autoCollapsedId: string | null;

  beginDrag: (draggedIds: Set<string>, autoCollapsedId: string | null) => void;
  setProjection: (toSectionId: string | null, projection: Projection | null) => void;
  beginSectionDrag: (fromIndex: number) => void;
  setSectionDropIndex: (index: number) => void;
  endDrag: () => void;
}

const EMPTY: Set<string> = new Set();
const IDLE = {
  draggedIds: EMPTY,
  toSectionId: null,
  projection: null,
  sectionDropIndex: null,
  autoCollapsedId: null,
};

export const useTreeDragStore = create<TreeDragState>((set) => ({
  ...IDLE,

  beginDrag: (draggedIds, autoCollapsedId) => set({ ...IDLE, draggedIds, autoCollapsedId }),
  setProjection: (toSectionId, projection) => set({ toSectionId, projection }),
  beginSectionDrag: (fromIndex) => set({ ...IDLE, sectionDropIndex: fromIndex }),
  setSectionDropIndex: (sectionDropIndex) => set({ sectionDropIndex }),
  endDrag: () => set(IDLE),
}));
