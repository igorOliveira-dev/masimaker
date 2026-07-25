import { createClient } from "@/app/utils/supabase/server"; // versão server-side do client
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface ComponentItem {
  id: string;
  type: string;
  colors: Record<string, string>;
  attributes: Record<string, any>;
  position: number;
}

interface SectionItem {
  id: string;
  background: string | null;
  colors: Record<string, string>;
  height: string | null;
  position: number;
  components: ComponentItem[];
}

function RenderComponent({ component }: { component: ComponentItem }) {
  const style = {
    color: component.colors?.text,
    backgroundColor: component.colors?.background,
  };

  switch (component.type) {
    case "title":
      return (
        <h2 style={style} className="text-2xl font-semibold">
          {component.attributes?.text ?? ""}
        </h2>
      );
    case "paragraph":
      return (
        <p style={style} className="text-base opacity-90">
          {component.attributes?.text ?? ""}
        </p>
      );
    case "image":
      return <img src={component.attributes?.src} alt={component.attributes?.alt ?? ""} className="max-w-full rounded-md" />;
    case "button":
      return (
        <a
          href={component.attributes?.href ?? "#"}
          style={style}
          className="inline-block px-4 py-2 rounded-md font-medium bg-[var(--purple)] text-white"
        >
          {component.attributes?.label ?? "Button"}
        </a>
      );
    default:
      return null;
  }
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

  console.log("SLUG BUSCADO:", slug);
  console.log("PAGE:", page);
  console.log("PAGE ERROR:", pageError);

  if (pageError || !page) {
    notFound();
  }

  const { data: sectionsData } = await supabase
    .from("sections")
    .select("id, background, colors, height, position, components (id, type, colors, attributes, position)")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  const sections: SectionItem[] = (sectionsData ?? []).map((section: any) => ({
    ...section,
    components: [...(section.components ?? [])].sort((a: ComponentItem, b: ComponentItem) => a.position - b.position),
  }));

  return (
    <div className="w-full">
      {sections.map((section) => (
        <section
          key={section.id}
          style={{
            background: section.colors?.background ?? section.background ?? undefined,
            minHeight: section.height ?? undefined,
          }}
          className="w-full px-4 py-12 flex flex-col gap-4 items-center"
        >
          <div className="max-w-[1080px] w-full flex flex-col gap-4">
            {section.components.map((component) => (
              <RenderComponent key={component.id} component={component} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
