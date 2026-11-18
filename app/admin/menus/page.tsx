import { prisma } from "@/lib/db/prisma";
import { MenuBuilder } from "@/components/admin/menu-builder";
import { NewMenuForm } from "@/components/admin/new-menu-form";

export const metadata = { title: "Menus" };

export default async function MenusPage() {
  const [menus, categories, pages] = await Promise.all([
    prisma.menu.findMany({
      orderBy: { name: "asc" },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: "asc" },
          include: { children: { orderBy: { order: "asc" } } },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.page.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Menus</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Construisez la navigation du site par glisser-déposer. Le menu « menu-principal » alimente l'en-tête public.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Nouveau menu</h2>
        <NewMenuForm />
      </div>

      <div className="space-y-10">
        {menus.map((menu) => (
          <MenuBuilder
            key={menu.id}
            menu={{
              id: menu.id,
              name: menu.name,
              slug: menu.slug,
              items: menu.items.map((item) => ({
                id: item.id,
                label: item.label,
                type: item.type,
                order: item.order,
                children: item.children.map((c) => ({
                  id: c.id,
                  label: c.label,
                  type: c.type,
                  order: c.order,
                })),
              })),
            }}
            categoryOptions={categories}
            pageOptions={pages}
          />
        ))}
        {menus.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun menu pour le moment. Créez-en un ci-dessus.</p>
        )}
      </div>
    </div>
  );
}
