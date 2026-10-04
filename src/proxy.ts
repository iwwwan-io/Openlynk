import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PLATFORM_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "openlynk.id",
  "www.openlynk.id",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();

  // Test domain override (header atau query param untuk development/testing)
  const testDomain =
    request.headers.get("x-custom-domain-override") ||
    request.nextUrl.searchParams.get("__custom_domain");

  const effectiveHost = testDomain ? testDomain.toLowerCase() : hostname;

  const isPlatform =
    PLATFORM_DOMAINS.includes(effectiveHost) ||
    effectiveHost.endsWith(".vercel.app") ||
    (process.env.NEXT_PUBLIC_APP_DOMAIN &&
      (effectiveHost === process.env.NEXT_PUBLIC_APP_DOMAIN ||
        effectiveHost.endsWith(`.${process.env.NEXT_PUBLIC_APP_DOMAIN}`)));

  // 1. Proteksi rute dashboard: hanya user login yang dapat mengakses
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("openlynk_session")?.value;
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("x-admin-token") ||
      request.headers.get("x-session-token");

    if (!sessionCookie && !authHeader) {
      const loginUrl = new URL("/masuk", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Custom Domain Routing
  if (!isPlatform) {
    const isGlobalRoute =
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/uploads") ||
      pathname.startsWith("/masuk") ||
      pathname.startsWith("/daftar") ||
      pathname.startsWith("/akses") ||
      pathname.startsWith("/dashboard") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml";

    if (!isGlobalRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-custom-domain", effectiveHost);

      const rewriteUrl = new URL(`/domain/${effectiveHost}${pathname}`, request.url);
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded media in public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
