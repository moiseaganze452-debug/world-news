import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Protège toutes les routes /admin/* : redirige vers la page de connexion
 * si l'utilisateur n'est pas authentifié. Le contrôle fin par permission
 * (quel rôle peut faire quoi) se fait ensuite dans chaque page/Server Action
 * via lib/security/permissions.ts — le middleware ne fait qu'un contrôle
 * "est-ce que quelqu'un est connecté".
 */
const PUBLIC_ADMIN_PATHS = [
  "/admin/connexion",
  "/admin/mot-de-passe-oublie",
  "/admin/reinitialiser-mot-de-passe",
];

export default auth((req: NextRequest & { auth: { user?: { id?: string } } | null }) => {
  const { nextUrl } = req;
  // §8/§71 — un objet session peut exister (JWT valide non expiré) tout en
  // représentant une session révoquée par sessionVersion (voir callback
  // jwt dans lib/auth/config.ts, qui vide user.id dans ce cas). On ne
  // considère donc quelqu'un comme connecté que si un id utilisateur est
  // réellement présent dans la session — jamais sur la seule présence de
  // l'objet `req.auth`.
  const isLoggedIn = !!req.auth?.user?.id;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isPublicAuthPage = PUBLIC_ADMIN_PATHS.some((path) => nextUrl.pathname.startsWith(path));

  if (isAdminRoute && !isPublicAuthPage && !isLoggedIn) {
    const loginUrl = new URL("/admin/connexion", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (nextUrl.pathname === "/admin/connexion" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl.origin));
  }

  // Propage le pathname courant via un header lisible côté Server Components
  // (app/admin/layout.tsx s'en sert pour ne pas appliquer la sidebar/contrôle
  // de session sur la page de connexion elle-même).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/admin/:path*"],
};
