import Link from "next/link";
import { signup } from "../actions";
import { SubmitButton } from "../components/SubmitButton";
import { AuthCard } from "../components/AuthCard";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <AuthCard>
        <h1 className="text-xl font-bold text-center">Criar conta</h1>

        <form action={signup} className="flex flex-col gap-2 mt-4 max-w-xs">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="border p-2" />

          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" required className="border p-2" />

          {params.error && <p className="text-red-500 text-sm mt-2">{params.error}</p>}

          <SubmitButton>Cadastrar</SubmitButton>
        </form>

        <p className="mt-4 text-sm text-center">
          Já tem conta?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Fazer login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
