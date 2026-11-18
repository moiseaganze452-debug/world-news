import Link from "next/link";

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const separator = basePath.includes("?") ? "&" : "?";

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={`${basePath}${separator}page=${p}`}
          className={
            p === currentPage
              ? "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              : "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          }
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
