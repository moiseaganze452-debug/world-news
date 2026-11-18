export function NewsletterSection() {
  return (
    <section className="rounded-lg bg-primary px-6 py-12 text-center text-primary-foreground">
      <h2 className="font-heading text-2xl font-bold">Restez informé</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/80">
        Recevez les principales informations directement dans votre boîte mail.
      </p>
      <form
        action="/api/newsletter"
        method="POST"
        className="mx-auto mt-6 flex max-w-md gap-2"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="votre@email.com"
          className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/40"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-secondary px-5 py-2 text-sm font-medium text-secondary-foreground transition hover:opacity-90"
        >
          S'abonner
        </button>
      </form>
    </section>
  );
}
