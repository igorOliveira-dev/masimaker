"use client";

import { useState } from "react";
import Modal from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean; // deixa o botão de confirmar vermelho (ex.: exclusão)
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError("Não foi possível concluir a ação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return; // evita fechar no meio de uma ação em andamento
    setError(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="flex flex-col gap-4">
        {description && <p className="text-sm opacity-80">{description}</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="cursor-pointer flex-1 bg-[var(--background-secondary)] hover:opacity-80 transition-opacity rounded-md px-4 py-2 font-medium disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`cursor-pointer flex-1 ${
              danger ? "bg-red-600" : "bg-[var(--purple)]"
            } hover:opacity-80 transition-opacity text-white rounded-md px-4 py-2 font-medium disabled:opacity-50`}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
