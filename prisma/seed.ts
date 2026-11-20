import { PrismaClient, ArticleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  "Monde", "Afrique", "RDC", "Politique", "Économie", "Société",
  "Technologie", "Santé", "Sport", "Culture", "Éducation",
  "Environnement", "Business", "International", "Opinion", "People", "Vidéo",
];

const AUTHOR_SEED = [
  { name: "Amina Kovács", position: "Rédactrice en chef", specialty: "Politique internationale" },
  { name: "Jean-Paul Mwamba", position: "Journaliste senior", specialty: "Économie" },
  { name: "Sarah Delacroix", position: "Journaliste", specialty: "Technologie" },
  { name: "David Nkulu", position: "Correspondant", specialty: "RDC & Afrique" },
  { name: "Lucie Tanguy", position: "Journaliste", specialty: "Société & Culture" },
];

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Démarrage du seed World News...");

  // --- Utilisateur super admin ---------------------------------------------
  // Mot de passe initial fourni par variable d'environnement.
  // Ne jamais stocker un mot de passe administrateur dans le dépôt Git.
  const initialPassword = process.env.SEED_INITIAL_PASSWORD;
  if (!initialPassword || initialPassword.length < 12) {
    throw new Error(
      "Définir SEED_INITIAL_PASSWORD (au moins 12 caractères) avant d'exécuter le seed."
    );
  }
  const hashedPassword = await bcrypt.hash(initialPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@world-news.com" },
    update: {},
    create: {
      name: "Administrateur Principal",
      email: "admin@world-news.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIF",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Super admin créé :", superAdmin.email);

  // --- Catégories -------------------------------------------------------------
  const categories = [];
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const name = DEFAULT_CATEGORIES[i]!;
    const category = await prisma.category.upsert({
      where: { slug: toSlug(name) },
      update: {},
      create: {
        name,
        slug: toSlug(name),
        order: i,
      },
    });
    categories.push(category);
  }
  console.log(`✅ ${categories.length} catégories créées`);

  // --- Auteurs (User + Author) -------------------------------------------------
  const authors = [];
  for (const a of AUTHOR_SEED) {
    const email = `${toSlug(a.name)}@world-news.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: a.name,
        email,
        password: hashedPassword,
        role: "JOURNALIST",
        status: "ACTIF",
        emailVerified: new Date(),
      },
    });

    const author = await prisma.author.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        slug: toSlug(a.name),
        displayName: a.name,
        position: a.position,
        specialty: a.specialty,
        bio: `${a.name} couvre l'actualité ${a.specialty.toLowerCase()} pour World News.`,
      },
    });
    authors.push(author);
  }
  console.log(`✅ ${authors.length} auteurs créés`);

  // --- Tags ------------------------------------------------------------------
  const tagNames = ["Analyse", "Enquête", "International", "Exclusif", "Interview", "Reportage"];
  const tags = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { slug: toSlug(name) },
      update: {},
      create: { name, slug: toSlug(name) },
    });
    tags.push(tag);
  }
  console.log(`✅ ${tags.length} tags créés`);

  // --- Articles de démonstration (15) ------------------------------------------
  const articleTitles = [
    "Sommet international : les dirigeants s'accordent sur un nouveau pacte climatique",
    "L'économie mondiale face à un ralentissement inattendu",
    "Innovation technologique : l'intelligence artificielle transforme les salles de rédaction",
    "RDC : nouvelles avancées dans les négociations régionales",
    "Santé publique : les autorités renforcent la surveillance épidémiologique",
    "Sport : résultats marquants de la journée continentale",
    "Culture : le patrimoine africain célébré lors d'un festival international",
    "Éducation : réforme majeure annoncée pour le système scolaire",
    "Environnement : les experts alertent sur la fonte accélérée des glaciers",
    "Business : une start-up africaine lève des fonds record",
    "Politique : remaniement ministériel attendu dans les prochains jours",
    "Société : le débat sur le télétravail relancé après une nouvelle étude",
    "International : tensions diplomatiques autour d'un accord commercial",
    "Opinion : pourquoi l'Afrique doit investir davantage dans le numérique",
    "People : rencontre avec une figure montante de la scène culturelle",
  ];

  let createdCount = 0;
  for (let i = 0; i < articleTitles.length; i++) {
    const title = articleTitles[i]!;
    const slug = toSlug(title);
    const author = authors[i % authors.length]!;
    const category = categories[i % categories.length]!;
    const isPublished = i < 12; // 12 publiés, 3 en brouillon/programmé

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) continue;

    await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: `${title} — retrouvez notre analyse complète et les réactions des principaux acteurs concernés.`,
        content: JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: `Article de démonstration : ${title}.` }] },
            { type: "paragraph", content: [{ type: "text", text: "Contenu généré automatiquement par le seed de démonstration World News." }] },
          ],
        }),
        authorId: author.id,
        createdById: superAdmin.id,
        categoryId: category.id,
        status: isPublished ? ArticleStatus.PUBLIE : i === 12 ? ArticleStatus.PROGRAMME : ArticleStatus.BROUILLON,
        publishedAt: isPublished ? new Date(Date.now() - i * 3600 * 1000) : null,
        scheduledAt: i === 12 ? new Date(Date.now() + 24 * 3600 * 1000) : null,
        isFeatured: i === 0,
        isTrending: i < 4,
        isBreaking: i === 0,
        readingTimeMin: 3 + (i % 5),
        viewCount: Math.floor(Math.random() * 5000),
        tags: {
          connect: [{ id: tags[i % tags.length]!.id }, { id: tags[(i + 1) % tags.length]!.id }],
        },
      },
    });
    createdCount++;
  }
  console.log(`✅ ${createdCount} articles créés`);

  // --- Menu principal -----------------------------------------------------------
  const mainMenu = await prisma.menu.upsert({
    where: { slug: "menu-principal" },
    update: {},
    create: { name: "Menu principal", slug: "menu-principal" },
  });

  for (let i = 0; i < 6; i++) {
    const category = categories[i]!;
    const existingItem = await prisma.menuItem.findFirst({
      where: { menuId: mainMenu.id, targetId: category.id },
    });
    if (!existingItem) {
      await prisma.menuItem.create({
        data: {
          menuId: mainMenu.id,
          label: category.name,
          type: "CATEGORIE",
          targetId: category.id,
          order: i,
        },
      });
    }
  }
  console.log("✅ Menu principal créé avec 6 catégories");

  // --- Réseaux sociaux ------------------------------------------------------------
  const socialPlatforms = [
    { platform: "facebook", url: "https://facebook.com/worldnews" },
    { platform: "x", url: "https://x.com/worldnews" },
    { platform: "instagram", url: "https://instagram.com/worldnews" },
    { platform: "youtube", url: "https://youtube.com/@worldnews" },
    { platform: "linkedin", url: "https://linkedin.com/company/worldnews" },
    { platform: "whatsapp", url: "https://wa.me/00000000000" },
    { platform: "telegram", url: "https://t.me/worldnews" },
    { platform: "tiktok", url: "https://tiktok.com/@worldnews" },
  ];

  for (let i = 0; i < socialPlatforms.length; i++) {
    await prisma.socialLink.upsert({
      where: { platform: socialPlatforms[i]!.platform },
      update: {},
      create: { ...socialPlatforms[i]!, order: i, enabled: true },
    });
  }
  console.log("✅ Réseaux sociaux configurés");

  // --- Paramètres d'identité et de couleurs (valeurs par défaut du §51) -----------
  const defaultSettings: Array<{ key: string; value: string; group: string }> = [
    { key: "identity.siteName", value: "World News", group: "identite" },
    { key: "identity.tagline", value: "L'information qui vous connecte au monde.", group: "identite" },
    { key: "colors.primary", value: "213 63% 14%", group: "couleurs" },
    { key: "colors.secondary", value: "0 65% 47%", group: "couleurs" },
    { key: "colors.accent", value: "0 65% 47%", group: "couleurs" },
    { key: "colors.background", value: "0 0% 100%", group: "couleurs" },
    { key: "colors.text", value: "220 39% 11%", group: "couleurs" },
    { key: "typography.fontPrimary", value: "Inter", group: "typographie" },
    { key: "typography.fontHeading", value: "Inter", group: "typographie" },
    { key: "comments.autoApprove", value: "false", group: "commentaires" },
    { key: "maintenance.enabled", value: "false", group: "general" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Paramètres par défaut initialisés");

  // --- SEO settings ---------------------------------------------------------------
  const existingSeo = await prisma.seoSetting.findFirst();
  if (!existingSeo) {
    await prisma.seoSetting.create({
      data: {
        globalTitle: "World News — L'information qui vous connecte au monde",
        globalDescription:
          "World News est votre source d'actualités internationales, africaines et locales, mise à jour en continu.",
        keywords: "actualités, news, monde, afrique, RDC, politique, économie",
      },
    });
  }
  console.log("✅ Paramètres SEO initialisés");

  // --- Pages par défaut -------------------------------------------------------------
  const defaultPages = [
    { title: "À propos", slug: "a-propos" },
    { title: "Contact", slug: "contact" },
    { title: "Politique de confidentialité", slug: "politique-confidentialite" },
    { title: "Conditions d'utilisation", slug: "conditions" },
  ];

  for (const p of defaultPages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        content: `<p>Contenu de la page "${p.title}" à personnaliser depuis l'administration.</p>`,
        status: "PUBLIE",
      },
    });
  }
  console.log(`✅ ${defaultPages.length} pages par défaut créées`);

  console.log("\n🎉 Seed terminé avec succès.");
  console.log("   Connexion admin : admin@world-news.com / WorldNews2026!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
