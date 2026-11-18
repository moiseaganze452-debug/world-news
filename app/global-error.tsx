"use client";

import { useEffect } from "react";

/**
 * §43/§44 — filet de dernier recours : catch une exception survenant
 * dans le layout racine (app/layout.tsx) lui-même, cas que app/error.tsx
 * ne couvre pas. Doit fournir ses propres <html>/<body> puisqu'il
 * remplace entièrement le rendu, y compris le layout racine défaillant.
 * Volontairement minimal en dépendances (pas de composants partagés)
 * pour rester fonctionnel même si la cause de l'erreur touche des
 * imports partagés.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] erreur critique (layout racine):", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Une erreur est survenue</h1>
          <p style={{ marginTop: "0.5rem", color: "#666", maxWidth: "28rem" }}>
            Quelque chose s'est mal passé. Veuillez réessayer dans quelques instants.
            {error.digest && (
              <span style={{ display: "block", marginTop: "0.25rem", fontSize: "0.75rem" }}>
                Référence : {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.375rem",
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
