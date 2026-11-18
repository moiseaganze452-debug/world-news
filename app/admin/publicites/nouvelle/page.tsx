import { createAdAction } from "@/lib/actions/advertisement-actions";
import { AdForm } from "@/components/admin/ad-form";

export const metadata = { title: "Nouvelle publicité" };

export default function NewAdPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouvelle publicité</h1>
      </div>

      <AdForm action={createAdAction} submitLabel="Créer la publicité" />
    </div>
  );
}
