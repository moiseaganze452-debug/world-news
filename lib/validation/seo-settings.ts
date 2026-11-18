import { z } from "zod";

export const seoSettingsSchema = z.object({
  globalTitle: z.string().max(150).optional(),
  globalDescription: z.string().max(300).optional(),
  keywords: z.string().max(300).optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  googleVerification: z.string().max(200).optional(),
  bingVerification: z.string().max(200).optional(),
  analyticsId: z.string().max(50).optional(),
  robotsConfig: z.string().max(1000).optional(),
});

export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;
