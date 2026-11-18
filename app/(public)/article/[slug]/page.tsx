import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { getArticleBySlug, getSimilarArticles, incrementArticleView } from "@/services/public-content-service";
import { ArticleContent } from "@/components/articles/article-content";
import { ArticleCard } from "@/components/articles/article-card";
import { ShareButtons } from "@/components/articles/share-buttons";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { AdSlot } from "@/components/advertising/ad-slot";
import { formatFullDate } from "@/lib/utils/format-date";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || undefined;
  const ogImage = article.coverImage?.url;

  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl || `${SITE_URL}/article/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.displayName],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Incrémente le compteur de vues sans bloquer le rendu de la page.
  incrementArticleView(article.id).catch(() => {});

  const similarArticles = await getSimilarArticles(article, 4);
  const articleUrl = `${SITE_URL}/article/${article.slug}`;

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: article.coverImage?.url ? [article.coverImage.url] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: article.author.displayName }],
    publisher: {
      "@type": "Organization",
      name: "World News",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category.name,
        item: `${SITE_URL}/categorie/${article.category.slug}`,
      },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <article className="container max-w-3xl py-8">
      {/* Schema.org — NewsArticle + Breadcrumb (§24, §25) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        {" › "}
        <Link href={`/categorie/${article.category.slug}`} className="hover:text-foreground">
          {article.category.name}
        </Link>
      </nav>

      <Link
        href={`/categorie/${article.category.slug}`}
        className="text-sm font-semibold uppercase tracking-wide text-secondary"
      >
        {article.category.name}
      </Link>

      <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
            {article.author.photo && (
              <Image src={article.author.photo} alt={article.author.displayName} width={40} height={40} className="object-cover" />
            )}
          </div>
          <div>
            <Link href={`/auteur/${article.author.slug}`} className="text-sm font-semibold text-foreground hover:text-primary">
              {article.author.displayName}
            </Link>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFullDate(article.publishedAt)}</span>
              {article.readingTimeMin && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readingTimeMin} min de lecture
                </span>
              )}
            </p>
          </div>
        </div>

        <ShareButtons url={articleUrl} title={article.title} />
      </div>

      {article.coverImage && (
        <figure className="mt-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={article.coverImage.url}
              alt={article.coverImage.altText || article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {article.coverImage.title && (
            <figcaption className="mt-2 text-xs text-muted-foreground">{article.coverImage.title}</figcaption>
          )}
        </figure>
      )}

      <div className="mt-8">
        <ArticleContent content={article.content} />
      </div>

      {/* Publicité in-article (§22) */}
      <div className="mt-8">
        <AdSlot placement="ARTICLE" />
      </div>

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <ShareButtons url={articleUrl} title={article.title} />
      </div>

      {similarArticles.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 font-heading text-xl font-bold text-foreground">Articles similaires</h2>
          <div className="mb-6">
            <AdSlot placement="ENTRE_ARTICLES" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {similarArticles.map((a) => (
              <ArticleCard key={a.id} article={a} size="small" />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 border-t border-border pt-8">
        <h2 className="mb-6 font-heading text-xl font-bold text-foreground">Commentaires</h2>
        <div className="mb-8">
          <CommentForm articleId={article.id} articleSlug={article.slug} />
        </div>
        <CommentList articleId={article.id} />
      </section>
    </article>
  );
}
