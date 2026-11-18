import type { StorageProvider, UploadResult } from "@/lib/storage/types";

/**
 * Implémentation Cloudinary.
 * Nécessite CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 *
 * Note d'intégration : installer le SDK officiel `cloudinary` et remplacer
 * les appels ci-dessous par `cloudinary.uploader.upload(...)`.
 * Ce fichier pose le contrat ; le câblage réel du SDK se fait à l'implémentation.
 */
export class CloudinaryProvider implements StorageProvider {
  private cloudName = process.env.CLOUDINARY_CLOUD_NAME!;

  async upload(
    file: Buffer,
    options: { filename: string; mimeType: string; folder?: string }
  ): Promise<UploadResult> {
    // TODO intégration réelle : cloudinary.uploader.upload_stream(...)
    throw new Error(
      "CloudinaryProvider.upload : intégrer le SDK `cloudinary` (voir commentaire du fichier)."
    );
  }

  async delete(providerKey: string): Promise<void> {
    // TODO intégration réelle : cloudinary.uploader.destroy(providerKey)
    throw new Error(
      "CloudinaryProvider.delete : intégrer le SDK `cloudinary` (voir commentaire du fichier)."
    );
  }

  getOptimizedUrl(
    providerKey: string,
    options?: { width?: number; height?: number; format?: "webp" | "avif" }
  ): string {
    const transforms: string[] = ["f_auto", "q_auto"];
    if (options?.width) transforms.push(`w_${options.width}`);
    if (options?.height) transforms.push(`h_${options.height}`);
    if (options?.format) transforms.push(`f_${options.format}`);

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transforms.join(",")}/${providerKey}`;
  }
}
