"use client";

import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useRef, useState } from "react";
import { componentList } from "../blocks/index";
import { useEditorStore } from "@/app/stores/editorStore";
import ComponentTree from "./ComponentTree";

const MIN_PALETTE_HEIGHT = 120;
const MIN_TREE_HEIGHT = 120;

const Toolbar = () => {
  const sections = useEditorStore((s) => s.sections);
  const addComponent = useEditorStore((s) => s.addComponent);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const [showSideBar, setShowSidebar] = useState(true);

  const containerRef = useRef<HTMLElement>(null);
  const [paletteHeight, setPaletteHeight] = useState(260); // px, valor inicial
  const isDraggingRef = useRef(false);

  const section = sections.find((s) => s.id === selectedSectionId);
  const component = section?.components.find(
    (c) => c.id === selectedComponentId,
  );

  function handleAddComponent(def: (typeof componentList)[number]) {
    if (!selectedSectionId) return;
    addComponent(def, selectedSectionId);
  }

  const handlePointerMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - containerRect.top;

    const maxHeight = containerRect.height - MIN_TREE_HEIGHT;
    const clamped = Math.min(
      Math.max(offsetY, MIN_PALETTE_HEIGHT),
      Math.max(maxHeight, MIN_PALETTE_HEIGHT),
    );

    setPaletteHeight(clamped);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
    return () => {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    setShowSidebar(true);
  }, [section, component]);

  function handlePointerDown() {
    isDraggingRef.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div
      onClick={() => {
        showSideBar === false ? setShowSidebar(true) : null;
      }}
      className={`bg-[var(--background-secondary)] w-60 h-full border-r-2 border-[var(--foreground)]/10 ${showSideBar ? "" : "transform-[translateX(-215px)]"} transition-transform`}
    >
      <div className="bg-[var(--foreground)]/10 p-1 flex justify-end">
        <FontAwesomeIcon
          icon={faAnglesLeft}
          className="text-[var(--foreground)]/80 font-thin text-xs cursor-pointer"
          onClick={() => setShowSidebar(!showSideBar)}
        />
      </div>

      {!showSideBar && (
        <div className="relative h-full">
          <button className="absolute text-sm left-full top-1/2 -translate-x-[24px] -rotate-90 origin-top-left whitespace-nowrap cursor-pointer pt-0.5 text-sm">
            Toolbar
          </button>
        </div>
      )}

      {showSideBar && (
        <main ref={containerRef} className="flex flex-col h-[calc(100%-20px)]">
          <div
            style={{ height: paletteHeight }}
            className="flex flex-col shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <p className="px-2 pt-3">Components</p>
            {!selectedSectionId && (
              <p className="px-2 pb-1 text-xs text-[var(--foreground)]/40">
                Selecione uma section pra adicionar
              </p>
            )}
            {componentList.map((def) => (
              <button
                key={def.type}
                disabled={!selectedSectionId}
                onClick={() => handleAddComponent(def)}
                className="flex items-center justify-between gap-1 h-10 m-2 p-2 rounded border-2 border-[var(--foreground)]/10 hover:opacity-80 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>{def.label}</span>
                <def.icon size={20} />
              </button>
            ))}
          </div>

          {/* handle de resize */}
          <div
            onMouseDown={handlePointerDown}
            className="h-1.5 shrink-0 cursor-row-resize flex items-center justify-center border-y-2 border-[var(--foreground)]/10 bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 active:bg-[var(--foreground)]/30 transition-colors"
          >
            <div className="w-8 h-0.5 rounded-full bg-[var(--foreground)]/30" />
          </div>

          {/* structure */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <ComponentTree />
          </div>
        </main>
      )}
    </div>
  );
};

export default Toolbar;
