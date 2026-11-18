"use client";

import { useActionState } from "react";
import type { UserFormState } from "@/lib/actions/user-actions";

const ALL_ROLES = [
  "SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST",
  "AUTHOR", "MODERATOR", "AD_MANAGER", "ANALYST",
] as const;

const initialState: UserFormState = {};

export function EditUserForm({
  action,
  defaultValues,
  canManageRoles,
}: {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  defaultValues: { name: string; role: string; status: string };
  canManageRoles: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

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
          defaultValue={defaultValues.name}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm font-medium text-foreground">Rôle</label>
        <select
          id="role"
          name="role"
          defaultValue={defaultValues.role}
          disabled={!canManageRoles && (defaultValues.role === "SUPER_ADMIN" || defaultValues.role === "ADMIN")}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          {availableRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="status" className="text-sm font-medium text-foreground">Statut</label>
        <select
          id="status"
          name="status"
          defaultValue={defaultValues.status}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ACTIF">Actif</option>
          <option value="SUSPENDU">Suspendu</option>
          <option value="EN_ATTENTE">En attente</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

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
