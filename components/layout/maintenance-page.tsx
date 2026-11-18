export function MaintenancePage({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/10" />
        <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
