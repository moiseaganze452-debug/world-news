"use client";

import { useActionState } from "react";
import type { AdFormState } from "@/lib/actions/advertisement-actions";

interface AdFormProps {
  action: (state: AdFormState, formData: FormData) => Promise<AdFormState>;
  defaultValues?: {
    name?: string;
    placement?: string;
    imageUrl?: string;
    linkUrl?: string;
    htmlCode?: string;
    scriptCode?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  };
  submitLabel?: string;
}

const initialState: AdFormState = {};

export function AdForm({ action, defaultValues = {}, submitLabel = "Créer la publicité" }: AdFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-foreground">Nom</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues.name}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="placement" className="text-sm font-medium text-foreground">Emplacement</label>
          <select
            id="placement"
            name="placement"
            defaultValue={defaultValues.placement ?? "HOMEPAGE"}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="HEADER">En-tête</option>
            <option value="HOMEPAGE">Page d'accueil</option>
            <option value="ENTRE_ARTICLES">Entre les articles</option>
            <option value="SIDEBAR">Barre latérale</option>
            <option value="ARTICLE">Dans l'article</option>
            <option value="FOOTER">Pied de page</option>
            <option value="MOBILE">Mobile</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="imageUrl" className="text-sm font-medium text-foreground">URL de l'image</label>
          <input
            id="imageUrl"
            name="imageUrl"
            defaultValue={defaultValues.imageUrl}
            placeholder="https://..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="linkUrl" className="text-sm font-medium text-foreground">Lien de destination</label>
          <input
            id="linkUrl"
            name="linkUrl"
            defaultValue={defaultValues.linkUrl}
            placeholder="https://..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="htmlCode" className="text-sm font-medium text-foreground">
          Code HTML personnalisé (optionnel — remplace l'image/lien si renseigné)
        </label>
        <textarea
          id="htmlCode"
          name="htmlCode"
          rows={3}
          defaultValue={defaultValues.htmlCode}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="scriptCode" className="text-sm font-medium text-foreground">
          Script publicitaire (optionnel — ex: Google AdSense)
        </label>
        <textarea
          id="scriptCode"
          name="scriptCode"
          rows={3}
          defaultValue={defaultValues.scriptCode}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="startDate" className="text-sm font-medium text-foreground">Date de début</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={defaultValues.startDate}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="endDate" className="text-sm font-medium text-foreground">Date de fin</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={defaultValues.endDate}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium text-foreground">Statut</label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues.status ?? "INACTIVE"}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PROGRAMMEE">Programmée</option>
            <option value="EXPIREE">Expirée</option>
          </select>
        </div>
      </div>

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
