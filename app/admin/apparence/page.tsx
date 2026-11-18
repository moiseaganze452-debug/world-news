import { getSiteTheme } from "@/lib/seo/theme";
import { AppearanceForm } from "@/components/admin/appearance-form";

export const metadata = { title: "Apparence" };

export default async function AppearancePage() {
  const theme = await getSiteTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Apparence</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Identité, couleurs et typographie du site — modifiable ici, appliqué immédiatement, sans toucher au code.
        </p>
      </div>

      <AppearanceForm theme={theme} />
    </div>
  );
}
