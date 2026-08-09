"use client";

import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/app/stores/editorStore";
import ComponentTree from "./ComponentTree";
import ComponentPalette from "./ComponentPalette";

const MIN_PALETTE_HEIGHT = 120;
const MIN_TREE_HEIGHT = 120;

const Toolbar = () => {
  const sections = useEditorStore((s) => s.sections);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const [showSideBar, setShowSidebar] = useState(true);

  const containerRef = useRef<HTMLElement>(null);
  const [paletteHeight, setPaletteHeight] = useState(260); // px, valor inicial
  const isDraggingRef = useRef(false);

  const section = sections.find((s) => s.id === selectedSectionId);
  const component = section?.components.find((c) => c.id === selectedComponentId);

  const handlePointerMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - containerRect.top;

    const maxHeight = containerRect.height - MIN_TREE_HEIGHT;
    const clamped = Math.min(Math.max(offsetY, MIN_PALETTE_HEIGHT), Math.max(maxHeight, MIN_PALETTE_HEIGHT));

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
      className={`bg-(--background-secondary) w-60 h-full border-r-2 border-(--foreground)/10 ${showSideBar ? "" : "transform-[translateX(-215px)]"} transition-transform`}
    >
      <div className="bg-(--foreground)/10 p-1 flex justify-end">
        <FontAwesomeIcon
          icon={faAnglesLeft}
          className="text-(--foreground)/80 font-thin text-xs cursor-pointer"
          onClick={() => setShowSidebar(!showSideBar)}
        />
      </div>

      {!showSideBar && (
        <div className="relative h-full">
          <button className="absolute text-sm left-full top-1/2 -translate-x-6 -rotate-90 origin-top-left whitespace-nowrap cursor-pointer pt-0.5">
            Toolbar
          </button>
        </div>
      )}

      {showSideBar && (
        <main ref={containerRef} className="flex flex-col h-[calc(100%-20px)]">
          <div
            style={{ height: paletteHeight }}
            className="shrink-0 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <ComponentPalette />
          </div>

          {/* handle de resize */}
          <div
            onMouseDown={handlePointerDown}
            className="h-1.5 shrink-0 cursor-row-resize flex items-center justify-center border-y-2 border-(--foreground)/10 bg-(--foreground)/10 hover:bg-(--foreground)/20 active:bg-(--foreground)/30 transition-colors"
          >
            <div className="w-8 h-0.5 rounded-full bg-(--foreground)/30" />
          </div>

          {/* structure */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-2 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <ComponentTree />
          </div>
        </main>
      )}
    </div>
  );
};

export default Toolbar;
