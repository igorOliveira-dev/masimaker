// Esta é a landing page pública do produto.

"use client";

// Landing page do MasiMaker
// Nada de backend, login, dashboard, etc. apenas uma landing page simples com links para login e dashboard.
// Porta de entrada do app, com informações sobre o que é o MasiMaker e como ele funciona.
import Link from "next/link";
import { ThemeToggleButton } from "./auth/components/ThemeToggleButton";

const templates = [
  {
    label: "Airline",
    tint: "bg-[var(--purple)]",
    tintSoft: "bg-[var(--purple)]/10",
  },
  { label: "Clinic", tint: "bg-[#F2A93B]", tintSoft: "bg-[#F2A93B]/10" },
  { label: "Portfolio", tint: "bg-[#6E9B72]", tintSoft: "bg-[#6E9B72]/10" },
];

const structure = [
  {
    tag: "Page",
    dot: "bg-[var(--purple)]",
    text: "text-[var(--purple)]",
    title: "Page ", 
    desc: "The final link. Accessed at your-page-name.masimaker.com, it brings together all the sections you built.",
  },
  {
    tag: "Section",
    dot: "bg-[#F2A93B]",
    text: "text-[#F2A93B]",
    title: "Section",
    desc: "Divide the page into blocks — introduction, services, FAQ, contact — and organize what goes inside them.",
  },
  {
    tag: "Component",
    dot: "bg-[#6E9B72]",
    text: "text-[#6E9B72]",
    title: "Component",
    desc: "The element itself: title, paragraph, image, carousel, button. Drag, drop, edit.",
  },
];

// Página inicial pública que apresenta o produto e encaminha para login ou criação de páginas.
export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <style>{`
@keyframes mm-rise {
from { opacity: 0; transform: translateY(14px); }
to { opacity: 1; transform: translateY(0); }
}
.mm-block { animation: mm-rise 0.6s cubic-bezier(.2,.7,.3,1) both; }
@media (prefers-reduced-motion: reduce) {
.mm-block { animation: none; }
}
`}</style>

      {/* NAV */}
      <header className="w-full bg-[var(--background-secondary)]/50 backdrop-blur-sm fixed flex items-center justify-between px-6 py-5 md:px-12 z-1">
        <span className="text-[var(--purple)] font-bold tracking-tight [font-family:var(--font-press-start-2p)]">
          Masi Maker
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <Link
            href="/auth/login"
            className="bg-[var(--purple)] rounded-lg border border-[var(--purple)]/50 text-white text-[13px] font-medium [font-family:var(--font-press-start-2p)] px-3 py-2 transition-transform hover:bg-[var(--purple)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#711b9f]"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mt-16 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 md:grid-cols-2 md:items-center md:px-12 md:pt-16">
        <div>
          <span className="mm-block inline-block rounded-full border border-[var(--purple)]/50 bg-[var(--purple)]/90 px-3 py-1 text-xs text-white [font-family:var(--font-press-start-2p)] [animation-delay:0.04s]">
            your-page-name.masimaker.com
          </span>

          <h1 className="mm-block mt-5 text-4xl font-bold leading-[1.05] tracking-tight [font-family:var(--font-press-start-2p)] md:text-5xl [var(--purple)]">
            Your page, built in blocks.
          </h1>

          <p className="mm-block mt-5 max-w-md text-base leading-relaxed [var(--foreground)] [animation-delay:0.08s] md:text-lg [font-family:var(--font-roboto)] font-semibold">
            Masi Maker is a visual editor for creating landing pages without
            writing a single line of code. Choose a template, build your sections,
            and publish — all by dragging ready-made components.
          </p>

          <div className="mm-block mt-8 flex flex-wrap gap-3 [animation-delay:0.16s]">
            <Link
              href="/auth/register"
              className="rounded-lg bg-[var(--purple)] px-5 py-3 font-semibold [font-family:var(--font-press-start-2p)] text-white transition-transform hover:-translate-y-0.5 hover:bg-[#71129f]/80  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#711b9f]"
            >
              Start creating
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-[var(--foreground)]/50 px-5 py-3 text-[var(--foreground)] font-semibold [font-family:var(--font-press-start-2p)] transition-colors hover:-translate-y-0.5 hover:bg-[var(--foreground)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B4FE8]"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* SIGNATURE: mock browser assembling Página > Seção > Componente */}
        <div className="mm-block mx-auto w-full max-w-md rounded-xl border border-[#DEDAD0] bg-white shadow-sm [animation-delay:0.1s]">
          <div className="flex items-center gap-2 rounded-t-xl border-b border-[#DEDAD0] bg-[#FAF9F6] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="ml-2 text-[11px] text-[#171717] [font-family:var(--font-press-start-2p)]">
              life-clinic.masimaker.com
            </span>
          </div>

          <div className="space-y-3 p-4">
            {/* Seção 1: apresentação */}
            <div className="mm-block space-y-2 rounded-lg bg-[#F6F4EF] p-3 [animation-delay:0.22s]">
              <div className="h-3 w-2/3 rounded bg-[var(--purple)]" />
              <div className="h-2 w-5/6 rounded bg-[#DEDAD0]" />
              <div className="h-6 w-24 rounded bg-[#1A1B2E]" />
            </div>

            {/* Seção 2: serviços */}
            <div className="mm-block grid grid-cols-3 gap-2 rounded-lg bg-[#F6F4EF] p-3 [animation-delay:0.3s]">
              <div className="space-y-1.5">
                <div className="h-10 rounded bg-[#F2A93B]" />
                <div className="h-1.5 w-3/4 rounded bg-[#DEDAD0]" />
              </div>
              <div className="space-y-1.5">
                <div className="h-10 rounded bg-[#6E9B72]" />
                <div className="h-1.5 w-3/4 rounded bg-[#DEDAD0]" />
              </div>
              <div className="space-y-1.5">
                <div className="h-10 rounded bg-[var(--purple)]" />
                <div className="h-1.5 w-3/4 rounded bg-[#DEDAD0]" />
              </div>
            </div>

            {/* Seção 3: contato */}
            <div className="mm-block space-y-1.5 rounded-lg bg-[#F6F4EF] p-3 [animation-delay:0.38s]">
              <div className="h-2 w-1/2 rounded bg-[#DEDAD0]" />
              <div className="h-6 w-full rounded border border-[#DEDAD0] bg-white" />
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA — hierarquia real do produto */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <h2 className="text-2xl font-bold tracking-tight [font-family:var(--font-press-start-2p)] md:text-3xl">
          How it works
        </h2>
        <p className="mt-2 max-w-lg text-[var(--foreground)] [font-family:var(--font-roboto)] font-semibold">
          Three simple layers, one inside the other — like a Russian nesting doll
          of blocks.
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--foreground)]/10 p-2">
          {structure.map((item, i) => (
            <div
              key={item.tag}
              className={`rounded-xl p-4 md:p-6 ${
                i % 2 === 0 ? "bg-[var(--background-tertiary)]" : "bg-[var(--background-secondary)]"
              } ${i === 2 ? "border-2 border-dashed border-[#63A655]" : ""}`}
              style={{ marginLeft: `${i * 20}px` }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                <div>
                  <h3 className={`font-semibold ${item.text} [font-family:var(--font-press-start-2p)]`}>
                    {item.title}
                  </h3>
                  <p className="mt-1 max-w-lg text-sm text-[var(--foreground)] [font-family:var(--font-roboto)] font-semibold">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <h2 className="text-2xl font-bold tracking-tight [font-family:var(--font-press-start-2p)] md:text-3xl">
          Start from a template
        </h2>
        <p className="mt-2 max-w-lg text-[var(--foreground)] [font-family:var(--font-roboto)] font-semibold">
          Ready-made structures for the most common cases — edit everything later.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.label}
              className="rounded-xl border border-[var(--foreground)]/5 bg-[var(--background-secondary)] p-5 transition-transform hover:bg-[#3A3B54]/20 hover:-translate-y-1"
            >
              <div className={`h-16 rounded-lg ${t.tintSoft}`}>
                <div className={`h-full w-1/3 rounded-l-lg ${t.tint}`} />
              </div>
              <p className="mt-4 font-bold [font-family:var(--font-press-start-2p)]">
                {t.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-[var(--background-secondary)] px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <h2 className="text-1xl font-bold tracking-tight text-[var(--foreground)] [font-family:var(--font-press-start-2p)]">
              Your page can be live today.
            </h2>
            <p className="mt-2 text-sm text-[var(--foreground)] [font-family:var(--font-roboto)] font-semibold">
              No code, no hassle — just build and publish.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/dashboard"
              className=" h-12 rounded-lg bg-[var(--purple)] px-5 py-4 text-[10px] [font-family:var(--font-press-start-2p)] font-semibold text-white transition-transform hover:bg-[var(--purple)]/80 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Create my page
            </Link>
            <Link
              href="/auth/login"
              className="h-12 rounded-lg border border-[var(--foreground)]/30 px-5 py-4 text-[10px] font-semibold [font-family:var(--font-press-start-2p)] text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white hover:bg-[var(--foreground)]/20 transition-transform hover:-translate-y-0.5"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--background-tertiary)]/80 px-6 py-8 text-xs text-[var(--foreground)] md:px-12 [font-family:var(--font-roboto)]">
        Masi Maker · masimaker.com
      </footer>
    </div>
  );
}
