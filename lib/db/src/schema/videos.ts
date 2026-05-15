import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  categoryId: integer("category_id").notNull(),
  viewCount: integer("view_count").notNull().default(0),
});

export type Video = typeof videosTable.$inferSelect;
