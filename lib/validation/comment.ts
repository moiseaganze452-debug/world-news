import { z } from "zod";

export const commentSchema = z.object({
  articleId: z.string().uuid(),
  content: z.string().min(2, "Le commentaire est trop court").max(2000),
  guestName: z.string().min(2, "Nom requis").max(100),
  guestEmail: z.string().email("Email invalide"),
  parentId: z.string().uuid().optional().nullable(),
});

export type CommentInput = z.infer<typeof commentSchema>;
