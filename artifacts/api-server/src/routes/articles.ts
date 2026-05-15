import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  articlesTable,
  categoriesTable,
  authorsTable,
} from "@workspace/db";
import {
  ListArticlesQueryParams,
  ListArticlesResponse,
  ListTrendingArticlesQueryParams,
  ListTrendingArticlesResponse,
  ListMostDiscussedArticlesQueryParams,
  ListMostDiscussedArticlesResponse,
  SearchArticlesQueryParams,
  SearchArticlesResponse,
  GetArticleBySlugParams,
  GetArticleBySlugResponse,
  GetRelatedArticlesParams,
  GetRelatedArticlesResponse,
} from "@workspace/api-zod";
import {
  listArticleSummaries,
  searchArticleSummaries,
} from "./articles-helpers";

const router: IRouter = Router();

router.get("/articles", async (req, res): Promise<void> => {
  const q = ListArticlesQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await listArticleSummaries({
    categorySlug: q.data.category,
    tag: q.data.tag,
    limit: q.data.limit,
    offset: q.data.offset,
  });
  res.json(ListArticlesResponse.parse(rows));
});

router.get("/articles/trending", async (req, res): Promise<void> => {
  const q = ListTrendingArticlesQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await listArticleSummaries({
    limit: q.data.limit ?? 8,
    orderBy: "views",
  });
  res.json(ListTrendingArticlesResponse.parse(rows));
});

router.get("/articles/most-discussed", async (req, res): Promise<void> => {
  const q = ListMostDiscussedArticlesQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await listArticleSummaries({
    limit: q.data.limit ?? 8,
    orderBy: "comments",
  });
  res.json(ListMostDiscussedArticlesResponse.parse(rows));
});

router.get("/articles/search", async (req, res): Promise<void> => {
  const q = SearchArticlesQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await searchArticleSummaries(q.data.q, q.data.limit ?? 20);
  res.json(SearchArticlesResponse.parse(rows));
});

router.get("/articles/:slug", async (req, res): Promise<void> => {
  const params = GetArticleBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(articlesTable)
    .innerJoin(
      categoriesTable,
      eq(articlesTable.categoryId, categoriesTable.id),
    )
    .innerJoin(authorsTable, eq(articlesTable.authorId, authorsTable.id))
    .where(eq(articlesTable.slug, params.data.slug));

  if (!row) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  const a = row.articles;
  const c = row.categories;
  const au = row.authors;

  res.json(
    GetArticleBySlugResponse.parse({
      id: a.id,
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      excerpt: a.excerpt,
      heroImageUrl: a.heroImageUrl,
      category: { slug: c.slug, name: c.name, accentColor: c.accentColor },
      author: {
        slug: au.slug,
        name: au.name,
        avatarUrl: au.avatarUrl,
        role: au.role,
      },
      publishedAt: a.publishedAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      readingMinutes: a.readingMinutes,
      tags: a.tags,
      body: a.body,
      keyTakeaways: a.keyTakeaways,
      aiSummary: a.aiSummary,
      viewCount: a.viewCount,
      commentCount: a.commentCount,
      isBreaking: a.isBreaking,
      isFeature: a.isFeature,
    }),
  );
});

router.get("/articles/:slug/related", async (req, res): Promise<void> => {
  const params = GetRelatedArticlesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [a] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, params.data.slug));
  if (!a) {
    res.json(GetRelatedArticlesResponse.parse([]));
    return;
  }
  const rows = await listArticleSummaries({
    categoryId: a.categoryId,
    excludeId: a.id,
    limit: 6,
  });
  res.json(GetRelatedArticlesResponse.parse(rows));
});

export default router;
