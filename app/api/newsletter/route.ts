import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/services/notification-service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";

const subscribeSchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  // §19 — endpoint public anonyme : cible évidente de création massive
  // d'inscriptions (spam de la base d'abonnés, abus de la notification
  // admin déclenchée à chaque nouvel abonné).
  const ip = await getClientIp();
  const rateLimitResult = await checkRateLimit("newsletterSubscribe", ip);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: rateLimitResult.message }, { status: 429 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const raw = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());

  const parsed = subscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: parsed.data.email } });

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { status: "ACTIF" },
    create: { email: parsed.data.email },
  });

  if (!existing) {
    await createNotification({
      type: "NOUVEL_ABONNE",
      title: "Nouvel abonné newsletter",
      message: `${parsed.data.email} vient de s'abonner à la newsletter.`,
      link: "/admin/newsletter",
    });
  }

  // Requête directe (formulaire HTML sans JS) → redirection ; requête fetch/JSON → JSON.
  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/?newsletter=success", request.url));
  }

  return NextResponse.json({ success: true });
}
