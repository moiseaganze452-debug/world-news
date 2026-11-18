"use client";

import { useActionState, useState } from "react";
import { addMenuItemAction, type MenuFormState } from "@/lib/actions/menu-actions";

const initialState: MenuFormState = {};

export function AddMenuItemForm({
  menuId,
  categoryOptions,
  pageOptions,
}: {
  menuId: string;
  categoryOptions: { id: string; name: string }[];
  pageOptions: { id: string; title: string }[];
}) {
  const [state, formAction, isPending] = useActionState(addMenuItemAction, initialState);
  const [type, setType] = useState<"CATEGORIE" | "PAGE" | "ARTICLE" | "URL">("CATEGORIE");

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <input type="hidden" name="menuId" value={menuId} />

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Libellé</label>
        <input
          name="label"
          required
          placeholder="ex: Technologie"
          className="w-40 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Type</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="CATEGORIE">Catégorie</option>
          <option value="PAGE">Page</option>
          <option value="URL">URL personnalisée</option>
        </select>
      </div>

      {type === "CATEGORIE" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Catégorie</label>
          <select
            name="targetId"
            className="w-40 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {type === "PAGE" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Page</label>
          <select
            name="targetId"
            className="w-40 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {pageOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      {type === "URL" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">URL</label>
          <input
            name="url"
            placeholder="https://..."
            className="w-48 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/70 disabled:opacity-50"
      >
        {isPending ? "Ajout..." : "+ Ajouter"}
      </button>

      {state?.error && <p className="w-full text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
