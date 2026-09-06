"use client";

import { useRef } from "react";
import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";

const MIN_SIZE = 20;
const DRAG_THRESHOLD = 4;

type Corner = "nw" | "ne" | "sw" | "se";

const CORNER_CURSOR: Record<Corner, string> = {
  nw: "cursor-nwse-resize",
  se: "cursor-nwse-resize",
  ne: "cursor-nesw-resize",
  sw: "cursor-nesw-resize",
};

const CORNER_POSITION: Record<Corner, string> = {
  nw: "-top-1.5 -left-1.5",
  ne: "-top-1.5 -right-1.5",
  sw: "-bottom-1.5 -left-1.5",
  se: "-bottom-1.5 -right-1.5",
};

export default function CanvasItem({
  component,
  sectionId,
  isSelected,
  zIndex,
  scale,
  children,
}: {
  component: ComponentItem;
  sectionId: string;
  isSelected: boolean;
  zIndex: number;
  // fator de escala visual aplicado pelo ancestral (preview mobile/tablet, ou o
  // site publicado numa viewport menor que a largura de referência) - os deltas
  // de mouse vêm em pixels de tela, então precisam ser divididos pela escala pra
  // virar pixels de referência (o espaço em que x/y/width/height são gravados)
  scale: number;
  children: React.ReactNode;
}) {
  const updateComponentGeometry = useEditorStore((s) => s.updateComponentGeometry);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // arrasta só quando o mouse realmente se move além do threshold - abaixo disso
  // deixa o evento de click nativo se propagar normalmente pro onClick de seleção
  // que já existe em RenderedComponent, sem duplicar/disputar a seleção aqui.
  function handleRootMouseDown(e: React.MouseEvent) {
    const el = rootRef.current;
    if (!el) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = component.x ?? 0;
    const startY = component.y ?? 0;
    let dragging = false;
    let finalX = startX;
    let finalY = startY;

    function handleMouseMove(moveEvent: MouseEvent) {
      const dxScreen = moveEvent.clientX - startClientX;
      const dyScreen = moveEvent.clientY - startClientY;
      if (!dragging && Math.hypot(dxScreen, dyScreen) < DRAG_THRESHOLD) return;
      dragging = true;
      const dx = dxScreen / scale;
      const dy = dyScreen / scale;
      finalX = Math.max(0, startX + dx);
      finalY = Math.max(0, startY + dy);
      if (el) {
        el.style.left = `${finalX}px`;
        el.style.top = `${finalY}px`;
      }
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (!dragging) return;
      updateComponentGeometry(sectionId, component.id, { x: finalX, y: finalY });
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleResizeMouseDown(e: React.MouseEvent, corner: Corner) {
    e.stopPropagation();
    e.preventDefault();

    const el = rootRef.current;
    if (!el) return;

    // getBoundingClientRect() vem em pixels de tela (já com a escala do ancestral
    // aplicada) - divide por scale pra voltar ao espaço de referência, que é onde
    // x/y/width/height são gravados e onde o style do próprio elemento é interpretado
    const rect = el.getBoundingClientRect();
    const parentEl = el.offsetParent as HTMLElement | null;
    const parentRect = parentEl ? parentEl.getBoundingClientRect() : rect;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = (rect.left - parentRect.left) / scale;
    const startY = (rect.top - parentRect.top) / scale;
    const startWidth = rect.width / scale;
    const startHeight = rect.height / scale;

    let finalX = startX;
    let finalY = startY;
    let finalWidth = startWidth;
    let finalHeight = startHeight;

    function handleMouseMove(moveEvent: MouseEvent) {
      const dx = (moveEvent.clientX - startClientX) / scale;
      const dy = (moveEvent.clientY - startClientY) / scale;

      let x = startX;
      let width = startWidth;
      if (corner === "nw" || corner === "sw") {
        width = Math.max(MIN_SIZE, startWidth - dx);
        x = startX + (startWidth - width);
      } else {
        width = Math.max(MIN_SIZE, startWidth + dx);
      }

      let y = startY;
      let height = startHeight;
      if (corner === "nw" || corner === "ne") {
        height = Math.max(MIN_SIZE, startHeight - dy);
        y = startY + (startHeight - height);
      } else {
        height = Math.max(MIN_SIZE, startHeight + dy);
      }

      finalX = x;
      finalY = y;
      finalWidth = width;
      finalHeight = height;

      if (el) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
      }
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      updateComponentGeometry(sectionId, component.id, {
        x: finalX,
        y: finalY,
        width: finalWidth,
        height: finalHeight,
      });
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div
      ref={rootRef}
      onMouseDown={handleRootMouseDown}
      // sem isso, arrastar um component cujo conteúdo tem um <a> ou <img> (Button,
      // Image) dispara o drag nativo do navegador (arrastar link/imagem), que
      // sequestra o mouse e quebra os listeners de mousemove/mouseup do gesto
      onDragStart={(e) => e.preventDefault()}
      className="absolute cursor-move"
      style={{
        left: component.x ?? 0,
        top: component.y ?? 0,
        width: component.width != null ? `${component.width}px` : undefined,
        height: component.height != null ? `${component.height}px` : undefined,
        zIndex,
      }}
    >
      {children}

      {isSelected &&
        (["nw", "ne", "sw", "se"] as Corner[]).map((corner) => (
          <div
            key={corner}
            onMouseDown={(e) => handleResizeMouseDown(e, corner)}
            className={`absolute z-10 h-3 w-3 rounded-full border-2 border-blue-500 bg-white ${CORNER_POSITION[corner]} ${CORNER_CURSOR[corner]}`}
          />
        ))}
    </div>
  );
}
