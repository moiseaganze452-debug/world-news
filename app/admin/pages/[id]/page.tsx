import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { updatePageAction } from "@/lib/actions/page-actions";
import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Modifier la page" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: PageProps) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  const updateWithId = updatePageAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Modifier « {page.title} »</h1>
      </div>

      <PageForm
        action={updateWithId}
        defaultValues={{
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status,
          seoTitle: page.seoTitle ?? undefined,
          seoDescription: page.seoDescription ?? undefined,
        }}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
