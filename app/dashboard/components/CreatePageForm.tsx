// Este componente renderiza o formulário para criar uma nova página.

"use client";

import { useState } from "react";
import { createClient } from "@/app/utils/supabase/client"; // ajuste o caminho conforme seu projeto

// Gera um slug simples a partir do título (letras minúsculas, números e hífens)
// Converte um título em um slug amigável para a URL da página.
function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type ColorTheme = {
  id: string;
  name: string;
};

interface CreatePageFormProps {
  ownerId: string;
  colorThemes?: ColorTheme[]; // opcional: passe as opções de colorThemes já cadastradas
  onCreated?: (page: { id: string; slug: string }) => void;
  onCancel?: () => void; // opcional: mostra um botão "Cancelar" ao lado do submit (útil em modais)
}

export default function CreatePageForm({ ownerId, onCreated, onCancel }: CreatePageFormProps) {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualiza o título e gera automaticamente o slug enquanto o usuário digita.
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEditedManually) {
      setSlug(slugify(value));
    }
  }

  // Permite que o slug seja editado manualmente pelo usuário.
  function handleSlugChange(value: string) {
    setSlugEditedManually(true);
    setSlug(slugify(value));
  }

  // Cria a página no banco e notifica o componente pai quando a operação termina.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Give your page a title.");
      return;
    }
    if (!slug.trim()) {
      setError("The slug cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from("pages")
        .insert({
          owner_id: ownerId,
          title: title.trim(),
          slug,
        })
        .select("id, slug")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          setError("This slug is already in use. Try another one.");
        } else {
          setError("Unable to create the page. Please try again.");
        }
        return;
      }

      onCreated?.(data);
      setTitle("");
      setSlug("");
      setSlugEditedManually(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Page title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Eg.: My portfolio"
          className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium">
          Page address
        </label>
        <div className="flex items-center bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md overflow-hidden">
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="my-portfolio"
            className="flex-1 px-3 py-2 outline-none"
          />
          <span className="px-3 py-2 mr-0.5 text-sm bg-[var(--foreground)]/10 rounded-r-sm whitespace-nowrap">
            .masimaker.com
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer flex-1 bg-[var(--background-secondary)] hover:opacity-80 transition-opacity rounded-md px-4 py-2 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer flex-1 bg-[var(--purple)] hover:opacity-80 transition-opacity text-white rounded-md px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create page"}
        </button>
      </div>
    </form>
  );
}
