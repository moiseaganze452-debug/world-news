import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/auth/schemas";

/**
 * Configuration centrale de l'authentification.
 *
 * Rôles supportés (voir schema.prisma / UserRole) :
 * SUPER_ADMIN, ADMIN, EDITOR, JOURNALIST, AUTHOR, MODERATOR, AD_MANAGER, ANALYST
 *
 * Le rôle est injecté dans le token JWT puis dans la session,
 * afin d'être lu côté middleware et côté Server Components
 * sans requête supplémentaire à la base de données.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/connexion",
    error: "/admin/connexion",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        if (user.status !== "ACTIF") return null;

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),

    // Provider Google — activé uniquement si les variables sont renseignées
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "AUTHOR";
        token.id = user.id;
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
      } else if (token.id) {
        // §8/§71 — à chaque requête (hors login initial), on revérifie
        // que la version de session figée dans le JWT correspond encore
        // à celle en base. Un changement de mot de passe ou une
        // révocation manuelle incrémente sessionVersion côté DB : tout
        // JWT émis avant cette incrémentation devient invalide, même
        // s'il n'a pas expiré. C'est le mécanisme qui permet une vraie
        // "déconnexion de toutes les sessions" avec une stratégie JWT
        // stateless.
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true, status: true },
        });
        if (
          !currentUser ||
          currentUser.status !== "ACTIF" ||
          currentUser.sessionVersion !== token.sessionVersion
        ) {
          // Retourne un token vidé : la session callback ci-dessous
          // traitera l'absence d'id comme "non authentifié".
          return { ...token, id: undefined, role: undefined, sessionVersion: undefined };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      } else if (session.user) {
        // §8/§71 — token invalidé (sessionVersion divergente ou compte
        // désactivé) : on vide explicitement id/role plutôt que de
        // laisser des valeurs undefined silencieusement acceptées par
        // le typage. Le code appelant doit passer par
        // lib/auth/get-authenticated-session.ts plutôt que d'utiliser
        // auth() directement pour bénéficier de ce contrôle — voir ce
        // fichier pour le détail du compromis de typage.
        (session.user as { id?: string }).id = undefined;
        (session.user as { role?: string }).role = undefined;
      }
      return session;
    },
  },
};
