import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

/**
 * Layout appliqué à TOUTES les routes /admin/*, y compris /admin/connexion
 * puisqu'en App Router les layouts s'empilent par dossier physique et que
 * les groupes de routes entre parenthèses n'y échappent pas.
 *
 * On détecte donc explicitement les pages d'authentification publiques
 * (connexion, mot de passe oublié, réinitialisation) via le pathname pour
 * leur éviter la sidebar et le contrôle de session (qui les redirigerait
 * en boucle vers /admin/connexion). Le middleware (middleware.ts) reste la
 * protection principale ; ce garde est une seconde ligne de défense.
 */
const PUBLIC_ADMIN_PATHS = [
  "/admin/connexion",
  "/admin/mot-de-passe-oublie",
  "/admin/reinitialiser-mot-de-passe",
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isPublicAuthPage = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  const session = await auth();
  if (!session) {
    redirect("/admin/connexion");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar role={session.user.role} userName={session.user.name ?? ""} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
