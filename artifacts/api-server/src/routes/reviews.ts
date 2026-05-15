import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  reviewsTable,
  categoriesTable,
  authorsTable,
} from "@workspace/db";
import {
  ListReviewsQueryParams,
  ListReviewsResponse,
  ListBestPicksResponse,
  GetReviewBySlugParams,
  GetReviewBySlugResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const summaryCols = {
  id: reviewsTable.id,
  slug: reviewsTable.slug,
  productName: reviewsTable.productName,
  tagline: reviewsTable.tagline,
  heroImageUrl: reviewsTable.heroImageUrl,
  score: reviewsTable.score,
  verdict: reviewsTable.verdict,
  publishedAt: reviewsTable.publishedAt,
  priceUsd: reviewsTable.priceUsd,
  isBestPick: reviewsTable.isBestPick,
  categorySlug: categoriesTable.slug,
  categoryName: categoriesTable.name,
  categoryAccent: categoriesTable.accentColor,
};

function toSummary(r: {
  id: number;
  slug: string;
  productName: string;
  tagline: string;
  heroImageUrl: string;
  score: number;
  verdict: string;
  publishedAt: Date;
  priceUsd: number;
  categorySlug: string;
  categoryName: string;
  categoryAccent: string;
}) {
  return {
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
  };
}

router.get("/reviews", async (req, res): Promise<void> => {
  const q = ListReviewsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await db
    .select(summaryCols)
    .from(reviewsTable)
    .innerJoin(
      categoriesTable,
      eq(reviewsTable.categoryId, categoriesTable.id),
    )
    .orderBy(desc(reviewsTable.publishedAt))
    .limit(q.data.limit ?? 20);
  res.json(ListReviewsResponse.parse(rows.map(toSummary)));
});

router.get("/reviews/best-picks", async (_req, res): Promise<void> => {
  const rows = await db
    .select(summaryCols)
    .from(reviewsTable)
    .innerJoin(
      categoriesTable,
      eq(reviewsTable.categoryId, categoriesTable.id),
    )
    .where(eq(reviewsTable.isBestPick, true))
    .orderBy(desc(reviewsTable.score));
  res.json(ListBestPicksResponse.parse(rows.map(toSummary)));
});

router.get("/reviews/:slug", async (req, res): Promise<void> => {
  const params = GetReviewBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(reviewsTable)
    .innerJoin(
      categoriesTable,
      eq(reviewsTable.categoryId, categoriesTable.id),
    )
    .innerJoin(authorsTable, eq(reviewsTable.authorId, authorsTable.id))
    .where(eq(reviewsTable.slug, params.data.slug));
  if (!row) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  const r = row.reviews;
  const c = row.categories;
  const au = row.authors;
  res.json(
    GetReviewBySlugResponse.parse({
      id: r.id,
      slug: r.slug,
      productName: r.productName,
      tagline: r.tagline,
      heroImageUrl: r.heroImageUrl,
      galleryImages: r.galleryImages,
      score: r.score,
      verdict: r.verdict,
      summary: r.summary,
      category: { slug: c.slug, name: c.name, accentColor: c.accentColor },
      author: {
        slug: au.slug,
        name: au.name,
        avatarUrl: au.avatarUrl,
        role: au.role,
      },
      publishedAt: r.publishedAt.toISOString(),
      priceUsd: r.priceUsd,
      pros: r.pros,
      cons: r.cons,
      ratings: r.ratings,
      sections: r.sections,
    }),
  );
});

export default router;
