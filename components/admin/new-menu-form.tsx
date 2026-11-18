"use client";

import { useActionState } from "react";
import { createMenuAction, type MenuFormState } from "@/lib/actions/menu-actions";

const initialState: MenuFormState = {};

export function NewMenuForm() {
  const [state, formAction, isPending] = useActionState(createMenuAction, initialState);

  return (
    <form action={formAction} className="flex gap-3">
      <input
        name="name"
        required
        placeholder="ex: Menu Footer - Liens rapides"
        className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Création..." : "Créer"}
      </button>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
