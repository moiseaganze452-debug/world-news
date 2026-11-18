import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "video/mp4",
  "application/pdf",
] as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 Mo

export const mediaMetadataSchema = z.object({
  altText: z.string().max(200).optional(),
  title: z.string().max(150).optional(),
  description: z.string().max(500).optional(),
  attribution: z.string().max(150).optional(),
});

export type MediaMetadataInput = z.infer<typeof mediaMetadataSchema>;
