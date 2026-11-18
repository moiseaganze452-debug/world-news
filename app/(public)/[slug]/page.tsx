import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  return prisma.page.findUnique({ where: { slug, status: "PUBLIE" } });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page introuvable" };

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
  };
}

/**
 * Route générique couvrant toutes les pages créées depuis
 * Admin → Pages (§17) : à-propos, contact, mentions légales, etc.
 * Le contenu HTML est entièrement administrable sans toucher au code.
 */
export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-heading text-3xl font-bold text-foreground">{page.title}</h1>
      <div
        className="prose prose-neutral mt-6 max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
