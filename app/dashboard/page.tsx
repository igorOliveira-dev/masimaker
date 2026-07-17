import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="mt-4">
        <p>Email: {user?.email}</p>
        <p>ID: {user?.id}</p>
        <p>Criado em: {user?.created_at && new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
      </div>

      <form className="mt-4">
        <button formAction={logout} className="bg-red-500 text-white p-2">
          Sair
        </button>
      </form>
    </div>
  );
}
