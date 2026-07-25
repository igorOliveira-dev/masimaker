// Landing page do MasiMaker
// Nada de backend, login, dashboard, etc. apenas uma landing page simples com links para login e dashboard.
// Porta de entrada do app, com informações sobre o que é o MasiMaker e como ele funciona.

import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const templates = [
  {
    label: "Companhia aérea",
    tint: "bg-[#5B4FE8]",
    tintSoft: "bg-[#5B4FE8]/10",
  },
  { label: "Clínica", tint: "bg-[#F2A93B]", tintSoft: "bg-[#F2A93B]/10" },
  { label: "Portfólio", tint: "bg-[#6E9B72]", tintSoft: "bg-[#6E9B72]/10" },
];

const structure = [
  {
    tag: "página",
    dot: "bg-[#5B4FE8]",
    text: "text-[#5B4FE8]",
    title: "Página",
    desc: "O endereço final. Acessada em seu-nome.masimaker.com, reúne todas as seções que você montar.",
  },
  {
    tag: "seção",
    dot: "bg-[#F2A93B]",
    text: "text-[#F2A93B]",
    title: "Seção",
    desc: "Divide a página em blocos — apresentação, serviços, FAQ, contato — e organiza o que fica dentro dela.",
  },
  {
    tag: "componente",
    dot: "bg-[#6E9B72]",
    text: "text-[#6E9B72]",
    title: "Componente",
    desc: "O elemento em si: título, parágrafo, imagem, carrossel, botão. Arrasta, solta, edita.",
  },
];

export default async function Page() {
  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[#F6F4EF] text-[#1A1B2E] [font-family:var(--font-body)]`}
    >
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
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-lg font-bold tracking-tight [font-family:var(--font-display)]">
          Masi Maker
        </span>
        <Link
          href="/auth/login"
          className="text-sm font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B4FE8]"
        >
          Entrar
        </Link>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 md:grid-cols-2 md:items-center md:px-12 md:pt-16">
        <div>
          <span className="mm-block inline-block rounded-full border border-[#DEDAD0] bg-white px-3 py-1 text-xs text-[#5B4FE8] [font-family:var(--font-mono)]">
            seu-nome.masimaker.com
          </span>

          <h1 className="mm-block mt-5 text-4xl font-bold leading-[1.05] tracking-tight [font-family:var(--font-display)] md:text-5xl">
            Sua página, montada em blocos.
          </h1>

          <p className="mm-block mt-5 max-w-md text-base leading-relaxed text-[#4A4B63] [animation-delay:0.08s] md:text-lg">
            O Masi Maker é um editor visual para criar landing pages sem
            escrever uma linha de código. Escolha um template, monte suas seções
            e publique — tudo arrastando componentes prontos.
          </p>

          <div className="mm-block mt-8 flex flex-wrap gap-3 [animation-delay:0.16s]">
            <Link
              href="/auth/register"
              className="rounded-lg bg-[#5B4FE8] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B4FE8]"
            >
              Começar a criar
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-[#DEDAD0] px-5 py-3 text-sm font-semibold transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B4FE8]"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* SIGNATURE: mock browser assembling Página > Seção > Componente */}
        <div className="mm-block mx-auto w-full max-w-md rounded-xl border border-[#DEDAD0] bg-white shadow-sm [animation-delay:0.1s]">
          <div className="flex items-center gap-2 rounded-t-xl border-b border-[#DEDAD0] bg-[#FAF9F6] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DEDAD0]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#DEDAD0]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#DEDAD0]" />
            <span className="ml-2 text-[11px] text-[#8B8A9C] [font-family:var(--font-mono)]">
              clinica-vida.masimaker.com
            </span>
          </div>

          <div className="space-y-3 p-4">
            {/* Seção 1: apresentação */}
            <div className="mm-block space-y-2 rounded-lg bg-[#F6F4EF] p-3 [animation-delay:0.22s]">
              <div className="h-3 w-2/3 rounded bg-[#5B4FE8]" />
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
                <div className="h-10 rounded bg-[#5B4FE8]" />
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
        <h2 className="text-2xl font-bold tracking-tight [font-family:var(--font-display)] md:text-3xl">
          Como funciona
        </h2>
        <p className="mt-2 max-w-lg text-[#4A4B63]">
          Três camadas simples, uma dentro da outra — como uma boneca russa de
          blocos.
        </p>

        <div className="mt-8 rounded-2xl border border-[#DEDAD0] bg-white p-2">
          {structure.map((item, i) => (
            <div
              key={item.tag}
              className={`rounded-xl p-4 md:p-6 ${
                i % 2 === 0 ? "bg-[#FAF9F6]" : "bg-white"
              } ${i === 2 ? "border border-dashed border-[#6E9B7266]" : ""}`}
              style={{ marginLeft: `${i * 20}px` }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                <div className="flex items-center gap-2 md:w-40 md:shrink-0">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  <span
                    className={`text-xs ${item.text} [font-family:var(--font-mono)]`}
                  >
                    {item.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold [font-family:var(--font-display)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 max-w-lg text-sm text-[#4A4B63]">
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
        <h2 className="text-2xl font-bold tracking-tight [font-family:var(--font-display)] md:text-3xl">
          Comece de um template
        </h2>
        <p className="mt-2 max-w-lg text-[#4A4B63]">
          Estruturas prontas para os casos mais comuns — edite tudo depois.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.label}
              className="rounded-xl border border-[#DEDAD0] bg-white p-5 transition-transform hover:-translate-y-1"
            >
              <div className={`h-16 rounded-lg ${t.tintSoft}`}>
                <div className={`h-full w-1/3 rounded-l-lg ${t.tint}`} />
              </div>
              <p className="mt-4 font-semibold [font-family:var(--font-display)]">
                {t.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-[#1A1B2E] px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F6F4EF] [font-family:var(--font-display)]">
              Sua página pode estar no ar hoje.
            </h2>
            <p className="mt-2 text-sm text-[#B9B8C9]">
              Sem código, sem complicação — só montar e publicar.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[#5B4FE8] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Criar minha página
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-[#3A3B54] px-5 py-3 text-sm font-semibold text-[#F6F4EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#DEDAD0] px-6 py-8 text-xs text-[#8B8A9C] md:px-12">
        Masi Maker · masimaker.com
      </footer>
    </div>
  );
}
