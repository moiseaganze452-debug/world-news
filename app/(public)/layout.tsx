import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { MaintenancePage } from "@/components/layout/maintenance-page";

/**
 * Vérifie le mode maintenance (§48) à chaque requête publique. Les
 * administrateurs connectés (n'importe quel rôle avec un compte admin)
 * continuent d'accéder normalement au site public pour pouvoir le vérifier
 * avant réouverture — seuls les visiteurs anonymes voient la page de
 * maintenance. Fait ici plutôt que dans middleware.ts (Edge runtime) car
 * la lecture Prisma nécessite le runtime Node.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [session, maintenanceSettings] = await Promise.all([
    auth(),
    prisma.setting.findMany({
      where: { key: { in: ["maintenance.enabled", "maintenance.title", "maintenance.message"] } },
    }),
  ]);

  const map = Object.fromEntries(maintenanceSettings.map((s) => [s.key, s.value]));
  const maintenanceEnabled = map["maintenance.enabled"] === "true";

  if (maintenanceEnabled && !session) {
    return (
      <MaintenancePage
        title={map["maintenance.title"] || "Site en maintenance"}
        message={map["maintenance.message"] || "Nous revenons très bientôt."}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
