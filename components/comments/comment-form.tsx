"use client";

import { useActionState } from "react";
import { submitCommentAction, type CommentFormState } from "@/lib/actions/comment-actions";

const initialState: CommentFormState = {};

export function CommentForm({ articleId, articleSlug }: { articleId: string; articleSlug: string }) {
  const action = submitCommentAction.bind(null, articleSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  if (state?.success) {
    return (
      <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Merci, votre commentaire a bien été envoyé. Il sera visible après modération.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="articleId" value={articleId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="guestName"
          required
          placeholder="Votre nom"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          name="guestEmail"
          type="email"
          required
          placeholder="Votre email (non publié)"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <textarea
        name="content"
        required
        rows={4}
        placeholder="Votre commentaire..."
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Publier le commentaire"}
      </button>
    </form>
  );
}
