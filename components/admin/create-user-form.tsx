"use client";

import { useActionState } from "react";
import { createUserAction, type UserFormState } from "@/lib/actions/user-actions";

const ALL_ROLES = [
  "SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST",
  "AUTHOR", "MODERATOR", "AD_MANAGER", "ANALYST",
] as const;

const initialState: UserFormState = {};

export function CreateUserForm({ canManageRoles }: { canManageRoles: boolean }) {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  const availableRoles = canManageRoles
    ? ALL_ROLES
    : ALL_ROLES.filter((r) => r !== "SUPER_ADMIN" && r !== "ADMIN");

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-lg border border-border bg-card p-6">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-foreground">Nom complet</label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-foreground">Mot de passe temporaire</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm font-medium text-foreground">Rôle</label>
        <select
          id="role"
          name="role"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          {availableRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Création..." : "Créer l'utilisateur"}
      </button>
    </form>
  );
}
