"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";
import { componentRegistry, isContainer } from "../blocks";
import PreviewDeviceToggle from "./PreviewDeviceToggle";
import CanvasItem from "./CanvasItem";
import { CANVAS_REFERENCE_WIDTH } from "@/app/constants/canvas";

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
  fill = false,
}: {
  component: ComponentItem;
  sectionId: string;
  allComponents: ComponentItem[];
  selectedComponentId: string | null;
  selectComponent: (sectionId: string, componentId: string | null) => void;
  // true só pro item de topo do canvas quando ele tem width/height explícitos -
  // faz o conteúdo preencher a caixa redimensionada em vez de manter o tamanho
  // natural do conteúdo. Nunca passado na recursão pros filhos de um container,
  // que continuam se comportando exatamente como hoje (dimensionados pelo flex
  // do container pai).
  fill?: boolean;
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
      style={fill ? { width: "100%", height: "100%" } : undefined}
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
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_REFERENCE_WIDTH);

  // mede a largura real do wrapper (que muda com o toggle mobile/tablet/desktop
  // e com o redimensionamento da janela) pra escalar o canvas de referência
  // (sempre CANVAS_REFERENCE_WIDTH de largura) proporcionalmente
  useEffect(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setCanvasWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = canvasWidth > 0 ? canvasWidth / CANVAS_REFERENCE_WIDTH : 1;

  function handleResizeStart(e: React.MouseEvent, sectionId: string, currentHeight: number) {
    const el = sectionRefs.current[sectionId];
    if (!el) return;

    const startY = e.clientY;

    function handleMouseMove(moveEvent: MouseEvent) {
      const delta = (moveEvent.clientY - startY) / scale;
      const newHeight = Math.max(40, currentHeight + delta);
      if (el) el.style.height = `${newHeight * scale}px`;
    }

    function handleMouseUp(upEvent: MouseEvent) {
      const delta = (upEvent.clientY - startY) / scale;
      const newHeight = Math.max(40, currentHeight + delta);
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
          ref={canvasWrapperRef}
          className={`mx-auto flex flex-col transition-[max-width] duration-300 ease-in-out rounded overflow-hidden ${DEVICE_WIDTHS[previewDevice]}`}
        >
          {sections.map((section) => {
            const isSelectedSection = selectedSectionId === section.id;
            const hasSelectedComponent = section.components.some((component) => component.id === selectedComponentId);
            const sectionHeight = section.height ?? 0;

            return (
              <div
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                onClick={() => selectSection(section.id)}
                className={`relative w-full overflow-hidden cursor-pointer transition-colors ${
                  isSelectedSection && !hasSelectedComponent
                    ? "z-10 outline-2 outline-blue-500 -outline-offset-2"
                    : "hover:outline hover:outline-(--foreground)/20"
                }`}
                style={{
                  backgroundColor: section.background ?? undefined,
                  height: `${sectionHeight * scale}px`,
                }}
              >
                {/* canvas de referência: sempre CANVAS_REFERENCE_WIDTH de largura, é
                    aqui que x/y/width/height dos components são interpretados sem
                    conversão nenhuma; o transform escala tudo (posição, tamanho,
                    texto) proporcionalmente pra caber na largura real acima */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: CANVAS_REFERENCE_WIDTH,
                    height: sectionHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  {sortedChildren(section.components, null).map((component, index) => {
                    const isSelected = component.id === selectedComponentId;
                    return (
                      <CanvasItem
                        key={component.id}
                        component={component}
                        sectionId={section.id}
                        isSelected={isSelected}
                        zIndex={isSelected ? 1000 : 10 + index}
                        scale={scale}
                      >
                        <RenderedComponent
                          component={component}
                          sectionId={section.id}
                          allComponents={section.components}
                          selectedComponentId={selectedComponentId}
                          selectComponent={selectComponent}
                          fill={component.width != null || component.height != null}
                        />
                      </CanvasItem>
                    );
                  })}
                </div>

                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleResizeStart(e, section.id, sectionHeight);
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
