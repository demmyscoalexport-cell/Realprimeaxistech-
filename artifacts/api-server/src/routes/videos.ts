import { Router, type IRouter } from "express";
import {
  ListVideosQueryParams,
  ListVideosResponse,
} from "@workspace/api-zod";
import { listVideoSummaries } from "../lib/sanity";

const router: IRouter = Router();

router.get("/videos", async (req, res): Promise<void> => {
  const q = ListVideosQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await listVideoSummaries(q.data.limit ?? 20);
  res.json(ListVideosResponse.parse(rows));
});

export default router;
