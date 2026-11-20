"use client";

import { useActionState, useState } from "react";
import { saveAppearanceAction, type AppearanceFormState } from "@/lib/actions/appearance-actions";
import type { SiteTheme } from "@/lib/seo/theme";
import { hslToHex, hexToHsl } from "@/lib/utils/color";

const initialState: AppearanceFormState = {};

export function AppearanceForm({ theme }: { theme: SiteTheme }) {
  const [state, formAction, isPending] = useActionState(saveAppearanceAction, initialState);

  // État local pour l'aperçu en direct — la sauvegarde réelle passe par la
  // Server Action ; ces valeurs ne pilotent que le panneau de prévisualisation.
  const [preview, setPreview] = useState({
    siteName: theme.identity.siteName,
    tagline: theme.identity.tagline,
    primary: theme.colors.primary ?? "213 63% 14%",
    secondary: theme.colors.secondary ?? "0 65% 47%",
    background: theme.colors.background ?? "0 0% 100%",
    text: theme.colors.text ?? "220 39% 11%",
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form action={formAction} className="space-y-8 rounded-lg border border-border bg-card p-6">
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-foreground">Identité</legend>

          <Field label="Nom du site" name="siteName" defaultValue={theme.identity.siteName}
            onChange={(v) => setPreview((p) => ({ ...p, siteName: v }))} />
          <Field label="Slogan" name="tagline" defaultValue={theme.identity.tagline}
            onChange={(v) => setPreview((p) => ({ ...p, tagline: v }))} />
          <Field label="URL du logo" name="logoUrl" defaultValue={theme.identity.logoUrl ?? ""} placeholder="https://..." />
          <Field label="URL du favicon" name="faviconUrl" defaultValue={theme.identity.faviconUrl ?? ""} placeholder="https://..." />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-foreground">Couleurs</legend>

          <ColorField label="Couleur principale" name="colorPrimary" hslValue={theme.colors.primary ?? "213 63% 14%"}
            onChange={(v) => setPreview((p) => ({ ...p, primary: v }))} />
          <ColorField label="Couleur secondaire" name="colorSecondary" hslValue={theme.colors.secondary ?? "0 65% 47%"}
            onChange={(v) => setPreview((p) => ({ ...p, secondary: v }))} />
          <ColorField label="Accent" name="colorAccent" hslValue={theme.colors.accent ?? "0 65% 47%"} />
          <ColorField label="Arrière-plan" name="colorBackground" hslValue={theme.colors.background ?? "0 0% 100%"}
            onChange={(v) => setPreview((p) => ({ ...p, background: v }))} />
          <ColorField label="Texte" name="colorText" hslValue={theme.colors.text ?? "220 39% 11%"}
            onChange={(v) => setPreview((p) => ({ ...p, text: v }))} />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-foreground">Typographie</legend>

          <Field label="Police principale" name="fontPrimary" defaultValue={theme.typography.fontPrimary} />
          <Field label="Police des titres" name="fontHeading" defaultValue={theme.typography.fontHeading} />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold text-foreground">Mode d'affichage par défaut</legend>
          <select
            name="defaultMode"
            defaultValue={theme.defaultMode}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="system">Suivre la préférence du visiteur</option>
            <option value="light">Toujours clair</option>
            <option value="dark">Toujours sombre</option>
          </select>
        </fieldset>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p className="text-sm text-emerald-600">Apparence mise à jour avec succès.</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      {/* Aperçu en direct (§19) */}
      <div className="h-fit rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aperçu</p>
        <div
          className="overflow-hidden rounded-lg border border-border"
          style={{ backgroundColor: `hsl(${preview.background})`, color: `hsl(${preview.text})` }}
        >
          <div
            className="px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: `hsl(${preview.primary})`, color: "white" }}
          >
            {preview.siteName || "World News"}
          </div>
          <div className="p-4">
            <p className="text-xs" style={{ opacity: 0.7 }}>{preview.tagline}</p>
            <div
              className="mt-3 inline-block rounded px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: `hsl(${preview.secondary})` }}
            >
              Bouton d'exemple
            </div>
            <p className="mt-3 text-sm">Ceci est un aperçu du rendu des couleurs choisies sur le site public.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-xs font-medium text-foreground">{label}</label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function ColorField({
  label,
  name,
  hslValue,
  onChange,
}: {
  label: string;
  name: string;
  hslValue: string;
  onChange?: (hsl: string) => void;
}) {
  const [hex, setHex] = useState(hslToHex(hslValue));
  const [hsl, setHsl] = useState(hslValue);

  function handleHexChange(newHex: string) {
    setHex(newHex);
    const newHsl = hexToHsl(newHex);
    setHsl(newHsl);
    onChange?.(newHsl);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={hex}
        onChange={(e) => handleHexChange(e.target.value)}
        className="h-9 w-12 shrink-0 rounded border border-border"
      />
      <div className="flex-1 space-y-1">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <input type="hidden" name={name} value={hsl} />
        <p className="text-xs text-muted-foreground">{hsl}</p>
      </div>
    </div>
  );
}
