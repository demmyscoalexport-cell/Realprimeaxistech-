import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  accentColor: text("accent_color").notNull(),
});

export type Category = typeof categoriesTable.$inferSelect;
