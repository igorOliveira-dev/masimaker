import Link from "next/link";
import { login } from "../actions";
import { SubmitButton } from "../components/SubmitButton";
import { AuthCard } from "../components/AuthCard";
import { ThemeToggleButton } from "../components/ThemeToggleButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute right-4 top-4">
        <ThemeToggleButton />
      </div>
      <AuthCard>
        <h1 className="text-xl font-bold text-center [font-family:var(--font-press-start-2p)]">Login</h1>

        <form action={login} className="flex flex-col gap-2 w-full mt-4 bg-(--background-secondary) p-4 rounded-lg">
          <label htmlFor="email" className="font-semibold [font-family:var(--font-press-start-2p)] text-[12px]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-lg border p-2 bg-(--background-tertiary)"
          />

          <label htmlFor="password" className="font-semibold [font-family:var(--font-press-start-2p)] text-[12px]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-lg border p-2 bg-(--background-tertiary)"
          />

          {params.message && <p className="text-green-600 text-sm mt-2">{params.message}</p>}
          {params.error && <p className="text-red-500 text-sm mt-2">{params.error}</p>}

          <SubmitButton>Log in</SubmitButton>
        </form>

        <p className="mt-4 text-sm text-center [font-family:var(--font-press-start-2p)] text-[9px] tracking-tight">
          New to Masi Maker?{" "}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
