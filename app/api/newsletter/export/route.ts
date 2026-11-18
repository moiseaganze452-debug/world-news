import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { logSecurityEvent } from "@/lib/security/audit-log";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";

export async function GET() {
  const session = await auth();
  // §8/§71 — cette route n'est PAS couverte par middleware.ts (matcher
  // limité à /admin/:path*), et un token invalidé par sessionVersion
  // reste un objet `session` non-null (voir callback session dans
  // lib/auth/config.ts, qui vide user.id/role sans mettre session à
  // null). Il faut donc vérifier explicitement session.user.id ici,
  // pas seulement la présence de `session` — sans quoi une session
  // révoquée (ex: après changement de mot de passe suite à
  // compromission, §71) garderait l'accès à cet export sensible.
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    requirePermission(session.user.role, "newsletter.manage");
  } catch {
    await logSecurityEvent({
      type: "permission_denied",
      userId: session.user.id,
      resource: "newsletter.export",
    });
    return NextResponse.json({ error: "Permission refusée." }, { status: 403 });
  }

  // §19/§55 — un export de données personnelles reste une action coûteuse
  // et sensible même pour un utilisateur autorisé ; on limite sa fréquence.
  const rateLimitResult = await checkRateLimit("adminSensitiveAction", session.user.id);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: rateLimitResult.message }, { status: 429 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
    take: 50_000, // §50 — plafond dur même pour un export légitime
  });

  const header = "email,statut,date_inscription\n";
  const rows = subscribers
    .map((s) => `${s.email},${s.status},${s.subscribedAt.toISOString()}`)
    .join("\n");

  // §55 — journalisation obligatoire des exports de données sensibles (PII).
  await logSecurityEvent({
    type: "admin_action",
    userId: session.user.id,
    resource: "newsletter.export",
    ipAddress: await getClientIp(),
    metadata: { subscriberCount: subscribers.length },
  });

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-abonnes-${new Date().toISOString().split("T")[0]}.csv"`,
      // §45 — ne jamais laisser un cache partagé (CDN, proxy) stocker
      // une réponse contenant des données personnelles d'abonnés.
      "Cache-Control": "private, no-store",
    },
  });
}
