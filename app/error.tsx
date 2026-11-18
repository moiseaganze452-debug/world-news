"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";

/**
 * §43/§44 — filet de sécurité pour toute exception non catchée dans un
 * Server Component ou Route Handler côté rendu. Ne rend JAMAIS
 * error.message/stack directement : Next.js masque déjà ces détails en
 * production par défaut, mais on ne s'appuie pas uniquement sur ce
 * comportement implicite — le message affiché ici est fixe et générique
 * quel que soit le contenu réel de l'erreur.
 */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Le détail complet (message, stack) reste uniquement dans les logs
    // serveur/observabilité (§38 Monitoring — Sentry/Better Stack NON
    // câblé par défaut dans ce projet, voir SECURITY-ARCHITECTURE.md),
    // jamais renvoyé au client.
    console.error("[app] erreur non gérée:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive/60" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
        Une erreur est survenue
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Quelque chose s'est mal passé de notre côté. L'équipe technique a été informée.
        {error.digest && (
          <span className="mt-1 block text-xs text-muted-foreground/70">
            Référence : {error.digest}
          </span>
        )}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <RotateCw className="h-4 w-4" />
          Réessayer
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
