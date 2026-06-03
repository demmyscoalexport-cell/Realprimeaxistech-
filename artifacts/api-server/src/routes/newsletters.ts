import { Router, type IRouter } from "express";
import {
  getDb,
  isDatabaseConfigured,
  newslettersTable,
  newsletterSubscriptionsTable,
} from "@workspace/db";
import {
  ListNewslettersResponse,
  SubscribeNewsletterBody,
} from "@workspace/api-zod";
import { sql } from "drizzle-orm";
import { sendNewsletterWelcomeEmail } from "../lib/resend";

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
  if (!isDatabaseConfigured()) {
    res.json(ListNewslettersResponse.parse([]));
    return;
  }
  try {
    const db = getDb();
    const rows = await db.select().from(newslettersTable);
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

  if (!isDatabaseConfigured()) {
    res.status(503).json({
      error:
        "Newsletter subscriptions require DATABASE_URL to be configured in .env",
    });
    return;
  }

  const rateLimitKey = `${req.ip}:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    res.status(429).json({ error: "Too many subscription attempts" });
    return;
  }
  try {
    const db = getDb();
    const [row] = await db
      .insert(newsletterSubscriptionsTable)
      .values({
        email: parsed.data.email,
        newsletterSlug: parsed.data.newsletterSlug,
      })
      .onConflictDoNothing()
      .returning();
    if (row) {
      await db
        .update(newslettersTable)
        .set({
          subscriberCount: sql`${newslettersTable.subscriberCount} + 1`,
        })
        .where(sql`${newslettersTable.slug} = ${parsed.data.newsletterSlug}`);
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
        createdAt: row.createdAt.toISOString(),
      });
      return;
    }
    res.status(201).json({
      id: 0,
      email: parsed.data.email,
      newsletterSlug: parsed.data.newsletterSlug,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    req.log.error({ err: e }, "Newsletter subscribe failed");
    res.status(400).json({ error: "Subscription failed" });
  }
});

export default router;
