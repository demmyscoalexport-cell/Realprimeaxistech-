import { Router, type IRouter } from "express";
import { count, desc, eq } from "drizzle-orm";
import {
  db,
  categoriesTable,
  articlesTable,
  reviewsTable,
  videosTable,
} from "@workspace/db";
import { GetHomeFeedResponse } from "@workspace/api-zod";
import { listArticleSummaries } from "./articles-helpers";

const router: IRouter = Router();

router.get("/home/feed", async (_req, res): Promise<void> => {
  const all = await listArticleSummaries({ limit: 100 });

  const featured = all.find((a) => a.isFeature) ?? all[0];
  const heroId = featured?.id;
  const spotlight = all.filter((a) => a.id !== heroId).slice(0, 4);
  const trending = [...all]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 6);
  const latest = all.slice(0, 8);
  const aiAndFuture = all
    .filter((a) =>
      ["ai", "future-tech", "robotics", "vr-ar"].includes(a.category.slug),
    )
    .slice(0, 6);
  const gamingAndEntertainment = all
    .filter((a) =>
      ["gaming", "entertainment", "streaming"].includes(a.category.slug),
    )
    .slice(0, 4);
  const investigations = all
    .filter((a) => a.tags.includes("investigation") || a.readingMinutes >= 8)
    .slice(0, 3);
  const buyingGuides = all
    .filter((a) => a.tags.includes("buying-guide"))
    .slice(0, 4);
  const startups = all
    .filter((a) => a.category.slug === "startups")
    .slice(0, 4);
  const mostDiscussed = [...all]
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 5);

  const featuredReviews = await db
    .select({
      id: reviewsTable.id,
      slug: reviewsTable.slug,
      productName: reviewsTable.productName,
      tagline: reviewsTable.tagline,
      heroImageUrl: reviewsTable.heroImageUrl,
      score: reviewsTable.score,
      verdict: reviewsTable.verdict,
      publishedAt: reviewsTable.publishedAt,
      priceUsd: reviewsTable.priceUsd,
      categorySlug: categoriesTable.slug,
      categoryName: categoriesTable.name,
      categoryAccent: categoriesTable.accentColor,
    })
    .from(reviewsTable)
    .innerJoin(
      categoriesTable,
      eq(reviewsTable.categoryId, categoriesTable.id),
    )
    .orderBy(desc(reviewsTable.score))
    .limit(6);

  const videos = await db
    .select({
      id: videosTable.id,
      slug: videosTable.slug,
      title: videosTable.title,
      description: videosTable.description,
      thumbnailUrl: videosTable.thumbnailUrl,
      durationSeconds: videosTable.durationSeconds,
      publishedAt: videosTable.publishedAt,
      viewCount: videosTable.viewCount,
      categorySlug: categoriesTable.slug,
      categoryName: categoriesTable.name,
      categoryAccent: categoriesTable.accentColor,
    })
    .from(videosTable)
    .innerJoin(categoriesTable, eq(videosTable.categoryId, categoriesTable.id))
    .orderBy(desc(videosTable.publishedAt))
    .limit(6);

  const cats = await db.select().from(categoriesTable);
  const counts = await db
    .select({ categoryId: articlesTable.categoryId, c: count() })
    .from(articlesTable)
    .groupBy(articlesTable.categoryId);
  const cmap = new Map(counts.map((r) => [r.categoryId, Number(r.c)]));
  const categories = cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    accentColor: c.accentColor,
    articleCount: cmap.get(c.id) ?? 0,
  }));

  res.json(
    GetHomeFeedResponse.parse({
      hero: featured,
      spotlight,
      trending,
      latest,
      featuredReviews: featuredReviews.map((r) => ({
        id: r.id,
        slug: r.slug,
        productName: r.productName,
        tagline: r.tagline,
        heroImageUrl: r.heroImageUrl,
        score: r.score,
        verdict: r.verdict,
        publishedAt: r.publishedAt.toISOString(),
        priceUsd: r.priceUsd,
        category: {
          slug: r.categorySlug,
          name: r.categoryName,
          accentColor: r.categoryAccent,
        },
      })),
      aiAndFuture,
      gamingAndEntertainment,
      videos: videos.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        durationSeconds: r.durationSeconds,
        publishedAt: r.publishedAt.toISOString(),
        viewCount: r.viewCount,
        category: {
          slug: r.categorySlug,
          name: r.categoryName,
          accentColor: r.categoryAccent,
        },
      })),
      investigations,
      buyingGuides,
      startups,
      mostDiscussed,
      categories,
    }),
  );
});

export default router;
