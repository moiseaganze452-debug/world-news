"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteUserAction } from "@/lib/actions/user-actions";

interface UserRowData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIF" | "SUSPENDU" | "EN_ATTENTE";
}

const STATUS_STYLES: Record<UserRowData["status"], string> = {
  ACTIF: "bg-emerald-100 text-emerald-700",
  SUSPENDU: "bg-red-100 text-red-700",
  EN_ATTENTE: "bg-amber-100 text-amber-700",
};

export function UserRow({
  user,
  canManage,
  canManageRoles,
  currentUserId,
}: {
  user: UserRowData;
  canManage: boolean;
  canManageRoles: boolean;
  currentUserId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isCriticalRole = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const canEditThisUser = canManage && !(isCriticalRole && !canManageRoles);
  const isSelf = user.id === currentUserId;

  function handleDelete() {
    if (!confirm(`Supprimer le compte de « ${user.name} » ?`)) return;
    startTransition(async () => {
      try {
        await deleteUserAction(user.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors de la suppression.");
      }
    });
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-foreground">
        {user.name} {isSelf && <span className="text-xs text-muted-foreground">(vous)</span>}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3">
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">{user.role}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[user.status]}`}>
          {user.status}
        </span>
      </td>
      {canManage && (
        <td className="px-4 py-3 text-right">
          {canEditThisUser ? (
            <div className="flex justify-end gap-3">
              <Link href={`/admin/utilisateurs/${user.id}`} className="text-xs text-primary hover:underline">
                Modifier
              </Link>
              {!isSelf && (
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs text-destructive hover:underline disabled:opacity-50"
                >
                  Supprimer
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Réservé Super Admin</span>
          )}
        </td>
      )}
    </tr>
  );
}
