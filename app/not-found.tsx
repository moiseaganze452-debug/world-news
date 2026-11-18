import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-8xl font-bold text-primary/20">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
        Cette information semble avoir disparu...
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Link>
        <Link
          href="/recherche"
          className="flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          Rechercher une actualité
        </Link>
      </div>
    </div>
  );
}
