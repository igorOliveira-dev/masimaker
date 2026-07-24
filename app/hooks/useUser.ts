// hooks/useUser.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  email: string;
  plan: string;
  role: string;
  created_at: string;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (error) {
        console.error("Erro ao buscar profile:", error);
      } else {
        setProfile(profileData);
      }

      setLoading(false);
    }

    loadUser();

    // escuta mudanças de auth (login/logout) e atualiza automaticamente
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}
