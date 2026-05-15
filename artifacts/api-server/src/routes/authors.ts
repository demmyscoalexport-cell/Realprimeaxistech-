import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, authorsTable, articlesTable } from "@workspace/db";
import {
  ListAuthorsResponse,
  GetAuthorBySlugParams,
  GetAuthorBySlugResponse,
} from "@workspace/api-zod";
import { listArticleSummaries } from "./articles-helpers";

const router: IRouter = Router();

router.get("/authors", async (_req, res): Promise<void> => {
  const authors = await db.select().from(authorsTable);
  const counts = await db
    .select({ authorId: articlesTable.authorId, c: count() })
    .from(articlesTable)
    .groupBy(articlesTable.authorId);
  const map = new Map(counts.map((r) => [r.authorId, Number(r.c)]));
  const data = authors.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    role: a.role,
    avatarUrl: a.avatarUrl,
    bio: a.bio,
    twitter: a.twitter,
    articleCount: map.get(a.id) ?? 0,
  }));
  res.json(ListAuthorsResponse.parse(data));
});

router.get("/authors/:slug", async (req, res): Promise<void> => {
  const params = GetAuthorBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [a] = await db
    .select()
    .from(authorsTable)
    .where(eq(authorsTable.slug, params.data.slug));
  if (!a) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  const articles = await listArticleSummaries({ authorId: a.id, limit: 12 });
  const cnt = await db
    .select({ c: count() })
    .from(articlesTable)
    .where(eq(articlesTable.authorId, a.id));
  res.json(
    GetAuthorBySlugResponse.parse({
      author: {
        id: a.id,
        slug: a.slug,
        name: a.name,
        role: a.role,
        avatarUrl: a.avatarUrl,
        bio: a.bio,
        twitter: a.twitter,
        articleCount: Number(cnt[0]?.c ?? 0),
      },
      articles,
    }),
  );
});

export default router;
