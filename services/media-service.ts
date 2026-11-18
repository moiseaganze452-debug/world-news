import crypto from "crypto";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@/lib/db/prisma";
import { storage } from "@/lib/storage";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/validation/media";
import { logSecurityEvent } from "@/lib/security/audit-log";
import { clampPagination } from "@/lib/utils/pagination";
import { UserFacingError } from "@/lib/security/user-facing-error";
import type { MediaType } from "@prisma/client";

function resolveMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "DOCUMENT";
}

// Extensions correspondant aux MIME types autorisés — sert à générer un
// nom de fichier serveur cohérent, jamais à décider seul de la validité
// du fichier (voir vérification magic-bytes ci-dessous, §21).
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "application/pdf": "pdf",
};

export interface UploadMediaInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  uploadedById: string;
  altText?: string;
  title?: string;
}

/**
 * Valide, envoie au StorageProvider configuré, puis enregistre l'entrée
 * en base. Centralise la validation MIME/taille (§21 — upload, zone
 * critique) pour que tout point d'entrée d'upload (admin, future API
 * publique) passe par le même contrôle.
 *
 * IMPORTANT (§21) : le mimeType déclaré par le client (input.mimeType,
 * issu du Content-Type envoyé par le navigateur) n'est JAMAIS une
 * source de confiance à lui seul — un fichier peut être renommé avec
 * une extension/Content-Type trompeur. On revérifie donc la nature
 * réelle du fichier par ses "magic bytes" (signature binaire) avant de
 * l'accepter, et si la vérification échoue ou contredit ce qui a été
 * déclaré, l'upload est rejeté.
 */
export async function uploadMedia(input: UploadMediaInput) {
  if (!ALLOWED_MIME_TYPES.includes(input.mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new UserFacingError(`Type de fichier non autorisé : ${input.mimeType}`);
  }
  if (input.buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new UserFacingError("Fichier trop volumineux (limite : 20 Mo).");
  }
  if (input.buffer.byteLength === 0) {
    throw new UserFacingError("Fichier vide.");
  }

  const detected = await fileTypeFromBuffer(input.buffer);

  // NON VÉRIFIÉ EN CONDITIONS RÉELLES (pas d'accès réseau dans cet
  // environnement pour exécuter un test d'upload de bout en bout) :
  // la détection par magic-bytes via `file-type` couvre fiablement les
  // formats binaires (JPEG, PNG, WebP, AVIF, MP4) mais certains PDF
  // légers/atypiques peuvent nécessiter une inspection plus poussée.
  // Recommandation avant mise en production : tester ce chemin avec un
  // échantillon réel de fichiers (y compris fichiers malveillants
  // renommés) — voir SECURITY-TESTING.md.
  //
  // Cas normal : la signature binaire détectée doit correspondre au MIME
  // déclaré (à la variante près, ex: image/jpg vs image/jpeg gérées par
  // la lib elle-même). Sans correspondance, on ne fait pas confiance au
  // fichier, quel que soit le nom ou le Content-Type qu'il prétend avoir.
  if (!detected || detected.mime !== input.mimeType) {
    await logSecurityEvent({
      type: "file_upload_rejected",
      userId: input.uploadedById,
      resource: input.filename,
      metadata: { declaredMime: input.mimeType, detectedMime: detected?.mime ?? "inconnu" },
    });
    throw new UserFacingError(
      "Le contenu réel du fichier ne correspond pas au type de fichier déclaré. Envoi refusé."
    );
  }

  // §21, point 6-7 : ne jamais faire confiance au nom de fichier fourni
  // par l'utilisateur — un nom serveur aléatoire élimine tout risque de
  // path traversal, de collision, ou de nom trompeur (ex: "photo.jpg.php").
  const extension = MIME_TO_EXTENSION[input.mimeType] ?? "bin";
  const serverFilename = `${crypto.randomBytes(16).toString("hex")}.${extension}`;
  const originalNameSafe = path.basename(input.filename).slice(0, 150);

  const result = await storage.upload(input.buffer, {
    filename: serverFilename,
    mimeType: input.mimeType,
    folder: "world-news",
  });

  await logSecurityEvent({
    type: "file_uploaded",
    userId: input.uploadedById,
    resource: serverFilename,
    metadata: { originalName: originalNameSafe, mimeType: input.mimeType, sizeBytes: input.buffer.byteLength },
  });

  return prisma.media.create({
    data: {
      url: result.url,
      provider: process.env.STORAGE_PROVIDER ?? "cloudinary",
      providerKey: result.providerKey,
      filename: originalNameSafe,
      mimeType: input.mimeType,
      type: resolveMediaType(input.mimeType),
      sizeBytes: result.sizeBytes,
      width: result.width,
      height: result.height,
      altText: input.altText,
      title: input.title,
      uploadedById: input.uploadedById,
    },
  });
}

export async function listMedia(params: { page?: number; pageSize?: number; type?: MediaType }) {
  const { page, pageSize } = clampPagination(params, { defaultPageSize: 24, maxPageSize: 100 });

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where: params.type ? { type: params.type } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.media.count({ where: params.type ? { type: params.type } : undefined }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function deleteMedia(mediaId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new UserFacingError("Média introuvable.");

  if (media.providerKey) {
    try {
      await storage.delete(media.providerKey);
    } catch {
      // Le fichier distant peut déjà avoir été supprimé manuellement —
      // on ne bloque pas la suppression de l'entrée en base pour autant.
    }
  }

  await prisma.media.delete({ where: { id: mediaId } });
}

export async function updateMediaMetadata(
  mediaId: string,
  data: { altText?: string; title?: string; description?: string; attribution?: string }
) {
  return prisma.media.update({ where: { id: mediaId }, data });
}
