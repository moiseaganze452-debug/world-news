"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ResetRequestState } from "@/lib/auth/password-reset-actions";

const initialState: ResetRequestState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  if (state?.success) {
    return (
      <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">Adresse email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="vous@world-news.com"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Envoyer le lien de réinitialisation"}
      </button>
    </form>
  );
}
