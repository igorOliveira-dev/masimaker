import Link from "next/link";
import { login } from "../actions";
import { SubmitButton } from "../components/SubmitButton";
import { AuthCard } from "../components/AuthCard";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <AuthCard>
        <h1 className="text-xl font-bold text-center">Login</h1>

        <form action={login} className="flex flex-col gap-2 w-full mt-4">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="border p-2" />

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="border p-2" />

          {params.message && <p className="text-green-600 text-sm mt-2">{params.message}</p>}
          {params.error && <p className="text-red-500 text-sm mt-2">{params.error}</p>}

          <SubmitButton>Sign in</SubmitButton>
        </form>

        <p className="mt-4 text-sm text-center">
          New to Masi Maker?{" "}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
