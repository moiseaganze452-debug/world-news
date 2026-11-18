import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-xl font-bold text-primary">World News</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connexion à l'administration</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
