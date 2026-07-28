"use client";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEditorStore } from "@/app/stores/editorStore";
import { Redo2, Undo2 } from "lucide-react";

const EditorHeader = () => {
  const pageTitle = useEditorStore((s) => s.page?.title);
  const pageSlug = useEditorStore((s) => s.page?.slug);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const save = useEditorStore((s) => s.save);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const canUndo = useEditorStore((s) => s.history.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  return (
    <div className="w-full h-16 bg-[var(--background-secondary)] flex items-center justify-between px-4 border-b-2 border-[var(--foreground)]/10">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="h-8 w-8 flex items-center justify-center cursor-pointer rounded-full p-2 hover:bg-[var(--foreground)]/10 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <p className="flex flex-col">
          <span className="font-semibold">{pageTitle}</span>
          <span className="text-sm text-[var(--foreground)]/80">{pageSlug}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-colors rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-colors rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 size={18} />
          </button>
        </div>
        <button
          onClick={save}
          disabled={!isDirty || isSaving}
          className="cursor-pointer p-1 px-4 bg-green-600 text-white border-2 rounded-lg border-[var(--foreground)]/10 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
};

export default EditorHeader;
