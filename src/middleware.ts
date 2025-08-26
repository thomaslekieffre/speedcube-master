import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Pages publiques (pas besoin d'auth)
  const publicPages = ["/", "/login", "/sign-up"];
  const isPublicPage = publicPages.some(
    (page) =>
      request.nextUrl.pathname === page ||
      request.nextUrl.pathname.startsWith(page + "/")
  );

  // Vérifier si l'utilisateur est connecté (via cookie Clerk)
  const hasAuthCookie = request.cookies.has("__session");

  // Si pas connecté et pas sur une page publique, rediriger vers login
  if (!hasAuthCookie && !isPublicPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
