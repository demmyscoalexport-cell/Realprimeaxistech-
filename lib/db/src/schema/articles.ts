import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export type ArticleBlock = {
  type: "paragraph" | "heading" | "quote" | "image" | "list";
  content: string;
  caption?: string | null;
  items?: string[] | null;
};

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  excerpt: text("excerpt").notNull(),
  heroImageUrl: text("hero_image_url").notNull(),
  categoryId: integer("category_id").notNull(),
  authorId: integer("author_id").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  readingMinutes: integer("reading_minutes").notNull(),
  tags: text("tags").array().notNull().default([]),
  body: jsonb("body").$type<ArticleBlock[]>().notNull(),
  keyTakeaways: text("key_takeaways").array().notNull().default([]),
  aiSummary: text("ai_summary").notNull(),
  viewCount: integer("view_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  isBreaking: boolean("is_breaking").notNull().default(false),
  isFeature: boolean("is_feature").notNull().default(false),
  section: text("section").notNull().default("news"),
});

export type Article = typeof articlesTable.$inferSelect;
