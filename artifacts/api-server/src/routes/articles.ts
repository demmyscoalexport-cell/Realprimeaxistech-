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
  AskArticleParams,
  AskArticleBody,
  AskArticleResponse,
} from "@workspace/api-zod";
import {
  listArticleSummaries,
  getArticleBySlug,
} from "../lib/cms";
import {
  askArticleQuestion,
  getRelatedArticlesSemantic,
  semanticSearchArticles,
} from "../lib/article-ai";
import { isCohereConfigured } from "../lib/cohere";
import { logger } from "../lib/logger";

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
  const rows = await semanticSearchArticles(q.data.q, q.data.limit ?? 20);
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
  const rows = await getRelatedArticlesSemantic(article, 6);
  res.json(GetRelatedArticlesResponse.parse(rows));
});

router.post("/articles/:slug/ask", async (req, res): Promise<void> => {
  const params = AskArticleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AskArticleBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (!isCohereConfigured()) {
    res.status(503).json({ error: "Article Q&A is temporarily unavailable" });
    return;
  }

  const article = await getArticleBySlug(params.data.slug);
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  try {
    const answer = await askArticleQuestion(article, body.data.question);
    res.json(AskArticleResponse.parse({ answer }));
  } catch (error) {
    logger.warn({ err: error }, "Article ask failed");
    res.status(503).json({ error: "Article Q&A is temporarily unavailable" });
  }
});

export default router;
