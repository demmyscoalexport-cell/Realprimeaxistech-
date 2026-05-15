import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, categoriesTable, articlesTable } from "@workspace/db";
import {
  ListCategoriesResponse,
  GetCategoryBySlugResponse,
  GetCategoryBySlugParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function listWithCounts() {
  const cats = await db.select().from(categoriesTable);
  const counts = await db
    .select({ categoryId: articlesTable.categoryId, c: count() })
    .from(articlesTable)
    .groupBy(articlesTable.categoryId);
  const map = new Map(counts.map((r) => [r.categoryId, Number(r.c)]));
  return cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    accentColor: c.accentColor,
    articleCount: map.get(c.id) ?? 0,
  }));
}

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await listWithCounts();
  res.json(ListCategoriesResponse.parse(rows));
});

router.get("/categories/:slug", async (req, res): Promise<void> => {
  const params = GetCategoryBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [cat] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, params.data.slug));
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const allCounts = await listWithCounts();
  const withCount = allCounts.find((c) => c.id === cat.id)!;

  const { listArticleSummaries } = await import("./articles-helpers");
  const articles = await listArticleSummaries({ categoryId: cat.id });

  res.json(
    GetCategoryBySlugResponse.parse({
      category: withCount,
      articles,
    }),
  );
});

export default router;
