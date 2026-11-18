import { createPageAction } from "@/lib/actions/page-actions";
import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Nouvelle page" };

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouvelle page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Créez une page personnalisée (à propos, contact, mentions légales...).
        </p>
      </div>

      <PageForm action={createPageAction} submitLabel="Créer la page" />
    </div>
  );
}
