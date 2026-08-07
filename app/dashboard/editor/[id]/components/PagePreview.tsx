"use client";

import { useRef } from "react";
import { useEditorStore } from "@/app/stores/editorStore";
import { componentRegistry } from "../blocks";
import PreviewDeviceToggle from "./PreviewDeviceToggle";

const DEVICE_WIDTHS: Record<string, string> = {
  mobile: "max-w-[390px]",
  tablet: "max-w-[768px]",
  desktop: "max-w-[1280px]",
};

const PagePreview = () => {
  const sections = useEditorStore((s) => s.sections);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const updateSection = useEditorStore((s) => s.updateSection);
  const previewDevice = useEditorStore((s) => s.previewDevice);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function handleResizeStart(e: React.MouseEvent, sectionId: string) {
    const el = sectionRefs.current[sectionId];
    if (!el) return;

    const startY = e.clientY;
    const startHeight = el.offsetHeight;

    function handleMouseMove(moveEvent: MouseEvent) {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(40, startHeight + delta);
      if (el) el.style.minHeight = `${newHeight}px`;
    }

    function handleMouseUp(upEvent: MouseEvent) {
      const delta = upEvent.clientY - startY;
      const newHeight = Math.max(40, startHeight + delta);
      updateSection(sectionId, { height: newHeight });
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col">
      <div className="flex justify-center pt-4">
        <PreviewDeviceToggle />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-background p-6 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div
          className={`mx-auto flex flex-col transition-[max-width] duration-300 ease-in-out rounded overflow-hidden ${DEVICE_WIDTHS[previewDevice]}`}
        >
          {sections.map((section) => {
            const isSelected = selectedSectionId === section.id;

            return (
              <div
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                onClick={() => selectSection(section.id)}
                className={`w-full relative cursor-pointer transition-colors ${
                  isSelected ? "outline outline-blue-500 z-1" : "hover:outline hover:outline-(--foreground)/20"
                }`}
                style={{
                  backgroundColor: section.background ?? undefined,
                  minHeight: `${section.height}px`,
                }}
              >
                {section.components.length > 0
                  ? section.components.map((component) => {
                      const def = componentRegistry[component.type as keyof typeof componentRegistry];
                      if (!def) return null;
                      const { Component } = def;
                      return <Component key={component.id} component={component} />;
                    })
                  : null}

                <div
                  onMouseDown={(e) => handleResizeStart(e, section.id)}
                  className="absolute bottom-0 left-0 w-full h-2 cursor-row-resize flex items-center justify-center group"
                >
                  <div className="w-16 h-1 rounded-full bg-(--foreground)/20 group-hover:bg-(--foreground)/40 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PagePreview;
