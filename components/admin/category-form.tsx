"use client";

import { useActionState } from "react";
import { createCategoryAction, type CategoryFormState } from "@/lib/actions/category-actions";

const initialState: CategoryFormState = {};

export function CategoryForm({
  parentOptions,
}: {
  parentOptions: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-medium text-foreground">
          Nom
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="ex: Technologie"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-xs font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="parentId" className="text-xs font-medium text-foreground">
          Catégorie parente
        </label>
        <select
          id="parentId"
          name="parentId"
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          defaultValue=""
        >
          <option value="">Aucune (catégorie principale)</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="color" className="text-xs font-medium text-foreground">
          Couleur (optionnel)
        </label>
        <input
          id="color"
          name="color"
          type="color"
          defaultValue="#0B1F3A"
          className="h-9 w-full rounded-md border border-border bg-background px-1"
        />
      </div>

      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Création..." : "Créer la catégorie"}
      </button>
    </form>
  );
}
