import { createClient } from "@/app/utils/supabase/server"; // versão server-side do client
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ComponentItem } from "@/app/stores/editorStore";
import SectionCanvas from "./SectionCanvas";

interface SectionItem {
  id: string;
  background: string | null;
  height: number | null;
  position: number;
  components: ComponentItem[];
}

export default async function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // <- unwrap aqui

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, title, slug, color_theme")
    .eq("slug", slug)
    .single();

  if (pageError || !page) {
    notFound();
  }

  const { data: sectionsData } = await supabase
    .from("sections")
    .select(
      "id, background, height, position, components (id, type, colors, attributes, position, parent_component_id, x, y, width, height)",
    )
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  const sections: SectionItem[] = (sectionsData ?? []).map((section) => ({
    ...section,
    components: (section.components ?? []).map((c) => ({
      ...c,
      parentComponentId: c.parent_component_id ?? null,
    })),
  }));

  return (
    <div className="w-full">
      {sections.map((section) => (
        <SectionCanvas
          key={section.id}
          background={section.background}
          height={section.height}
          components={section.components}
        />
      ))}
    </div>
  );
}
