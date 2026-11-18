import Link from "next/link";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export const metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-xl font-bold text-primary">World News</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mot de passe oublié</p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/admin/connexion" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
