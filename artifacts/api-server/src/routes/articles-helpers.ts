import { and, desc, eq, ilike, or, sql, ne } from "drizzle-orm";
import {
  db,
  articlesTable,
  categoriesTable,
  authorsTable,
} from "@workspace/db";

export type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string;
  category: { slug: string; name: string; accentColor: string };
  author: { slug: string; name: string; avatarUrl: string; role: string };
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  isBreaking: boolean;
  isFeature: boolean;
  viewCount: number;
  commentCount: number;
};

const summaryColumns = {
  id: articlesTable.id,
  slug: articlesTable.slug,
  title: articlesTable.title,
  excerpt: articlesTable.excerpt,
  heroImageUrl: articlesTable.heroImageUrl,
  publishedAt: articlesTable.publishedAt,
  readingMinutes: articlesTable.readingMinutes,
  tags: articlesTable.tags,
  isBreaking: articlesTable.isBreaking,
  isFeature: articlesTable.isFeature,
  viewCount: articlesTable.viewCount,
  commentCount: articlesTable.commentCount,
  section: articlesTable.section,
  categorySlug: categoriesTable.slug,
  categoryName: categoriesTable.name,
  categoryAccent: categoriesTable.accentColor,
  authorSlug: authorsTable.slug,
  authorName: authorsTable.name,
  authorAvatar: authorsTable.avatarUrl,
  authorRole: authorsTable.role,
};

function rowToSummary(r: {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string;
  publishedAt: Date;
  readingMinutes: number;
  tags: string[];
  isBreaking: boolean;
  isFeature: boolean;
  viewCount: number;
  commentCount: number;
  categorySlug: string;
  categoryName: string;
  categoryAccent: string;
  authorSlug: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
}): ArticleSummary {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    heroImageUrl: r.heroImageUrl,
    publishedAt: r.publishedAt.toISOString(),
    readingMinutes: r.readingMinutes,
    tags: r.tags,
    isBreaking: r.isBreaking,
    isFeature: r.isFeature,
    viewCount: r.viewCount,
    commentCount: r.commentCount,
    category: {
      slug: r.categorySlug,
      name: r.categoryName,
      accentColor: r.categoryAccent,
    },
    author: {
      slug: r.authorSlug,
      name: r.authorName,
      avatarUrl: r.authorAvatar,
      role: r.authorRole,
    },
  };
}

export async function listArticleSummaries(opts: {
  categoryId?: number;
  categorySlug?: string;
  tag?: string;
  section?: string;
  limit?: number;
  offset?: number;
  orderBy?: "published" | "views" | "comments";
  authorId?: number;
  excludeId?: number;
}): Promise<ArticleSummary[]> {
  const conditions = [];
  if (opts.categoryId !== undefined)
    conditions.push(eq(articlesTable.categoryId, opts.categoryId));
  if (opts.categorySlug)
    conditions.push(eq(categoriesTable.slug, opts.categorySlug));
  if (opts.section) conditions.push(eq(articlesTable.section, opts.section));
  if (opts.tag)
    conditions.push(sql`${opts.tag} = ANY(${articlesTable.tags})`);
  if (opts.authorId !== undefined)
    conditions.push(eq(articlesTable.authorId, opts.authorId));
  if (opts.excludeId !== undefined)
    conditions.push(ne(articlesTable.id, opts.excludeId));

  const order =
    opts.orderBy === "views"
      ? desc(articlesTable.viewCount)
      : opts.orderBy === "comments"
        ? desc(articlesTable.commentCount)
        : desc(articlesTable.publishedAt);

  const query = db
    .select(summaryColumns)
    .from(articlesTable)
    .innerJoin(
      categoriesTable,
      eq(articlesTable.categoryId, categoriesTable.id),
    )
    .innerJoin(authorsTable, eq(articlesTable.authorId, authorsTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(order)
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);

  const rows = await query;
  return rows.map(rowToSummary);
}

export async function searchArticleSummaries(
  q: string,
  limit = 20,
): Promise<ArticleSummary[]> {
  const like = `%${q}%`;
  const rows = await db
    .select(summaryColumns)
    .from(articlesTable)
    .innerJoin(
      categoriesTable,
      eq(articlesTable.categoryId, categoriesTable.id),
    )
    .innerJoin(authorsTable, eq(articlesTable.authorId, authorsTable.id))
    .where(
      or(
        ilike(articlesTable.title, like),
        ilike(articlesTable.excerpt, like),
        ilike(articlesTable.subtitle, like),
      ),
    )
    .orderBy(desc(articlesTable.publishedAt))
    .limit(limit);
  return rows.map(rowToSummary);
}
