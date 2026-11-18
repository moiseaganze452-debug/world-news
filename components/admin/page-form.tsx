"use client";

import { useActionState } from "react";
import type { PageFormState } from "@/lib/actions/page-actions";

interface PageFormProps {
  action: (state: PageFormState, formData: FormData) => Promise<PageFormState>;
  defaultValues?: {
    title?: string;
    slug?: string;
    content?: string;
    status?: "BROUILLON" | "PUBLIE";
    seoTitle?: string;
    seoDescription?: string;
  };
  submitLabel?: string;
}

const initialState: PageFormState = {};

export function PageForm({ action, defaultValues = {}, submitLabel = "Créer la page" }: PageFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-3xl space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-medium text-foreground">Titre</label>
          <input
            id="title"
            name="title"
            required
            defaultValue={defaultValues.title}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="slug" className="text-sm font-medium text-foreground">
            URL (laisser vide pour générer automatiquement)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={defaultValues.slug}
            placeholder="ex: a-propos"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm font-medium text-foreground">
          Contenu (HTML)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          defaultValue={defaultValues.content}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          Le contenu est inséré tel quel dans la page publique. Balises HTML simples autorisées.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="status" className="text-sm font-medium text-foreground">Statut</label>
        <select
          id="status"
          name="status"
          defaultValue={defaultValues.status ?? "BROUILLON"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary sm:w-56"
        >
          <option value="BROUILLON">Brouillon</option>
          <option value="PUBLIE">Publiée</option>
        </select>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-foreground">SEO</legend>
        <div className="space-y-1">
          <label htmlFor="seoTitle" className="text-xs font-medium text-foreground">Titre SEO</label>
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={defaultValues.seoTitle}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="seoDescription" className="text-xs font-medium text-foreground">Meta description</label>
          <input
            id="seoDescription"
            name="seoDescription"
            defaultValue={defaultValues.seoDescription}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}
