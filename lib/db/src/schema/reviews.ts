import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

export type ReviewRating = { label: string; score: number };
export type ReviewSection = { heading: string; body: string };

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  productName: text("product_name").notNull(),
  tagline: text("tagline").notNull(),
  heroImageUrl: text("hero_image_url").notNull(),
  galleryImages: text("gallery_images").array().notNull().default([]),
  score: doublePrecision("score").notNull(),
  verdict: text("verdict").notNull(),
  summary: text("summary").notNull(),
  categoryId: integer("category_id").notNull(),
  authorId: integer("author_id").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  priceUsd: doublePrecision("price_usd").notNull(),
  pros: text("pros").array().notNull().default([]),
  cons: text("cons").array().notNull().default([]),
  ratings: jsonb("ratings").$type<ReviewRating[]>().notNull(),
  sections: jsonb("sections").$type<ReviewSection[]>().notNull(),
  isBestPick: boolean("is_best_pick").notNull().default(false),
});

export type Review = typeof reviewsTable.$inferSelect;
