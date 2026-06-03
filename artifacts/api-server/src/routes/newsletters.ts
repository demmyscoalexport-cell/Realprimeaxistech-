import { Router, type IRouter } from "express";
import {
  ListNewslettersResponse,
  SubscribeNewsletterBody,
} from "@workspace/api-zod";
import { sendNewsletterWelcomeEmail } from "../lib/resend";
import {
  isSanityWriteConfigured,
  listNewsletterSummaries,
  subscribeNewsletterInSanity,
} from "../lib/cms";

const router: IRouter = Router();
const subscribeAttempts = new Map<string, { count: number; resetAt: number }>();
const SUBSCRIBE_WINDOW_MS = 10 * 60 * 1000;
const SUBSCRIBE_MAX_ATTEMPTS = 5;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = subscribeAttempts.get(key);
  if (!current || current.resetAt <= now) {
    subscribeAttempts.set(key, {
      count: 1,
      resetAt: now + SUBSCRIBE_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > SUBSCRIBE_MAX_ATTEMPTS;
}

router.get("/newsletters", async (_req, res): Promise<void> => {
  try {
    const rows = await listNewsletterSummaries();
    res.json(ListNewslettersResponse.parse(rows));
  } catch (e) {
    res.json(ListNewslettersResponse.parse([]));
  }
});

router.post("/newsletters/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!isSanityWriteConfigured()) {
    res.status(503).json({
      error:
        "Newsletter subscriptions require SANITY_API_TOKEN to be configured in .env",
    });
    return;
  }

  const rateLimitKey = `${req.ip}:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    res.status(429).json({ error: "Too many subscription attempts" });
    return;
  }
  try {
    const row = await subscribeNewsletterInSanity({
      email: parsed.data.email,
      newsletterSlug: parsed.data.newsletterSlug,
    });
    if (!row) {
      res.status(404).json({ error: "Newsletter not found" });
      return;
    }

    if (row.created) {
      try {
        await sendNewsletterWelcomeEmail({
          email: row.email,
          newsletterSlug: row.newsletterSlug,
        });
      } catch (e) {
        req.log.warn({ err: e }, "Newsletter welcome email failed");
      }
      res.status(201).json({
        id: row.id,
        email: row.email,
        newsletterSlug: row.newsletterSlug,
        createdAt: row.createdAt,
      });
      return;
    }

    res.status(201).json({
      id: row.id,
      email: row.email,
      newsletterSlug: row.newsletterSlug,
      createdAt: row.createdAt,
    });
  } catch (e) {
    req.log.error({ err: e }, "Newsletter subscribe failed");
    if (
      typeof e === "object" &&
      e !== null &&
      "statusCode" in e &&
      e.statusCode === 403
    ) {
      res.status(503).json({
        error:
          "Newsletter subscriptions require a SANITY_API_TOKEN with create/update permissions",
      });
      return;
    }
    res.status(400).json({ error: "Subscription failed" });
  }
});

export default router;
