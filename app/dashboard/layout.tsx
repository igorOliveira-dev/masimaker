// Este arquivo define o layout compartilhado das rotas do dashboard.

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
