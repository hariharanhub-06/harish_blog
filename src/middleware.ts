import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Simple IP-based rate limiter (Edge-compatible, resets on cold start) ──────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;      // requests
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

const PUBLIC_RATE_LIMITED_PATHS = [
  "/api/chat",
  "/api/contact",
  "/api/feedback",
  "/api/heart",
  "/api/analytics",
];

const ALLOWED_LUCKY_DRAW_PATHS = [
  "/lucky-draw",
  "/api/lucky-draw",
  "/api/imagekit-auth",
  "/_next",
  "/favicon",
];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ── Lucky-draw-only mode ─────────────────────────────────────────────────────
  if (process.env.LUCKY_DRAW_ONLY === "true") {
    if (path === "/" || path === "") {
      return NextResponse.redirect(new URL("/lucky-draw", req.url));
    }
    const allowed = ALLOWED_LUCKY_DRAW_PATHS.some((p) => path.startsWith(p));
    if (allowed) return NextResponse.next();
    return new NextResponse("Not found", { status: 404 });
  }

  // ── Rate limiting for public AI/contact endpoints ────────────────────────────
  if (PUBLIC_RATE_LIMITED_PATHS.some((p) => path.startsWith(p))) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Admin page protection is handled client-side in the dashboard component
  // (Firebase auth users have no server-accessible session cookie)

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
