// Este componente cria um menu de ações reutilizável para itens do dashboard.

"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface ActionsMenuOption {
  label: string;
  icon?: IconDefinition;
  onClick: () => void;
  danger?: boolean;
}

interface ActionsMenuPanelProps {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}

// Procura o container de scroll mais próximo para fechar o menu quando a página se mover.
function findScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let parent = el?.parentElement ?? null;
  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

// Renderiza o painel do menu dentro de um portal, posicionando-o perto do botão que o abriu.
function ActionsMenuPanel({
  anchorRef,
  onClose,
  children,
}: ActionsMenuPanelProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [ready, setReady] = useState(false);

  // Calcula a posição ideal do menu para que ele caiba na viewport sem ficar fora da tela.
  useLayoutEffect(() => {
    function updatePosition() {
      if (!anchorRef.current || !menuRef.current) return;

      const margin = 8;
      const gap = 6;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;

      let top: number;
      if (spaceBelow >= menuRect.height + gap || spaceBelow >= spaceAbove) {
        top = anchorRect.bottom + gap;
      } else {
        top = anchorRect.top - menuRect.height - gap;
      }
      top = Math.min(
        Math.max(top, margin),
        viewportHeight - menuRect.height - margin,
      );

      const spaceRightAligned = anchorRect.right - menuRect.width;
      const spaceLeftAligned =
        viewportWidth - (anchorRect.left + menuRect.width);

      let left: number;
      if (spaceRightAligned < margin && spaceLeftAligned >= margin) {
        left = anchorRect.left;
      } else {
        left = anchorRect.right - menuRect.width;
      }
      left = Math.min(
        Math.max(left, margin),
        viewportWidth - menuRect.width - margin,
      );

      setPos({ top, left });
      setReady(true);
    }

    updatePosition();
  }, [anchorRef]);

  useEffect(() => {
    if (!anchorRef.current) return;

    const scrollParent = findScrollParent(anchorRef.current);
    const target: HTMLElement | Window = scrollParent;

    const initialTop =
      scrollParent === window
        ? window.scrollY
        : (scrollParent as HTMLElement).scrollTop;
    const initialLeft =
      scrollParent === window
        ? window.scrollX
        : (scrollParent as HTMLElement).scrollLeft;

    function handleScroll() {
      const currentTop =
        scrollParent === window
          ? window.scrollY
          : (scrollParent as HTMLElement).scrollTop;
      const currentLeft =
        scrollParent === window
          ? window.scrollX
          : (scrollParent as HTMLElement).scrollLeft;

      const dy = Math.abs(currentTop - initialTop);
      const dx = Math.abs(currentLeft - initialLeft);

      if (dy > 4 || dx > 4) {
        onClose();
      }
    }

    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, [anchorRef, onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed rounded-lg border-2 border-[var(--foreground)]/10 bg-[var(--background-secondary)] shadow-lg overflow-hidden z-[9999]"
      style={{
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        visibility: ready ? "visible" : "hidden",
        minWidth: 170,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

interface ActionsMenuProps {
  options: ActionsMenuOption[];
  buttonClassName?: string;
}

//  Botão de 3 pontinhos que abre um menu de ações posicionado via portal,

// Componente principal que controla o botão de três pontinhos e abre o menu de opções.
export default function ActionsMenu({
  options,
  buttonClassName = "",
}: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label="Abrir opções"
        className={`cursor-pointer w-6 h-6 flex items-center justify-center hover:bg-[var(--foreground)]/10 rounded-full transition-colors ${buttonClassName}`}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="w-2 h-2" />
      </button>

      {open && (
        <ActionsMenuPanel anchorRef={btnRef} onClose={() => setOpen(false)}>
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                opt.onClick();
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-3 text-sm text-left cursor-pointer transition-colors hover:bg-[var(--foreground)]/10 ${
                opt.danger ? "text-red-500" : ""
              }`}
            >
              {opt.icon && <FontAwesomeIcon icon={opt.icon} className="w-3" />}
              {opt.label}
            </button>
          ))}
        </ActionsMenuPanel>
      )}
    </>
  );
}
