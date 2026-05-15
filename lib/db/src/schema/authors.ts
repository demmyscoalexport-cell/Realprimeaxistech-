import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const authorsTable = pgTable("authors", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  bio: text("bio"),
  twitter: text("twitter"),
});

export type Author = typeof authorsTable.$inferSelect;
