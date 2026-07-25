"use client";

import { logout } from "@/app/auth/actions";
import { useUser } from "../hooks/useUser";

export default function DashboardPage() {
  const { user, profile, loading } = useUser();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-press-start">Dashboard</h1>

      <div className="mt-4">
        <p>Email: {user?.email}</p>
        <p>ID: {user?.id}</p>
        <p>Created at: {user?.created_at && new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
        <p>Plan: {profile?.plan}</p>
      </div>

      <form className="mt-4">
        <button formAction={logout} className="bg-red-500 text-white p-2">
          Sair
        </button>
      </form>
    </div>
  );
}
