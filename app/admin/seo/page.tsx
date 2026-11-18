import { prisma } from "@/lib/db/prisma";
import { SeoSettingsForm } from "@/components/admin/seo-settings-form";

export const metadata = { title: "SEO" };

export default async function SeoPage() {
  const settings = await prisma.seoSetting.findFirst();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paramètres SEO globaux. Chaque article possède aussi ses propres réglages SEO, modifiables depuis sa page d'édition.
        </p>
      </div>

      <SeoSettingsForm
        defaultValues={{
          globalTitle: settings?.globalTitle ?? undefined,
          globalDescription: settings?.globalDescription ?? undefined,
          keywords: settings?.keywords ?? undefined,
          ogImageUrl: settings?.ogImageUrl ?? undefined,
          googleVerification: settings?.googleVerification ?? undefined,
          bingVerification: settings?.bingVerification ?? undefined,
          analyticsId: settings?.analyticsId ?? undefined,
          robotsConfig: settings?.robotsConfig ?? undefined,
        }}
      />
    </div>
  );
}
