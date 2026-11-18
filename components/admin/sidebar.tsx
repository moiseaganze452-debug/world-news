import Link from "next/link";
import { ADMIN_NAV } from "@/config/admin-nav";
import { can } from "@/lib/security/permissions";
import { LogoutButton } from "@/components/admin/logout-button";

export function AdminSidebar({ role, userName }: { role: string; userName: string }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-5 py-5">
        <p className="font-heading text-base font-bold text-primary">World News</p>
        <p className="text-xs text-muted-foreground">Administration</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((group) => {
          const visibleItems = group.items.filter(
            (item) => item.permission === null || can(role, item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-5">
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-md px-2 py-1.5 text-sm text-foreground/80 transition hover:bg-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="truncate text-sm font-medium">{userName}</p>
        <p className="mb-2 text-xs text-muted-foreground">{role}</p>
        <LogoutButton />
      </div>
    </aside>
  );
}
