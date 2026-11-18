import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { UserRow } from "@/components/admin/user-row";

export const metadata = { title: "Utilisateurs" };

export default async function UsersPage() {
  const session = await auth();
  const canManage = can(session?.user.role, "users.manage");
  const canManageRoles = can(session?.user.role, "users.manage.roles");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comptes d'accès à l'administration et leurs rôles (RBAC).
          </p>
        </div>
        {canManage && (
          <Link
            href="/admin/utilisateurs/nouveau"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Nouvel utilisateur
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                canManage={canManage}
                canManageRoles={canManageRoles}
                currentUserId={session?.user.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
