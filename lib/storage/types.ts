/**
 * Contrat commun à tous les fournisseurs de stockage médias.
 * Permet de changer de fournisseur (Cloudinary / R2 / S3) sans
 * modifier le reste de l'application — seul lib/storage/index.ts change.
 */
export interface UploadResult {
  url: string;
  providerKey: string;
  width?: number;
  height?: number;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageProvider {
  /** Envoie un fichier vers le stockage et retourne son URL publique */
  upload(file: Buffer, options: { filename: string; mimeType: string; folder?: string }): Promise<UploadResult>;

  /** Supprime un fichier par sa clé chez le fournisseur */
  delete(providerKey: string): Promise<void>;

  /** Génère une URL avec transformation (redimensionnement, format) si le provider le supporte */
  getOptimizedUrl(providerKey: string, options?: { width?: number; height?: number; format?: "webp" | "avif" }): string;
}
