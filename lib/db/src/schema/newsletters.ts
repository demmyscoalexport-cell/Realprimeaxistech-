import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const newslettersTable = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  cadence: text("cadence").notNull(),
  subscriberCount: integer("subscriber_count").notNull().default(0),
  accentColor: text("accent_color").notNull(),
});

export const newsletterSubscriptionsTable = pgTable(
  "newsletter_subscriptions",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    newsletterSlug: text("newsletter_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailNewsletterIdx: uniqueIndex("nl_sub_email_slug_idx").on(
      t.email,
      t.newsletterSlug,
    ),
  }),
);

export type Newsletter = typeof newslettersTable.$inferSelect;
export type NewsletterSubscription =
  typeof newsletterSubscriptionsTable.$inferSelect;
