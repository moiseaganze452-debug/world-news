"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText, Video, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteMediaAction } from "@/lib/actions/media-actions";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  altText: string | null;
  title: string | null;
}

export function MediaGrid({
  items,
  currentPage,
  totalPages,
}: {
  items: MediaItem[];
  currentPage: number;
  totalPages: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, filename: string) {
    if (!confirm(`Supprimer « ${filename} » ? Cette action est irréversible.`)) return;
    startTransition(() => deleteMediaAction(id));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Aucun média pour le moment. Envoyez votre premier fichier ci-dessus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
          >
            {item.type === "IMAGE" ? (
              <Image
                src={item.url}
                alt={item.altText ?? item.filename}
                fill
                className="object-cover"
                sizes="200px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {item.type === "VIDEO" ? (
                  <Video className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            )}

            <button
              onClick={() => handleDelete(item.id, item.filename)}
              disabled={isPending}
              className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            <p className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[10px] text-white">
              {item.title ?? item.filename}
            </p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/medias?page=${p}`}
              className={
                p === currentPage
                  ? "rounded-md bg-primary px-3 py-1 text-primary-foreground"
                  : "rounded-md px-3 py-1 text-muted-foreground hover:bg-muted"
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
