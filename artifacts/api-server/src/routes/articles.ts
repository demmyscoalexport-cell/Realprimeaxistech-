import { Router, type IRouter } from "express";
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
  getArticleBySlug,
} from "../lib/cms";

const router: IRouter = Router();

router.get("/articles", async (req, res): Promise<void> => {
  const q = ListArticlesQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await listArticleSummaries({
    categorySlug: q.data.category,
    subcategorySlug: q.data.subcategory,
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
  const article = await getArticleBySlug(params.data.slug);
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(GetArticleBySlugResponse.parse(article));
});

router.get("/articles/:slug/related", async (req, res): Promise<void> => {
  const params = GetRelatedArticlesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const article = await getArticleBySlug(params.data.slug);
  if (!article) {
    res.json(GetRelatedArticlesResponse.parse([]));
    return;
  }
  const rows = await listArticleSummaries({
    categorySlug: article.category.slug,
    excludeSlug: article.slug,
    limit: 6,
  });
  res.json(GetRelatedArticlesResponse.parse(rows));
});

export default router;
