"use client";

import { useTransition } from "react";
import { deleteCategoryAction } from "@/lib/actions/category-actions";

interface CategoryRowData {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  articleCount: number;
  color: string | null;
}

export function CategoryRow({
  category,
  canManage,
}: {
  category: CategoryRowData;
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer la catégorie « ${category.name} » ?`)) return;
    startTransition(async () => {
      try {
        await deleteCategoryAction(category.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors de la suppression.");
      }
    });
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {category.color && (
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          )}
          <span className="font-medium text-foreground">{category.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">/{category.slug}</td>
      <td className="px-4 py-3 text-muted-foreground">{category.parentName ?? "—"}</td>
      <td className="px-4 py-3 text-muted-foreground">{category.articleCount}</td>
      {canManage && (
        <td className="px-4 py-3 text-right">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-destructive hover:underline disabled:opacity-50"
          >
            Supprimer
          </button>
        </td>
      )}
    </tr>
  );
}
