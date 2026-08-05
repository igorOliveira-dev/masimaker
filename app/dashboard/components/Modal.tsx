// Este componente encapsula o comportamento de um modal genérico na interface.

"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  // Fecha com ESC
  // Garante que o modal feche com Escape e que o scroll do body seja travado enquanto estiver aberto.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    // Trava o scroll do body enquanto o modal está aberto
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className={`bg-[var(--background)] rounded-lg p-6 w-full ${maxWidth} relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );

  // Renderiza no <body> para evitar problemas de z-index/overflow do pai
  return createPortal(modalContent, document.body);
}
