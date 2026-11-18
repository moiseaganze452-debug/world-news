import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { formatFullDate } from "@/lib/utils/format-date";

export const metadata = { title: "Sécurité" };

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SecurityPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!can(session?.user.role, "security.manage")) {
    redirect("/admin/dashboard");
  }

  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 30;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sécurité</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Journal d'audit — {total} événement{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Ressource</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun événement enregistré.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{log.user?.name ?? "Système"}</td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{log.action}</code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.resource ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatFullDate(log.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/securite?page=${p}`}
              className={
                p === page
                  ? "rounded-md bg-primary px-3 py-1 text-primary-foreground"
                  : "rounded-md px-3 py-1 text-muted-foreground hover:bg-muted"
              }
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
