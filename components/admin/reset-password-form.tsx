"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "@/lib/auth/password-reset-actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <Link href="/admin/connexion" className="text-sm text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">Nouveau mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
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
        {isPending ? "Enregistrement..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}
