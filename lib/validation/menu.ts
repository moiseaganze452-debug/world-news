import { z } from "zod";

export const menuItemSchema = z.object({
  menuId: z.string().uuid(),
  label: z.string().min(1, "Libellé requis").max(60),
  type: z.enum(["CATEGORIE", "PAGE", "ARTICLE", "URL"]),
  targetId: z.string().uuid().optional().or(z.literal("")),
  url: z.string().url().optional().or(z.literal("")),
  parentId: z.string().uuid().optional().or(z.literal("")),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
