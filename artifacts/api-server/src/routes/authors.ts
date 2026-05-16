import { Router, type IRouter } from "express";
import {
  ListAuthorsResponse,
  GetAuthorBySlugParams,
  GetAuthorBySlugResponse,
} from "@workspace/api-zod";
import {
  listAuthorsWithCounts,
  getAuthorBySlug,
  listArticleSummaries,
} from "../lib/cms";

const router: IRouter = Router();

router.get("/authors", async (_req, res): Promise<void> => {
  const rows = await listAuthorsWithCounts();
  res.json(ListAuthorsResponse.parse(rows));
});

router.get("/authors/:slug", async (req, res): Promise<void> => {
  const params = GetAuthorBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const author = await getAuthorBySlug(params.data.slug);
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  const articles = await listArticleSummaries({
    authorSlug: params.data.slug,
    limit: 12,
  });
  res.json(GetAuthorBySlugResponse.parse({ author, articles }));
});

export default router;
