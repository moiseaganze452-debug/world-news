import type { StorageProvider } from "@/lib/storage/types";
import { CloudinaryProvider } from "@/lib/storage/providers/cloudinary";
import { R2Provider } from "@/lib/storage/providers/r2";
import { S3Provider } from "@/lib/storage/providers/s3";

/**
 * Point d'entrée unique pour tout le code applicatif.
 * Changer de fournisseur de stockage se fait uniquement via la variable
 * d'environnement STORAGE_PROVIDER — aucun autre fichier n'a besoin d'être modifié.
 *
 * Usage :
 *   import { storage } from "@/lib/storage";
 *   const result = await storage.upload(buffer, { filename, mimeType });
 */
function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "cloudinary";

  switch (provider) {
    case "r2":
      return new R2Provider();
    case "s3":
      return new S3Provider();
    case "cloudinary":
    default:
      return new CloudinaryProvider();
  }
}

export const storage = createStorageProvider();
export type { StorageProvider, UploadResult } from "@/lib/storage/types";
