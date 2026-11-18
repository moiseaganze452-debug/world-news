import { ResetPasswordForm } from "@/components/admin/reset-password-form";

export const metadata = {
  title: "Réinitialiser le mot de passe",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token, email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-xl font-bold text-primary">World News</h1>
          <p className="mt-1 text-sm text-muted-foreground">Nouveau mot de passe</p>
        </div>

        {!token || !email ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Lien de réinitialisation invalide ou incomplet.
          </p>
        ) : (
          <ResetPasswordForm token={token} email={email} />
        )}
      </div>
    </div>
  );
}
