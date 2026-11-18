"use client";

import { useActionState } from "react";
import { saveCommentSettingsAction, type SettingsFormState } from "@/lib/actions/settings-actions";

const initialState: SettingsFormState = {};

export function CommentSettingsForm({
  defaultValues,
}: {
  defaultValues: { autoApprove: boolean; commentsEnabled: boolean };
}) {
  const [state, formAction, isPending] = useActionState(saveCommentSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="commentsEnabled" defaultChecked={defaultValues.commentsEnabled} className="rounded" />
        Autoriser les commentaires sur les articles
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="autoApprove" defaultChecked={defaultValues.autoApprove} className="rounded" />
        Approuver automatiquement les commentaires (sans modération)
      </label>

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
