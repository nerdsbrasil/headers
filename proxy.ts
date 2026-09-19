import { NextResponse, type NextRequest } from "next/server";

// In production this server is only an image API: the panels (galeria,
// /gradiente, /novo) and the file-writing routes exist for `bun dev` on the
// dev machine and are closed off here. `/render/*` stays reachable only for
// the browser that takes the screenshot, which sends RENDER_API_KEY with
// every request (see lib/render-header.ts).

const KEY = process.env.RENDER_API_KEY;

// Assets the render page itself loads: avatars, icons, logo, fonts, chunks.
const ASSET = /\.(png|jpe?g|svg|webp|avif|ico|css|js|map|woff2?)$/i;

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

function internalOnly(request: NextRequest) {
  // Without a key there is nothing to check against; the deploy docs require one.
  if (!KEY) return NextResponse.next();
  const sent = request.headers.get("x-api-key") ?? request.nextUrl.searchParams.get("key");
  return sent === KEY ? NextResponse.next() : notFound();
}

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const { pathname } = request.nextUrl;

  // The image API checks the key itself and answers with the PNG.
  if (pathname.startsWith("/api/render")) return NextResponse.next();

  // The screenshot target, the header listing used by `bun run export`, and
  // the assets the page pulls in.
  if (pathname.startsWith("/render") || pathname === "/api/headers" || ASSET.test(pathname)) {
    return internalOnly(request);
  }

  return notFound();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
