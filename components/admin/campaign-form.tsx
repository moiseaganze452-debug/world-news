"use client";

import { useActionState } from "react";
import { createCampaignAction, type NewsletterFormState } from "@/lib/actions/newsletter-actions";

const initialState: NewsletterFormState = {};

export function CampaignForm() {
  const [state, formAction, isPending] = useActionState(createCampaignAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="subject" className="text-xs font-medium text-foreground">Objet de l'email</label>
        <input
          id="subject"
          name="subject"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="ex: L'essentiel de la semaine"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-xs font-medium text-foreground">Contenu</label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Création..." : "Enregistrer comme brouillon"}
      </button>
    </form>
  );
}
