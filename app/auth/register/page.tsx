// Esta página renderiza a tela de cadastro do usuário.

import Link from "next/link";
import { signup } from "../actions";
import { SubmitButton } from "../components/SubmitButton";
import { AuthCard } from "../components/AuthCard";
import { ThemeToggleButton } from "../components/ThemeToggleButton";

// Tela de cadastro com formulário para criar uma conta nova no sistema.
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute right-4 top-4">
        <ThemeToggleButton />
      </div>
      <AuthCard>
        <h1 className="text-xl font-bold text-center [font-family:var(--font-press-start-2p)]">Create account</h1>

        <form action={signup} className="flex flex-col gap-2 w-full mt-4 bg-[var(--background-secondary)] p-4 rounded-lg">
          <label htmlFor="email" className="font-semibold [font-family:var(--font-press-start-2p)] text-[12px]">
            Email
          </label>
          <input id="email" name="email" type="email" required className="rounded-lg border p-2 bg-[var(--background-tertiary)]" />

          <label htmlFor="password" className="font-semibold [font-family:var(--font-press-start-2p)] text-[12px]">
            Password
          </label>
          <input id="password" name="password" type="password" required className="rounded-lg border p-2 bg-[var(--background-tertiary)]" />

          {params.error && <p className="text-red-500 text-sm mt-2">{params.error}</p>}

          <SubmitButton>Sign up</SubmitButton>
        </form>

        <p className="mt-4 text-sm text-center [font-family:var(--font-press-start-2p)] text-[9px] tracking-tight">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
