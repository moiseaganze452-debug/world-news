import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { updateAdAction } from "@/lib/actions/advertisement-actions";
import { AdForm } from "@/components/admin/ad-form";

export const metadata = { title: "Modifier la publicité" };

interface PageProps {
  params: Promise<{ id: string }>;
}

function toDateInputValue(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
}

export default async function EditAdPage({ params }: PageProps) {
  const { id } = await params;
  const ad = await prisma.advertisement.findUnique({ where: { id } });
  if (!ad) notFound();

  const updateWithId = updateAdAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Modifier « {ad.name} »</h1>
      </div>

      <AdForm
        action={updateWithId}
        defaultValues={{
          name: ad.name,
          placement: ad.placement,
          imageUrl: ad.imageUrl ?? undefined,
          linkUrl: ad.linkUrl ?? undefined,
          htmlCode: ad.htmlCode ?? undefined,
          scriptCode: ad.scriptCode ?? undefined,
          startDate: toDateInputValue(ad.startDate),
          endDate: toDateInputValue(ad.endDate),
          status: ad.status,
        }}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
