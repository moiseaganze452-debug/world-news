import { z } from "zod";

export const advertisementSchema = z.object({
  name: z.string().min(2, "2 caractères minimum").max(100),
  placement: z.enum(["HEADER", "HOMEPAGE", "ENTRE_ARTICLES", "SIDEBAR", "ARTICLE", "FOOTER", "MOBILE"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  linkUrl: z.string().url().optional().or(z.literal("")),
  htmlCode: z.string().optional(),
  scriptCode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PROGRAMMEE", "EXPIREE"]),
});

export type AdvertisementInput = z.infer<typeof advertisementSchema>;
