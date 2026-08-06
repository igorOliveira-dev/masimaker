// Este componente exibe uma pré-visualização da página sendo editada.

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
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const updateSection = useEditorStore((s) => s.updateSection);
  const previewDevice = useEditorStore((s) => s.previewDevice);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Inicia o ajuste manual da altura de uma section ao arrastar a barra inferior.
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

      <div className="flex-1 min-h-0 overflow-y-auto bg-[var(--background)] p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div
          className={`mx-auto flex flex-col transition-[max-width] duration-300 ease-in-out rounded overflow-visible ${DEVICE_WIDTHS[previewDevice]}`}
        >
          {sections.map((section) => {
            const isSelected = selectedSectionId === section.id;

            return (
              <div
                key={section.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectSection(section.id);
                }}
                className={`w-full relative cursor-pointer transition-colors overflow-visible ${
                  isSelected
                    ? "ring-4 ring-blue-500 ring-offset-1 ring-offset-[var(--background)] z-10"
                    : "hover:ring hover:ring-1 hover:ring-[var(--foreground)]/20"
                }`}
              >
                <div
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  style={{
                    backgroundColor: section.background ?? undefined,
                    minHeight: `${section.height}px`,
                  }}
                  className="w-full rounded overflow-hidden"
                >
                  {section.components.length > 0
                    ? section.components.map((component) => {
                        const def =
                          componentRegistry[
                            component.type as keyof typeof componentRegistry
                          ];
                        if (!def) return null;
                        const { Component } = def;
                        const isComponentSelected = selectedComponentId === component.id;

                        return (
                          <div
                            key={component.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectComponent(section.id, component.id);
                            }}
                            className={`w-full ${isComponentSelected ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-[var(--background)]" : ""}`}
                          >
                            <Component component={component} />
                          </div>
                        );
                      })
                    : null}

                  <div
                    onMouseDown={(e) => handleResizeStart(e, section.id)}
                    className="absolute bottom-0 left-0 w-full h-2 cursor-row-resize flex items-center justify-center group"
                  >
                    <div className="w-16 h-1 rounded-full bg-[var(--foreground)]/20 group-hover:bg-[var(--foreground)]/40 transition-colors" />
                  </div>
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
