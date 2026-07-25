"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import Modal from "@/app/dashboard/components/Modal"; // ajuste o caminho conforme sua estrutura
import ConfirmModal from "@/app/dashboard/components/ConfirmModal"; // idem
import ActionsMenu from "@/app/dashboard/components/ActionsMenu"; // idem
import CreateSectionForm from "./components/CreateSectionForm";
import CreateComponentForm from "./components/CreateComponentForm";

import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

interface PageData {
  id: string;
  title: string;
  slug: string;
  color_theme: string | null;
  owner_id: string;
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

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const supabase = createClient();

  const [page, setPage] = useState<PageData | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [componentTargetSectionId, setComponentTargetSectionId] = useState<string | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SectionItem | null>(null);
  const [componentToDelete, setComponentToDelete] = useState<{ id: string; sectionId: string } | null>(null);

  const isOwner = !!ownerId && !!page && ownerId === page.owner_id;

  async function loadSections(pageId: string) {
    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select("id, background, colors, height, position, components (id, type, colors, attributes, position)")
      .eq("page_id", pageId)
      .order("position", { ascending: true });

    if (sectionsError) {
      setError("Não foi possível carregar o conteúdo da página.");
      return;
    }

    const sorted = (sectionsData ?? []).map((section: any) => ({
      ...section,
      components: [...(section.components ?? [])].sort((a: ComponentItem, b: ComponentItem) => a.position - b.position),
    }));

    setSections(sorted as SectionItem[]);
  }

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setOwnerId(user?.id ?? null);

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

  async function handleCreateSection(data: { background: string; height: string }) {
    if (!page) return;

    const nextPosition = sections.length;

    const { error: insertError } = await supabase.from("sections").insert({
      page_id: page.id,
      background: data.background,
      height: data.height,
      colors: {},
      position: nextPosition,
    });

    if (insertError) throw insertError;

    await loadSections(page.id);
    setIsCreateSectionOpen(false);
  }

  async function handleCreateComponent(data: { type: string; attributes: Record<string, any> }) {
    if (!page || !componentTargetSectionId) return;

    const targetSection = sections.find((s) => s.id === componentTargetSectionId);
    const nextPosition = targetSection ? targetSection.components.length : 0;

    const { error: insertError } = await supabase.from("components").insert({
      section_id: componentTargetSectionId,
      type: data.type,
      attributes: data.attributes,
      colors: {},
      position: nextPosition,
    });

    if (insertError) throw insertError;

    await loadSections(page.id);
    setComponentTargetSectionId(null);
  }

  async function handleDeleteSection() {
    if (!sectionToDelete || !page) return;

    const { error: deleteError } = await supabase.from("sections").delete().eq("id", sectionToDelete.id);
    if (deleteError) throw new Error("Erro ao deletar seção");

    await loadSections(page.id);
  }

  async function handleDeleteComponent() {
    if (!componentToDelete || !page) return;

    const { error: deleteError } = await supabase.from("components").delete().eq("id", componentToDelete.id);
    if (deleteError) throw new Error("Erro ao deletar componente");

    await loadSections(page.id);
  }

  if (loading) {
    return <p className="text-sm opacity-80 text-center py-12">Carregando página...</p>;
  }

  if (error || !page) {
    return <p className="text-sm text-red-600 text-center py-12">{error ?? "Página não encontrada."}</p>;
  }

  return (
    <div className="w-full">
      {isOwner && (
        <div className="max-w-[1080px] mx-auto px-4 pt-6 flex items-center justify-between">
          <h1 className="font-press-start text-lg text-[var(--purple)]">{page.title}</h1>
          <button
            onClick={() => setIsCreateSectionOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[var(--purple)] text-white rounded-md font-medium hover:opacity-80 transition-opacity"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3" />
            Add section
          </button>
        </div>
      )}

      {sections.map((section) => (
        <section
          key={section.id}
          style={{
            background: section.colors?.background ?? section.background ?? undefined,
            minHeight: section.height ?? undefined,
          }}
          className="w-full px-4 py-12 flex flex-col gap-4 items-center relative group"
        >
          <div className="max-w-[1080px] w-full flex flex-col gap-4">
            {section.components.map((component) => (
              <div key={component.id} className="relative">
                <RenderComponent component={component} />
                {isOwner && (
                  <div className="absolute top-0 right-0">
                    <ActionsMenu
                      options={[
                        {
                          label: "Excluir",
                          icon: faTrash,
                          danger: true,
                          onClick: () => setComponentToDelete({ id: component.id, sectionId: section.id }),
                        },
                      ]}
                    />
                  </div>
                )}
              </div>
            ))}

            {isOwner && (
              <button
                onClick={() => setComponentTargetSectionId(section.id)}
                className="cursor-pointer self-start flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--background-secondary)] border border-[var(--foreground)]/10 rounded-md hover:opacity-80 transition-opacity"
              >
                <FontAwesomeIcon icon={faPlus} className="w-2" />
                Add component
              </button>
            )}
          </div>

          {isOwner && (
            <div className="absolute top-2 right-4">
              <ActionsMenu
                options={[
                  {
                    label: "Excluir seção",
                    icon: faTrash,
                    danger: true,
                    onClick: () => setSectionToDelete(section),
                  },
                ]}
              />
            </div>
          )}
        </section>
      ))}

      {sections.length === 0 && (
        <p className="text-sm opacity-80 text-center py-12">
          This page does not have any sections yet.
          {isOwner && ' Click "Add section" to get started..'}
        </p>
      )}

      <Modal isOpen={isCreateSectionOpen} onClose={() => setIsCreateSectionOpen(false)} title="Nova seção">
        <CreateSectionForm onSubmit={handleCreateSection} onCancel={() => setIsCreateSectionOpen(false)} />
      </Modal>

      <Modal isOpen={!!componentTargetSectionId} onClose={() => setComponentTargetSectionId(null)} title="Novo componente">
        <CreateComponentForm onSubmit={handleCreateComponent} onCancel={() => setComponentTargetSectionId(null)} />
      </Modal>

      <ConfirmModal
        isOpen={!!sectionToDelete}
        onClose={() => setSectionToDelete(null)}
        onConfirm={handleDeleteSection}
        title="Excluir seção"
        description="Tem certeza que deseja excluir essa seção? Todos os componentes dentro dela também serão apagados."
        confirmLabel="Excluir"
        danger
      />

      <ConfirmModal
        isOpen={!!componentToDelete}
        onClose={() => setComponentToDelete(null)}
        onConfirm={handleDeleteComponent}
        title="Excluir componente"
        description="Tem certeza que deseja excluir esse componente?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  );
}
