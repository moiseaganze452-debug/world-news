import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { ArticleCardData } from "@/types/article";
import { formatPublishedDate } from "@/lib/utils/format-date";

export function ArticleCard({
  article,
  size = "medium",
}: {
  article: ArticleCardData;
  size?: "small" | "medium" | "large";
}) {
  const imageHeight = size === "large" ? "aspect-[16/9]" : size === "medium" ? "aspect-[4/3]" : "aspect-square";

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className={`relative ${imageHeight} overflow-hidden rounded-lg bg-muted`}>
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            World News
          </div>
        )}
        {article.isSponsored && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
            Sponsorisé
          </span>
        )}
      </div>

      <div className="mt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          {article.categoryName}
        </span>
        <h3
          className={`mt-1 font-heading font-bold leading-snug text-foreground transition group-hover:text-primary ${
            size === "large" ? "text-2xl" : size === "medium" ? "text-base" : "text-sm"
          }`}
        >
          {article.title}
        </h3>
        {size !== "small" && article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.authorName}</span>
          <span>·</span>
          <span>{formatPublishedDate(article.publishedAt)}</span>
          {article.readingTimeMin && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTimeMin} min
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
