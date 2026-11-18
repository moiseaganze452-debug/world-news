"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </button>
    </form>
  );
}
