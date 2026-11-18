import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { updateUserAction } from "@/lib/actions/user-actions";
import { EditUserForm } from "@/components/admin/edit-user-form";

export const metadata = { title: "Modifier l'utilisateur" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManageRoles = can(session?.user.role, "users.manage.roles");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, status: true },
  });
  if (!user) notFound();

  const updateWithId = updateUserAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Modifier {user.name}</h1>
      </div>

      <EditUserForm
        action={updateWithId}
        defaultValues={{ name: user.name, role: user.role, status: user.status }}
        canManageRoles={canManageRoles}
      />
    </div>
  );
}
