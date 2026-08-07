"use client";

import { useState } from "react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEditorStore } from "@/app/stores/editorStore";
import { Redo2, Undo2, QrCode } from "lucide-react";
import { ThemeToggleButton } from "@/app/auth/components/ThemeToggleButton";
import QrCodeModal from "./QrCodeModal";

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

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  return (
    <div className="w-full h-16 bg-(--background-secondary) flex items-center justify-between px-4 border-b-2 border-(--foreground)/10">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="h-8 w-8 flex items-center justify-center cursor-pointer rounded-full p-2 hover:bg-(--foreground)/10 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <p className="flex flex-col">
          <span className="font-semibold">{pageTitle}</span>
          <span className="text-sm text-(--foreground)/80">{pageSlug}</span>
        </p>
        <button
          onClick={() => setIsQrModalOpen(true)}
          disabled={!pageSlug}
          aria-label="View access QR code"
          className="cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-(--foreground)/10 transition-colors rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <QrCode size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggleButton />
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-(--foreground)/10 transition-colors rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-(--foreground)/10 transition-colors rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 size={18} />
          </button>
        </div>
        <button
          onClick={save}
          disabled={!isDirty || isSaving}
          className="cursor-pointer p-1 px-4 bg-green-600 text-white border-2 rounded-lg border-(--foreground)/10 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {pageSlug && <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} slug={pageSlug} />}
    </div>
  );
};

export default EditorHeader;
