// Esta página carrega a page selecionada e suas sections para o editor.

"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import { useState } from "react";

import EditorHeader from "./components/EditorHeader";
import Toolbar from "./components/Toolbar";
import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";
import PagePreview from "./components/PagePreview";
import Inspector from "./components/Inspector";

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const supabase = createClient();

  // estado que só essa página usa (loading/error), fica local mesmo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pega do store só o que precisa: `page` pra renderizar o header,
  // e as actions pra popular o estado depois do fetch
  const page = useEditorStore((s) => s.page);
  const setPage = useEditorStore((s) => s.setPage);
  const setSections = useEditorStore((s) => s.setSections);

  // Busca as sections da página no banco e prepara o estado do editor para renderização.
  async function loadSections(pageId: string) {
    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select(
        "id, background, colors, height, position, components (id, type, colors, attributes, position)",
      )
      .eq("page_id", pageId)
      .order("position", { ascending: true });

    if (sectionsError) {
      setError("Unable to load the page content.");
      return;
    }

    const sorted = (sectionsData ?? []).map((section: any) => ({
      ...section,
      components: [...(section.components ?? [])].sort(
        (a: ComponentItem, b: ComponentItem) => a.position - b.position,
      ),
    }));

    setSections(sorted);
  }

  // Carrega a página e suas sections quando o id muda na URL.
  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      setError(null);

      const { data: pageData, error: pageError } = await supabase
        .from("pages")
        .select("id, title, slug, color_theme, owner_id")
        .eq("id", params.id)
        .single();

      if (pageError || !pageData) {
        setError("Página não encontrada.");
        setLoading(false);
        return;
      }

      setPage(pageData);
      await loadSections(pageData.id);
      setLoading(false);
    }

    load();
  }, [params?.id]);

  if (loading) {
    return (
      <p className="text-sm opacity-80 text-center py-12">Loading page...</p>
    );
  }

  if (error || !page) {
    return (
      <p className="text-sm text-red-600 text-center py-12">
        {error ?? "Page not found."}
      </p>
    );
  }

  return (
    <div className="w-full">
      <EditorHeader />
      <main className="h-[calc(100dvh-64px)] overflow-hidden flex">
        <Toolbar />
        <PagePreview />
        <Inspector />
      </main>
    </div>
  );
}
