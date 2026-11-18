import { z } from "zod";

export const authorSchema = z.object({
  userId: z.string().uuid("Utilisateur invalide"),
  displayName: z.string().min(2, "2 caractères minimum").max(100),
  slug: z.string().min(2).max(120).optional(),
  bio: z.string().max(1000).optional(),
  photo: z.string().url().optional().or(z.literal("")),
  professionalEmail: z.string().email().optional().or(z.literal("")),
  position: z.string().max(100).optional(),
  specialty: z.string().max(150).optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
});

export type AuthorInput = z.infer<typeof authorSchema>;
