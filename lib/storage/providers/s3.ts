import type { StorageProvider, UploadResult } from "@/lib/storage/types";

/**
 * Implémentation AWS S3.
 * Nécessite AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME.
 *
 * Note d'intégration : utiliser `@aws-sdk/client-s3`. Ce fichier pose le contrat.
 */
export class S3Provider implements StorageProvider {
  private bucket = process.env.S3_BUCKET_NAME!;
  private region = process.env.AWS_REGION!;

  async upload(
    file: Buffer,
    options: { filename: string; mimeType: string; folder?: string }
  ): Promise<UploadResult> {
    // TODO intégration réelle : PutObjectCommand via @aws-sdk/client-s3
    throw new Error("S3Provider.upload : intégrer @aws-sdk/client-s3 (voir commentaire du fichier).");
  }

  async delete(providerKey: string): Promise<void> {
    // TODO intégration réelle : DeleteObjectCommand
    throw new Error("S3Provider.delete : intégrer @aws-sdk/client-s3 (voir commentaire du fichier).");
  }

  getOptimizedUrl(providerKey: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${providerKey}`;
  }
}
