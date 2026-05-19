import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_PATHS = [
  "/lucky-draw",
  "/api/lucky-draw",
  "/api/imagekit-auth",
  "/_next",
  "/favicon",
];

export function middleware(req: NextRequest) {
  // Only activates on the lucky-draw-only Vercel project
  if (process.env.LUCKY_DRAW_ONLY !== "true") return NextResponse.next();

  const path = req.nextUrl.pathname;

  // Redirect root to lucky draw page
  if (path === "/" || path === "") {
    return NextResponse.redirect(new URL("/lucky-draw", req.url));
  }

  const allowed = ALLOWED_PATHS.some((p) => path.startsWith(p));
  if (allowed) return NextResponse.next();

  return new NextResponse("Not found", { status: 404 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
