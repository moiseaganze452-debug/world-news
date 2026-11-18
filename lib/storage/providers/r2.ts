import type { StorageProvider, UploadResult } from "@/lib/storage/types";

/**
 * Implémentation Cloudflare R2 (compatible API S3).
 * Nécessite R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 * R2_BUCKET_NAME, R2_PUBLIC_URL.
 *
 * Note d'intégration : utiliser `@aws-sdk/client-s3` pointé sur l'endpoint R2
 * (`https://<account_id>.r2.cloudflarestorage.com`). Ce fichier pose le contrat.
 */
export class R2Provider implements StorageProvider {
  private publicUrl = process.env.R2_PUBLIC_URL!;

  async upload(
    file: Buffer,
    options: { filename: string; mimeType: string; folder?: string }
  ): Promise<UploadResult> {
    // TODO intégration réelle : PutObjectCommand via @aws-sdk/client-s3
    throw new Error("R2Provider.upload : intégrer @aws-sdk/client-s3 (voir commentaire du fichier).");
  }

  async delete(providerKey: string): Promise<void> {
    // TODO intégration réelle : DeleteObjectCommand
    throw new Error("R2Provider.delete : intégrer @aws-sdk/client-s3 (voir commentaire du fichier).");
  }

  getOptimizedUrl(providerKey: string): string {
    // R2 ne transforme pas les images nativement — prévoir Cloudflare Images
    // ou un middleware de resize si besoin de variantes.
    return `${this.publicUrl}/${providerKey}`;
  }
}
