import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, videosTable, categoriesTable } from "@workspace/db";
import {
  ListVideosQueryParams,
  ListVideosResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/videos", async (req, res): Promise<void> => {
  const q = ListVideosQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await db
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
    .limit(q.data.limit ?? 20);

  res.json(
    ListVideosResponse.parse(
      rows.map((r) => ({
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
    ),
  );
});

export default router;
