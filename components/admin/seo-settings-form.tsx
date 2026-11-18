"use client";

import { useActionState } from "react";
import { saveSeoSettingsAction, type SeoFormState } from "@/lib/actions/seo-actions";

interface SeoSettingsFormProps {
  defaultValues: {
    globalTitle?: string;
    globalDescription?: string;
    keywords?: string;
    ogImageUrl?: string;
    googleVerification?: string;
    bingVerification?: string;
    analyticsId?: string;
    robotsConfig?: string;
  };
}

const initialState: SeoFormState = {};

export function SeoSettingsForm({ defaultValues }: SeoSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSeoSettingsAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Métadonnées globales</legend>

        <div className="space-y-1">
          <label htmlFor="globalTitle" className="text-sm font-medium text-foreground">Titre global</label>
          <input
            id="globalTitle"
            name="globalTitle"
            defaultValue={defaultValues.globalTitle}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="globalDescription" className="text-sm font-medium text-foreground">Description globale</label>
          <textarea
            id="globalDescription"
            name="globalDescription"
            rows={3}
            defaultValue={defaultValues.globalDescription}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="keywords" className="text-sm font-medium text-foreground">Mots-clés (séparés par des virgules)</label>
          <input
            id="keywords"
            name="keywords"
            defaultValue={defaultValues.keywords}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="ogImageUrl" className="text-sm font-medium text-foreground">Image Open Graph par défaut</label>
          <input
            id="ogImageUrl"
            name="ogImageUrl"
            defaultValue={defaultValues.ogImageUrl}
            placeholder="https://..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Vérification & Analytics</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="googleVerification" className="text-sm font-medium text-foreground">Google Search Console</label>
            <input
              id="googleVerification"
              name="googleVerification"
              defaultValue={defaultValues.googleVerification}
              placeholder="Code de vérification"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="bingVerification" className="text-sm font-medium text-foreground">Bing Webmaster</label>
            <input
              id="bingVerification"
              name="bingVerification"
              defaultValue={defaultValues.bingVerification}
              placeholder="Code de vérification"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="analyticsId" className="text-sm font-medium text-foreground">
            Google Analytics ID (optionnel)
          </label>
          <input
            id="analyticsId"
            name="analyticsId"
            defaultValue={defaultValues.analyticsId}
            placeholder="G-XXXXXXXXXX"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Les statistiques internes de World News fonctionnent indépendamment de Google Analytics.
          </p>
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="robotsConfig" className="text-sm font-medium text-foreground">
          Configuration robots.txt additionnelle
        </label>
        <textarea
          id="robotsConfig"
          name="robotsConfig"
          rows={3}
          defaultValue={defaultValues.robotsConfig}
          placeholder="Disallow: /brouillons/"
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">Paramètres SEO enregistrés.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
