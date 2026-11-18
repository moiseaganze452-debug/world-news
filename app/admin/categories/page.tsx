import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryRow } from "@/components/admin/category-row";

export const metadata = { title: "Catégories" };

export default async function CategoriesPage() {
  const session = await auth();
  const canManage = can(session?.user.role, "categories.manage");

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } }, parent: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les rubriques du site. Modifiable ici sans toucher au code.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Parent</th>
                <th className="px-4 py-3 font-medium">Articles</th>
                {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune catégorie pour le moment.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={{
                      id: category.id,
                      name: category.name,
                      slug: category.slug,
                      parentName: category.parent?.name ?? null,
                      articleCount: category._count.articles,
                      color: category.color,
                    }}
                    canManage={canManage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {canManage && (
          <div className="h-fit rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Nouvelle catégorie</h2>
            <CategoryForm
              parentOptions={categories.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
