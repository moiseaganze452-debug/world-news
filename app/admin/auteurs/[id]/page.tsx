import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { updateAuthorAction } from "@/lib/actions/author-actions";
import { AuthorForm } from "@/components/admin/author-form";

export const metadata = { title: "Modifier l'auteur" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAuthorPage({ params }: PageProps) {
  const { id } = await params;

  const [author, otherUsers] = await Promise.all([
    prisma.author.findUnique({ where: { id } }),
    prisma.user.findMany({
      where: { author: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  if (!author) notFound();

  const updateWithId = updateAuthorAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Modifier {author.displayName}</h1>
      </div>

      <AuthorForm
        action={updateWithId}
        userOptions={[
          { id: author.userId, name: author.displayName, email: author.professionalEmail ?? "" },
          ...otherUsers,
        ]}
        defaultValues={{
          userId: author.userId,
          displayName: author.displayName,
          bio: author.bio ?? undefined,
          photo: author.photo ?? undefined,
          professionalEmail: author.professionalEmail ?? undefined,
          position: author.position ?? undefined,
          specialty: author.specialty ?? undefined,
          facebookUrl: author.facebookUrl ?? undefined,
          twitterUrl: author.twitterUrl ?? undefined,
          linkedinUrl: author.linkedinUrl ?? undefined,
          instagramUrl: author.instagramUrl ?? undefined,
        }}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
