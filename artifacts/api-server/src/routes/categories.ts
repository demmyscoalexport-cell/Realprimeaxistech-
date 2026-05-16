import { Router, type IRouter } from "express";
import {
  ListCategoriesResponse,
  GetCategoryBySlugResponse,
  GetCategoryBySlugParams,
} from "@workspace/api-zod";
import {
  listCategoriesWithCounts,
  getCategoryBySlug,
  listArticleSummaries,
} from "../lib/cms";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await listCategoriesWithCounts();
  res.json(ListCategoriesResponse.parse(rows));
});

router.get("/categories/:slug", async (req, res): Promise<void> => {
  const params = GetCategoryBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const cat = await getCategoryBySlug(params.data.slug);
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const articles = await listArticleSummaries({
    categorySlug: params.data.slug,
  });
  res.json(GetCategoryBySlugResponse.parse({ category: cat, articles }));
});

export default router;
