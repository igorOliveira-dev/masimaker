import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/middleware";

const ROOT_DOMAIN = "masimaker.com";
const RESERVED_SUBDOMAINS = ["www", "app", "api"];

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  const hostname = host.split(":")[0]; // remove a porta (ex.: localhost:3000)

  const isLocalhost = hostname.endsWith(".localhost") || hostname === "localhost";

  let subdomain: string | null = null;

  if (isLocalhost) {
    const parts = hostname.split(".");
    if (parts.length > 1) subdomain = parts[0];
  } else if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, "");
  }

  const isUserSubdomain = !!subdomain && !RESERVED_SUBDOMAINS.includes(subdomain) && hostname !== ROOT_DOMAIN;

  // subdomínio de usuário (ex.: joao.masimaker.com) -> reescreve pra /sites/joao
  if (isUserSubdomain) {
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // domínio principal (app.masimaker.com, masimaker.com, etc.) -> segue o fluxo normal
  // de atualização de sessão do Supabase
  return await createClient(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
