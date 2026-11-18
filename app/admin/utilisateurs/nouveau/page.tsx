import { auth } from "@/lib/auth";
import { can } from "@/lib/security/permissions";
import { CreateUserForm } from "@/components/admin/create-user-form";

export const metadata = { title: "Nouvel utilisateur" };

export default async function NewUserPage() {
  const session = await auth();
  const canManageRoles = can(session?.user.role, "users.manage.roles");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouvel utilisateur</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L'utilisateur devra changer son mot de passe temporaire à la première connexion.
        </p>
      </div>

      <CreateUserForm canManageRoles={canManageRoles} />
    </div>
  );
}
