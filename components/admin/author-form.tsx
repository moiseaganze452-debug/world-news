"use client";

import { useActionState } from "react";
import type { AuthorFormState } from "@/lib/actions/author-actions";

interface AuthorFormProps {
  action: (state: AuthorFormState, formData: FormData) => Promise<AuthorFormState>;
  userOptions: { id: string; name: string; email: string }[];
  defaultValues?: {
    userId?: string;
    displayName?: string;
    bio?: string;
    photo?: string;
    professionalEmail?: string;
    position?: string;
    specialty?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
  };
  submitLabel?: string;
}

const initialState: AuthorFormState = {};

export function AuthorForm({ action, userOptions, defaultValues = {}, submitLabel = "Créer l'auteur" }: AuthorFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="space-y-1">
        <label htmlFor="userId" className="text-sm font-medium text-foreground">Compte utilisateur lié</label>
        <select
          id="userId"
          name="userId"
          required
          defaultValue={defaultValues.userId}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Sélectionner un utilisateur...</option>
          {userOptions.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nom affiché" name="displayName" defaultValue={defaultValues.displayName} required />
        <TextField label="Poste" name="position" defaultValue={defaultValues.position} placeholder="ex: Rédacteur en chef" />
        <TextField label="Spécialité" name="specialty" defaultValue={defaultValues.specialty} placeholder="ex: Politique internationale" />
        <TextField label="Email professionnel" name="professionalEmail" type="email" defaultValue={defaultValues.professionalEmail} />
        <TextField label="URL de la photo" name="photo" defaultValue={defaultValues.photo} placeholder="https://..." />
      </div>

      <div className="space-y-1">
        <label htmlFor="bio" className="text-sm font-medium text-foreground">Biographie</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={defaultValues.bio}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-foreground">Réseaux sociaux</legend>
        <TextField label="Facebook" name="facebookUrl" defaultValue={defaultValues.facebookUrl} placeholder="https://facebook.com/..." />
        <TextField label="X (Twitter)" name="twitterUrl" defaultValue={defaultValues.twitterUrl} placeholder="https://x.com/..." />
        <TextField label="LinkedIn" name="linkedinUrl" defaultValue={defaultValues.linkedinUrl} placeholder="https://linkedin.com/..." />
        <TextField label="Instagram" name="instagramUrl" defaultValue={defaultValues.instagramUrl} placeholder="https://instagram.com/..." />
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

function TextField({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-foreground">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
