import { prisma } from "@/lib/db/prisma";
import { GeneralSettingsForm } from "@/components/admin/general-settings-form";
import { CommentSettingsForm } from "@/components/admin/comment-settings-form";
import { MaintenanceSettingsForm } from "@/components/admin/maintenance-settings-form";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: [
      "general.siteUrl", "general.contactEmail",
      "comments.autoApprove", "comments.enabled",
      "maintenance.enabled", "maintenance.title", "maintenance.message",
    ] } },
  });

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">Réglages généraux de la plateforme.</p>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-base font-bold text-foreground">Général</h2>
        <GeneralSettingsForm
          defaultValues={{
            siteUrl: map["general.siteUrl"] ?? "",
            contactEmail: map["general.contactEmail"] ?? "",
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-base font-bold text-foreground">Commentaires</h2>
        <CommentSettingsForm
          defaultValues={{
            autoApprove: map["comments.autoApprove"] === "true",
            commentsEnabled: map["comments.enabled"] !== "false",
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-base font-bold text-foreground">Mode maintenance</h2>
        <MaintenanceSettingsForm
          defaultValues={{
            enabled: map["maintenance.enabled"] === "true",
            title: map["maintenance.title"] ?? "Site en maintenance",
            message: map["maintenance.message"] ?? "Nous revenons très bientôt.",
          }}
        />
      </section>
    </div>
  );
}
