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

const router: IRouter = Router();

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
  if (!isDatabaseConfigured()) {
    res.status(503).json({
      error:
        "Newsletter subscriptions require DATABASE_URL to be configured in .env",
    });
    return;
  }

  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
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
