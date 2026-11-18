import { listMedia } from "@/services/media-service";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { MediaGrid } from "@/components/admin/media-grid";

export const metadata = { title: "Médiathèque" };

export default async function MediasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const { items, totalPages } = await listMedia({ page });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Médiathèque</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Images, vidéos et documents réutilisables dans vos articles et pages.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Ajouter un média</h2>
        <MediaUploadForm />
      </div>

      <MediaGrid
        items={items.map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          type: m.type,
          altText: m.altText,
          title: m.title,
        }))}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
