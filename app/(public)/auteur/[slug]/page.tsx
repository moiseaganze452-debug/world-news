import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { getAuthorBySlug, getArticlesByAuthor } from "@/services/public-content-service";
import { ArticleCard } from "@/components/articles/article-card";
import { Pagination } from "@/components/navigation/pagination";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Journaliste introuvable" };

  return {
    title: author.displayName,
    description: author.bio || `Articles de ${author.displayName} sur World News.`,
  };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const { items, total, totalPages } = await getArticlesByAuthor(author.id, { page });

  return (
    <div className="container py-8">
      <header className="mb-10 flex flex-col items-center gap-4 border-b border-border pb-8 text-center">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-muted">
          {author.photo && (
            <Image src={author.photo} alt={author.displayName} width={96} height={96} className="object-cover" />
          )}
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{author.displayName}</h1>
          {author.position && <p className="text-sm text-secondary">{author.position}</p>}
        </div>
        {author.bio && <p className="max-w-xl text-sm text-muted-foreground">{author.bio}</p>}

        <div className="flex gap-2">
          {author.facebookUrl && <SocialIcon href={author.facebookUrl} Icon={Facebook} />}
          {author.twitterUrl && <SocialIcon href={author.twitterUrl} Icon={Twitter} />}
          {author.linkedinUrl && <SocialIcon href={author.linkedinUrl} Icon={Linkedin} />}
          {author.instagramUrl && <SocialIcon href={author.instagramUrl} Icon={Instagram} />}
        </div>

        <p className="text-xs text-muted-foreground">
          {total} article{total > 1 ? "s" : ""} publié{total > 1 ? "s" : ""}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} size="medium" />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/auteur/${slug}`} />
    </div>
  );
}

function SocialIcon({ href, Icon }: { href: string; Icon: typeof Facebook }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-border p-2 text-foreground/70 transition hover:border-primary hover:text-primary"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
