import { prisma } from "@/lib/db/prisma";
import { createAuthorAction } from "@/lib/actions/author-actions";
import { AuthorForm } from "@/components/admin/author-form";

export const metadata = { title: "Nouvel auteur" };

export default async function NewAuthorPage() {
  // Seuls les utilisateurs qui n'ont pas encore de profil auteur sont proposés.
  const users = await prisma.user.findMany({
    where: { author: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouvel auteur</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crée le profil éditorial public associé à un compte utilisateur existant.
        </p>
      </div>

      <AuthorForm action={createAuthorAction} userOptions={users} submitLabel="Créer l'auteur" />
    </div>
  );
}
