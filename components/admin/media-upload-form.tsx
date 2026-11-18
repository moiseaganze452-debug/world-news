"use client";

import { useActionState } from "react";
import { uploadMediaAction, type MediaUploadState } from "@/lib/actions/media-actions";

const initialState: MediaUploadState = {};

export function MediaUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadMediaAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <input
        type="file"
        name="file"
        required
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,application/pdf"
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
      />
      <input
        type="text"
        name="altText"
        placeholder="Texte alternatif (accessibilité, SEO)"
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Envoyer"}
      </button>

      {state?.error && (
        <p className="sm:col-span-3 text-xs text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="sm:col-span-3 text-xs text-emerald-600">Média envoyé avec succès.</p>
      )}
    </form>
  );
}
