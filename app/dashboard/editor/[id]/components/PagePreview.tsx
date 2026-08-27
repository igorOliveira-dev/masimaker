"use client";

import { useRef } from "react";
import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";
import { componentRegistry, isContainer } from "../blocks";
import PreviewDeviceToggle from "./PreviewDeviceToggle";

const DEVICE_WIDTHS: Record<string, string> = {
  mobile: "max-w-[390px]",
  tablet: "max-w-[768px]",
  desktop: "max-w-[1280px]",
};

function sortedChildren(components: ComponentItem[], parentId: string | null) {
  return components
    .filter((c) => c.parentComponentId === parentId)
    .sort((a, b) => a.position - b.position);
}

function RenderedComponent({
  component,
  sectionId,
  allComponents,
  selectedComponentId,
  selectComponent,
}: {
  component: ComponentItem;
  sectionId: string;
  allComponents: ComponentItem[];
  selectedComponentId: string | null;
  selectComponent: (sectionId: string, componentId: string | null) => void;
}) {
  const def = componentRegistry[component.type as keyof typeof componentRegistry];
  if (!def) return null;

  const { Component } = def;
  const isSelected = component.id === selectedComponentId;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(sectionId, component.id);
      }}
      onClickCapture={(e) => {
        // impede navegação real ao clicar em links/botões enquanto edita no canvas
        if ((e.target as HTMLElement).closest("a")) e.preventDefault();
      }}
      className={isSelected ? "relative z-10 outline-2 outline-blue-500 -outline-offset-2" : ""}
    >
      <Component component={component}>
        {isContainer(component.type)
          ? sortedChildren(allComponents, component.id).map((child) => (
              <RenderedComponent
                key={child.id}
                component={child}
                sectionId={sectionId}
                allComponents={allComponents}
                selectedComponentId={selectedComponentId}
                selectComponent={selectComponent}
              />
            ))
          : null}
      </Component>
    </div>
  );
}

const PagePreview = () => {
  const sections = useEditorStore((s) => s.sections);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const selectComponent = useEditorStore((s) => s.selectComponent);
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
            const isSelectedSection = selectedSectionId === section.id;
            const hasSelectedComponent = section.components.some((component) => component.id === selectedComponentId);

            return (
              <div
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                onClick={() => selectSection(section.id)}
                className={`relative w-full cursor-pointer transition-colors ${
                  isSelectedSection && !hasSelectedComponent
                    ? "z-10 outline-2 outline-blue-500 -outline-offset-2"
                    : "hover:outline hover:outline-(--foreground)/20"
                }`}
                style={{
                  backgroundColor: section.background ?? undefined,
                  minHeight: `${section.height}px`,
                }}
              >
                {section.components.length > 0
                  ? sortedChildren(section.components, null).map((component) => (
                      <RenderedComponent
                        key={component.id}
                        component={component}
                        sectionId={section.id}
                        allComponents={section.components}
                        selectedComponentId={selectedComponentId}
                        selectComponent={selectComponent}
                      />
                    ))
                  : null}

                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleResizeStart(e, section.id);
                  }}
                  className="absolute bottom-0 left-0 flex h-2 w-full cursor-row-resize items-center justify-center group"
                >
                  <div className="h-1 w-16 rounded-full bg-(--foreground)/20 transition-colors group-hover:bg-(--foreground)/40" />
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
