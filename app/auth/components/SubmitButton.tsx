// Este componente exibe o botão de envio com estado de carregamento para os formulários de auth.

"use client";

import { useFormStatus } from "react-dom";

// Botão de envio com estado de carregamento para formulários de autenticação.
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[var(--purple)] [font-family:var(--font-press-start-2p)] text-[12px] text-white p-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--purple)]/80 transition-colors"
    >
      {pending ? "Loading..." : children}
    </button>
  );
}
