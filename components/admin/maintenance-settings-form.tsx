"use client";

import { useActionState } from "react";
import { saveMaintenanceSettingsAction, type SettingsFormState } from "@/lib/actions/settings-actions";

const initialState: SettingsFormState = {};

export function MaintenanceSettingsForm({
  defaultValues,
}: {
  defaultValues: { enabled: boolean; title: string; message: string };
}) {
  const [state, formAction, isPending] = useActionState(saveMaintenanceSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="enabled" defaultChecked={defaultValues.enabled} className="rounded" />
        Activer le mode maintenance (le site public devient inaccessible aux visiteurs, les admins gardent l'accès)
      </label>

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-foreground">Titre affiché</label>
        <input
          id="title"
          name="title"
          defaultValue={defaultValues.title}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-sm font-medium text-foreground">Message affiché</label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={defaultValues.message}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">Enregistré.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
