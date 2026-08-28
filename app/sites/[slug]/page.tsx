import { createClient } from "@/app/utils/supabase/server"; // versão server-side do client
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ComponentItem } from "@/app/stores/editorStore";
import { componentRegistry, isContainer } from "@/app/dashboard/editor/[id]/blocks";

interface SectionItem {
  id: string;
  background: string | null;
  height: number | null;
  position: number;
  components: ComponentItem[];
}

function sortedChildren(components: ComponentItem[], parentId: string | null) {
  return components.filter((c) => c.parentComponentId === parentId).sort((a, b) => a.position - b.position);
}

function RenderComponentTree({ component, allComponents }: { component: ComponentItem; allComponents: ComponentItem[] }) {
  const def = componentRegistry[component.type as keyof typeof componentRegistry];
  if (!def) return null;

  const { Component } = def;

  return (
    <Component component={component}>
      {isContainer(component.type)
        ? sortedChildren(allComponents, component.id).map((child) => (
            <RenderComponentTree key={child.id} component={child} allComponents={allComponents} />
          ))
        : null}
    </Component>
  );
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
      "id, background, height, position, components (id, type, colors, attributes, position, parent_component_id)",
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
        <div
          key={section.id}
          style={{
            backgroundColor: section.background ?? undefined,
            minHeight: section.height ? `${section.height}px` : undefined,
          }}
          className="w-full"
        >
          <div className="max-w-[1280px] mx-auto">
            {sortedChildren(section.components, null).map((component) => (
              <RenderComponentTree key={component.id} component={component} allComponents={section.components} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
