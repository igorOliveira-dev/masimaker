"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentItem } from "@/app/stores/editorStore";
import { componentRegistry, isContainer } from "@/app/dashboard/editor/[id]/blocks";
import { CANVAS_REFERENCE_WIDTH } from "@/app/constants/canvas";

interface SectionCanvasProps {
  background: string | null;
  height: number | null;
  components: ComponentItem[];
}

function sortedChildren(components: ComponentItem[], parentId: string | null) {
  return components.filter((c) => c.parentComponentId === parentId).sort((a, b) => a.position - b.position);
}

function RenderComponentTree({ component, allComponents }: { component: ComponentItem; allComponents: ComponentItem[] }) {
  const def = componentRegistry[component.type as keyof typeof componentRegistry];
  if (!def) return null;

  const { Component } = def;

  return (
    <Component component={component}>
      {isContainer(component.type)
        ? sortedChildren(allComponents, component.id).map((child) => (
            <RenderComponentTree key={child.id} component={child} allComponents={allComponents} />
          ))
        : null}
    </Component>
  );
}

// espelha a mesma lógica de escala do preview do editor (PagePreview.tsx): mede a
// largura real disponível (viewport do visitante) e escala o canvas de referência
// (sempre CANVAS_REFERENCE_WIDTH) proporcionalmente, pra x/y/width/height baterem
// com o que foi editado
export default function SectionCanvas({ background, height, components }: SectionCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_REFERENCE_WIDTH);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setCanvasWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = canvasWidth > 0 ? canvasWidth / CANVAS_REFERENCE_WIDTH : 1;
  const sectionHeight = height ?? 0;

  return (
    <div style={{ backgroundColor: background ?? undefined }} className="w-full">
      <div ref={wrapperRef} className="max-w-[1280px] mx-auto relative overflow-hidden" style={{ height: sectionHeight * scale }}>
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
          {sortedChildren(components, null).map((component, index) => (
            <div
              key={component.id}
              style={{
                position: "absolute",
                left: component.x ?? 0,
                top: component.y ?? 0,
                width: component.width != null ? `${component.width}px` : undefined,
                height: component.height != null ? `${component.height}px` : undefined,
                zIndex: 10 + index,
              }}
            >
              {component.height != null ? (
                <div style={{ height: "100%" }}>
                  <RenderComponentTree component={component} allComponents={components} />
                </div>
              ) : (
                <RenderComponentTree component={component} allComponents={components} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
