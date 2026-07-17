// Landing page do MasiMaker
// Nada de backend, login, dashboard, etc. apenas uma landing page simples com links para login e dashboard.
// Será a porta de entrada do app, com informações sobre o que é o MasiMaker e como ele funciona.

import Link from "next/link";

export default async function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-xl font-bold">Masi Maker</h1>
      <div className="flex gap-4 mt-4">
        <Link href="/auth/login" className="text-blue-500 hover:underline">
          login
        </Link>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          dashboard
        </Link>
      </div>
    </div>
  );
}
