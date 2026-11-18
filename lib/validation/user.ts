import { z } from "zod";

const ROLES = [
  "SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST",
  "AUTHOR", "MODERATOR", "AD_MANAGER", "ANALYST",
] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, "2 caractères minimum").max(100),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  role: z.enum(ROLES),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.enum(ROLES),
  status: z.enum(["ACTIF", "SUSPENDU", "EN_ATTENTE"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
