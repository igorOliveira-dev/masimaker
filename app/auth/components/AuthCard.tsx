// Este componente monta o cartão visual usado nos formulários de autenticação.

// Container visual reutilizável para os cartões dos formulários de login e cadastro.
export function AuthCard({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border rounded-lg mx-4 max-w-lg w-full h-full bg-[var(--background-secondary)]">{children}</div>;
}
