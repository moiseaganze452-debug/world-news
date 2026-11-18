"use server";

import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/lib/auth";
import { loginSchema } from "@/lib/auth/schemas";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { logSecurityEvent } from "@/lib/security/audit-log";

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const ip = await getClientIp();

  // §6/§19 — protection brute force / credential stuffing : on limite
  // d'abord par IP (empêche un balayage massif), avant même de valider
  // le formulaire pour ne pas dépenser de temps de calcul inutilement
  // sur des requêtes déjà bloquées.
  const ipLimit = await checkRateLimit("login", ip);
  if (!ipLimit.success) {
    return { error: ipLimit.message };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Adresse email ou mot de passe invalide." };
  }

  // Limite additionnelle par compte ciblé : ralentit un credential
  // stuffing distribué sur plusieurs IP contre un même email.
  const accountLimit = await checkRateLimit("loginPerAccount", parsed.data.email);
  if (!accountLimit.success) {
    return { error: accountLimit.message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin/dashboard",
    });
    await logSecurityEvent({ type: "login_success", ipAddress: ip, resource: `User:${parsed.data.email}` });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      // §6 — message générique : ne jamais révéler si l'email existe ou
      // si c'est le mot de passe qui est incorrect (anti-énumération).
      await logSecurityEvent({ type: "login_failed", ipAddress: ip, resource: `User:${parsed.data.email}` });
      return { error: "Identifiants incorrects. Veuillez réessayer." };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  const session = await auth();
  await logSecurityEvent({ type: "logout", userId: session?.user?.id });
  await signOut({ redirectTo: "/admin/connexion" });
}
