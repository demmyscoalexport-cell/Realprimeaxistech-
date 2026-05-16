import { Router, type IRouter } from "express";
import {
  ListReviewsQueryParams,
  ListReviewsResponse,
  ListBestPicksResponse,
  GetReviewBySlugParams,
  GetReviewBySlugResponse,
} from "@workspace/api-zod";
import { listReviewSummaries, getReviewBySlug } from "../lib/cms";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const q = ListReviewsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await listReviewSummaries(q.data.limit ?? 20, false);
  res.json(ListReviewsResponse.parse(rows));
});

router.get("/reviews/best-picks", async (_req, res): Promise<void> => {
  const rows = await listReviewSummaries(50, true);
  res.json(ListBestPicksResponse.parse(rows));
});

router.get("/reviews/:slug", async (req, res): Promise<void> => {
  const params = GetReviewBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const review = await getReviewBySlug(params.data.slug);
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  res.json(GetReviewBySlugResponse.parse(review));
});

export default router;
