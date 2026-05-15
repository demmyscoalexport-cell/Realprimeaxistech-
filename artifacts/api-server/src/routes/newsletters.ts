import { Router, type IRouter } from "express";
import { db, newslettersTable, newsletterSubscriptionsTable } from "@workspace/db";
import {
  ListNewslettersResponse,
  SubscribeNewsletterBody,
} from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/newsletters", async (_req, res): Promise<void> => {
  const rows = await db.select().from(newslettersTable);
  res.json(ListNewslettersResponse.parse(rows));
});

router.post("/newsletters/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
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
