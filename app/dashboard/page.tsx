// Esta página exibe a home do dashboard com as páginas do usuário.

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import CreatePageForm from "./components/CreatePageForm";
import Modal from "./components/Modal";
import ConfirmModal from "./components/ConfirmModal";
import ActionsMenu from "./components/ActionsMenu";

import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { ThemeToggleButton } from "../auth/components/ThemeToggleButton";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  color_theme: string | null;
  created_at: string;
}

// Página principal do dashboard que lista, cria e remove páginas do usuário.
export default function MyPages() {
  const supabase = createClient();

  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Estado para o modal de confirmação de exclusão
  const [pageToDelete, setPageToDelete] = useState<PageItem | null>(null);

  // Busca as páginas do usuário no banco e atualiza o estado local para renderização.
  async function loadPages(userId: string) {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("pages")
      .select("id, title, slug, color_theme, created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Your pages could not be loaded.");
    } else {
      setPages(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
// Executa a lógica de init para este arquivo.
    async function init() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You need to be logged in to view your pages.");
        setLoading(false);
        return;
      }

      setOwnerId(user.id);
      loadPages(user.id);
    }
    init();
  }, []);

  // Fecha o modal de criação e recarrega a lista depois de criar uma nova página.
  function handlePageCreated() {
    setIsCreateOpen(false);
    if (ownerId) loadPages(ownerId);
  }

  // Remove a página selecionada e atualiza a lista sem recarregar a tela inteira.
  async function handleDeletePage() {
    if (!pageToDelete) return;

    const { error: deleteError } = await supabase
      .from("pages")
      .delete()
      .eq("id", pageToDelete.id);

    if (deleteError) {
      throw new Error("Error deleting the page");
    }

    // Atualiza a lista localmente sem precisar recarregar tudo do banco
    setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
  }

  return (
    <div className="max-w-[1080px] w-full mx-auto px-4 py-8 pt-28">
      <header className=" top-0 left-0 w-full bg-[var(--background-secondary)]/50 backdrop-blur-sm fixed flex items-center justify-between px-6 py-5 md:px-12 z-1">
        <h1 className="text-[var(--purple)] font-press-start text-xl">
          My Pages
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <button
            onClick={() => ownerId && setIsCreateOpen(true)}
            disabled={!ownerId}
            className="cursor-pointer p-1 px-4 bg-[var(--purple)] border-2 rounded-lg  border-[var(--foreground)]/10 hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold text-white">+ Create new page</span>
          </button>
        </div>
      </header>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!loading && pages.length === 0 && (
        <p className="text-sm opacity-80 mt-4 text-center">
          You haven't created any pages yet. Click "Create new" to get started.
        </p>
      )}

      {loading ? (
        <p className="text-sm opacity-80 text-center">Loading pages...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/dashboard/editor/${page.id}`}
              className="w-full border-2 border-[var(--foreground)]/10 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <div
                className="h-32 w-full"
                style={{
                  background: page.color_theme
                    ? `var(--theme-${page.color_theme}-bg, #e5e7eb)`
                    : "#e5e7eb",
                }}
              />
              <div className="px-3 py-2 min-h-16 bg-[var(--background-secondary)] flex items-center justify-between shadow">
                <div>
                  <p className="text-sm font-medium truncate">{page.title}</p>
                  <p className="text-xs opacity-80 truncate">
                    {page.slug}.masimaker.com
                  </p>
                </div>
                <div onClick={(e) => e.preventDefault()}>
                  <ActionsMenu
                    options={[
                      {
                        label: "Edit",
                        icon: faPen,
                        onClick: () => {
                          window.location.href = `/dashboard/editor/${page.id}`;
                        },
                      },
                      {
                        label: "Delete",
                        icon: faTrash,
                        danger: true,
                        onClick: () => {
                          setPageToDelete(page);
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen && !!ownerId}
        onClose={() => setIsCreateOpen(false)}
        title="New page"
      >
        {ownerId && (
          <CreatePageForm
            ownerId={ownerId}
            onCreated={handlePageCreated}
            onCancel={() => setIsCreateOpen(false)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!pageToDelete}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDeletePage}
        title="Delete page"
        description={
          pageToDelete && (
            <>
              Are you sure you want to delete{" "}
              <strong>{pageToDelete.title}</strong>? This action cannot be
              undone.
            </>
          )
        }
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
