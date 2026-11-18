import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getArticlesByCategory } from "@/services/public-content-service";
import { ArticleCard } from "@/components/articles/article-card";
import { Pagination } from "@/components/navigation/pagination";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };

  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const { items, total, totalPages } = await getArticlesByCategory(category.id, { page });

  return (
    <div className="container py-8">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {total} article{total > 1 ? "s" : ""}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Aucun article publié dans cette catégorie pour le moment.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} size="medium" />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/categorie/${slug}`} />
    </div>
  );
}
