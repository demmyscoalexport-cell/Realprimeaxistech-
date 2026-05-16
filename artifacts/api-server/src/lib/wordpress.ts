import {
  stableNumericId,
  type ArticleSummary,
  type ArticleDetail,
  type CategoryWithCount,
  type AuthorWithCount,
  type ReviewSummary,
  type VideoSummary,
  type Subcategory,
} from "./sanity-types";

const WP_BASE = (process.env.WORDPRESS_URL || "").replace(/\/+$/, "");
const WP_USER = process.env.WORDPRESS_USER || "";
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || "";

function authHeaders(): Record<string, string> {
  if (!WP_USER || !WP_APP_PASSWORD) return {};
  const token = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function wp<T>(path: string, init?: RequestInit): Promise<T> {
  if (!WP_BASE) throw new Error("WORDPRESS_URL env var is required");
  const url = path.startsWith("http") ? path : `${WP_BASE}/wp-json${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...authHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`WP ${res.status} ${res.statusText} on ${url}`);
  }
  return (await res.json()) as T;
}

/* ----------------------------------------------------------- */
/*  Type shims for WP REST                                      */
/* ----------------------------------------------------------- */

type WpRendered = { rendered: string; protected?: boolean };

type WpEmbedded = {
  author?: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    role_title?: string;
    twitter?: string;
    avatar_url?: string;
    avatar_urls?: Record<string, string>;
  }>;
  "wp:featuredmedia"?: Array<{ source_url?: string }>;
  "wp:term"?: Array<
    Array<{ id: number; slug: string; name: string; taxonomy: string }>
  >;
};

type WpPost = {
  id: number;
  slug: string;
  date: string;
  modified?: string;
  title: WpRendered;
  excerpt: WpRendered;
  content: WpRendered;
  meta?: Record<string, unknown>;
  tags?: number[];
  categories?: number[];
  author?: number;
  _embedded?: WpEmbedded;
};

type WpCategory = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  count?: number;
  meta?: Record<string, unknown>;
};

type WpUser = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  role_title?: string;
  twitter?: string;
  avatar_url?: string;
  avatar_urls?: Record<string, string>;
};

/* ----------------------------------------------------------- */
/*  helpers                                                     */
/* ----------------------------------------------------------- */
function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function meta(p: WpPost | WpCategory, key: string): unknown {
  const m = (p.meta ?? {}) as Record<string, unknown>;
  return m[key];
}

function metaStr(p: WpPost | WpCategory, key: string, fallback = ""): string {
  const v = meta(p, key);
  return typeof v === "string" ? v : fallback;
}

function metaNum(p: WpPost | WpCategory, key: string, fallback = 0): number {
  const v = meta(p, key);
  return typeof v === "number" ? v : fallback;
}

function metaBool(p: WpPost | WpCategory, key: string): boolean {
  const v = meta(p, key);
  return v === true || v === 1 || v === "1" || v === "true";
}

function metaArr(p: WpPost | WpCategory, key: string): string[] {
  const v = meta(p, key);
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.startsWith("[")) {
    try { return JSON.parse(v) as string[]; } catch { /* noop */ }
  }
  return [];
}

function authorFromEmbed(p: WpPost): AuthorWithCount["slug"] extends never ? never : ArticleSummary["author"] {
  const a = p._embedded?.author?.[0];
  return {
    slug: a?.slug ?? "staff",
    name: a?.name ?? "PrimeAxis Staff",
    avatarUrl:
      a?.avatar_url ??
      a?.avatar_urls?.["96"] ??
      a?.avatar_urls?.["48"] ??
      "",
    role: a?.role_title ?? "Staff",
  };
}

function categoryFromEmbed(p: WpPost): ArticleSummary["category"] {
  const terms = (p._embedded?.["wp:term"] ?? []).flat();
  const cat = terms.find((t) => t.taxonomy === "category");
  return {
    slug: cat?.slug ?? "uncategorized",
    name: cat?.name ?? "Uncategorized",
    accentColor: "#888888", // Filled in by listCategoriesWithCounts cache
  };
}

function heroFromPost(p: WpPost): string {
  const fromMeta = metaStr(p, "hero_image_url");
  if (fromMeta) return fromMeta;
  return p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "";
}

/* ----------------------------------------------------------- */
/*  Articles                                                    */
/* ----------------------------------------------------------- */
function toArticleSummary(p: WpPost): ArticleSummary {
  return {
    id: p.id || stableNumericId(p.slug),
    slug: p.slug,
    title: stripHtml(p.title.rendered),
    excerpt: stripHtml(p.excerpt.rendered),
    heroImageUrl: heroFromPost(p),
    category: categoryFromEmbed(p),
    subcategorySlug: metaStr(p, "subcategory_slug") || null,
    author: authorFromEmbed(p),
    publishedAt: p.date,
    readingMinutes: metaNum(p, "reading_minutes", 5) || 5,
    tags: (p._embedded?.["wp:term"] ?? [])
      .flat()
      .filter((t) => t.taxonomy === "post_tag")
      .map((t) => t.slug),
    isBreaking: metaBool(p, "is_breaking"),
    isFeature: metaBool(p, "is_feature"),
    viewCount: 0,
    commentCount: 0,
  };
}

export async function listArticleSummaries(opts: {
  categorySlug?: string;
  tag?: string;
  authorSlug?: string;
  subcategorySlug?: string;
  excludeSlug?: string;
  limit?: number;
  offset?: number;
  orderBy?: "published" | "views" | "comments";
} = {}): Promise<ArticleSummary[]> {
  const limit = opts.limit ?? 20;
  const page = Math.floor((opts.offset ?? 0) / limit) + 1;

  const params = new URLSearchParams({
    per_page: String(limit),
    page: String(page),
    _embed: "1",
    orderby: "date",
    order: "desc",
  });

  if (opts.categorySlug) {
    const cats = await wp<WpCategory[]>(`/wp/v2/categories?slug=${encodeURIComponent(opts.categorySlug)}`);
    if (cats[0]) params.set("categories", String(cats[0].id));
  }
  if (opts.tag) {
    const tags = await wp<{ id: number }[]>(`/wp/v2/tags?slug=${encodeURIComponent(opts.tag)}`);
    if (tags[0]) params.set("tags", String(tags[0].id));
  }
  if (opts.authorSlug) {
    const users = await wp<WpUser[]>(`/wp/v2/users?slug=${encodeURIComponent(opts.authorSlug)}`);
    if (users[0]) params.set("author", String(users[0].id));
  }
  if (opts.subcategorySlug) params.set("meta_key", "subcategory_slug"); // best-effort; relies on WP query loop
  if (opts.excludeSlug) {
    const excl = await wp<WpPost[]>(`/wp/v2/posts?slug=${encodeURIComponent(opts.excludeSlug)}`);
    if (excl[0]) params.set("exclude", String(excl[0].id));
  }

  let posts = await wp<WpPost[]>(`/wp/v2/posts?${params.toString()}`);
  if (opts.subcategorySlug) {
    posts = posts.filter((p) => metaStr(p, "subcategory_slug") === opts.subcategorySlug);
  }
  return posts.map(toArticleSummary);
}

export async function searchArticleSummaries(q: string, limit = 20): Promise<ArticleSummary[]> {
  const params = new URLSearchParams({
    per_page: String(limit),
    _embed: "1",
    search: q,
  });
  const posts = await wp<WpPost[]>(`/wp/v2/posts?${params.toString()}`);
  return posts.map(toArticleSummary);
}

/* ----------------------------------------------------------- */
/*  Article detail — convert HTML body → ArticleBlock[]         */
/* ----------------------------------------------------------- */
type ArticleBlock = {
  type: "paragraph" | "heading" | "quote" | "image" | "list";
  content: string;
  caption?: string | null;
  items?: string[] | null;
};

export function htmlToArticleBlocks(html: string): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  if (!html) return out;
  // Crude but effective: split by top-level block tags
  const blockRe = /<(h[1-6]|p|blockquote|ul|ol|figure|img)([^>]*)>([\s\S]*?)<\/\1>|<img([^>]*)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const tag = (m[1] || "img").toLowerCase();
    const attrs = m[2] || m[4] || "";
    const inner = m[3] || "";
    if (tag === "img") {
      const src = /src=["']([^"']+)["']/i.exec(attrs)?.[1] ?? "";
      const alt = /alt=["']([^"']*)["']/i.exec(attrs)?.[1] ?? null;
      if (src) out.push({ type: "image", content: src, caption: alt, items: null });
    } else if (tag === "figure") {
      const src = /src=["']([^"']+)["']/i.exec(inner)?.[1] ?? "";
      const cap = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(inner)?.[1] ?? "";
      if (src) out.push({ type: "image", content: src, caption: stripHtml(cap) || null, items: null });
    } else if (tag === "blockquote") {
      out.push({ type: "quote", content: stripHtml(inner), caption: null, items: null });
    } else if (/^h[1-6]$/.test(tag)) {
      out.push({ type: "heading", content: stripHtml(inner), caption: null, items: null });
    } else if (tag === "ul" || tag === "ol") {
      const items = Array.from(inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(
        (li) => stripHtml(li[1] ?? ""),
      );
      out.push({ type: "list", content: "", caption: null, items });
    } else {
      const text = stripHtml(inner);
      if (text) out.push({ type: "paragraph", content: text, caption: null, items: null });
    }
  }
  return out;
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const posts = await wp<WpPost[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`,
  );
  const p = posts[0];
  if (!p) return null;
  const summary = toArticleSummary(p);
  return {
    ...summary,
    subtitle: metaStr(p, "subtitle"),
    updatedAt: p.modified ?? p.date,
    body: htmlToArticleBlocks(p.content.rendered),
    keyTakeaways: metaArr(p, "key_takeaways"),
    aiSummary: metaStr(p, "ai_summary"),
  };
}

/* ----------------------------------------------------------- */
/*  Categories                                                  */
/* ----------------------------------------------------------- */
function toSubsFromMeta(c: WpCategory): Subcategory[] {
  const raw = metaStr(c, "subcategories_json", "");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ name?: string; slug?: string; description?: string }>;
    return parsed
      .filter((x) => x?.slug && x?.name)
      .map((x) => ({ name: x.name!, slug: x.slug!, description: x.description ?? "" }));
  } catch {
    return [];
  }
}

function toCategoryWithCount(c: WpCategory): CategoryWithCount {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: stripHtml(c.description ?? ""),
    accentColor: metaStr(c, "accent_color", "#888888") || "#888888",
    articleCount: c.count ?? 0,
    subcategories: toSubsFromMeta(c),
  };
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const cats = await wp<WpCategory[]>(`/wp/v2/categories?per_page=100&orderby=name&order=asc&hide_empty=false`);
  return cats
    .filter((c) => c.slug !== "uncategorized")
    .map(toCategoryWithCount);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | null> {
  const cats = await wp<WpCategory[]>(`/wp/v2/categories?slug=${encodeURIComponent(slug)}`);
  return cats[0] ? toCategoryWithCount(cats[0]) : null;
}

/* ----------------------------------------------------------- */
/*  Authors (WP users)                                          */
/* ----------------------------------------------------------- */
function toAuthorWithCount(u: WpUser, articleCount = 0): AuthorWithCount {
  return {
    id: u.id,
    slug: u.slug,
    name: u.name,
    role: u.role_title ?? "",
    avatarUrl: u.avatar_url ?? u.avatar_urls?.["96"] ?? u.avatar_urls?.["48"] ?? "",
    bio: stripHtml(u.description ?? ""),
    twitter: u.twitter ?? "",
    articleCount,
  };
}

export async function listAuthorsWithCounts(): Promise<AuthorWithCount[]> {
  const users = await wp<WpUser[]>(`/wp/v2/users?per_page=100&orderby=name&order=asc`);
  return users.map((u) => toAuthorWithCount(u));
}

export async function getAuthorBySlug(slug: string): Promise<AuthorWithCount | null> {
  const users = await wp<WpUser[]>(`/wp/v2/users?slug=${encodeURIComponent(slug)}`);
  return users[0] ? toAuthorWithCount(users[0]) : null;
}

/* ----------------------------------------------------------- */
/*  Reviews + Videos (custom post types)                        */
/* ----------------------------------------------------------- */
type WpReview = WpPost & { meta: Record<string, unknown> };
type WpVideo = WpPost & { meta: Record<string, unknown> };

function toReviewSummary(p: WpReview): ReviewSummary {
  return {
    id: p.id,
    slug: p.slug,
    productName: metaStr(p, "product_name", stripHtml(p.title.rendered)),
    tagline: metaStr(p, "tagline", stripHtml(p.excerpt.rendered)),
    heroImageUrl: heroFromPost(p),
    score: metaNum(p, "score"),
    verdict: metaStr(p, "verdict"),
    publishedAt: p.date,
    priceUsd: metaNum(p, "price_usd"),
    category: categoryFromEmbed(p),
  };
}

export async function listReviewSummaries(limit = 20, bestPicksOnly = false): Promise<ReviewSummary[]> {
  try {
    const posts = await wp<WpReview[]>(`/wp/v2/reviews?per_page=${limit}&_embed=1&orderby=date&order=desc`);
    let out = posts.map(toReviewSummary);
    if (bestPicksOnly) out = out.filter((r) => r.score >= 8).sort((a, b) => b.score - a.score);
    return out;
  } catch {
    return [];
  }
}

export async function getReviewBySlug(slug: string) {
  try {
    const posts = await wp<WpReview[]>(`/wp/v2/reviews?slug=${encodeURIComponent(slug)}&_embed=1`);
    const p = posts[0];
    if (!p) return null;
    const summary = toReviewSummary(p);
    return {
      ...summary,
      galleryImages: metaArr(p, "gallery_image_urls"),
      summary: stripHtml(p.excerpt.rendered),
      author: authorFromEmbed(p),
      pros: metaArr(p, "pros"),
      cons: metaArr(p, "cons"),
      ratings: safeJson(metaStr(p, "ratings_json")),
      sections: safeJson(metaStr(p, "sections_json")),
    };
  } catch {
    return null;
  }
}

function safeJson<T = unknown>(s: string): T[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

export async function listVideoSummaries(limit = 20): Promise<VideoSummary[]> {
  try {
    const posts = await wp<WpVideo[]>(`/wp/v2/videos?per_page=${limit}&_embed=1&orderby=date&order=desc`);
    return posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: stripHtml(p.title.rendered),
      description: stripHtml(p.excerpt.rendered),
      thumbnailUrl: metaStr(p, "thumbnail_url") || heroFromPost(p),
      durationSeconds: metaNum(p, "duration_seconds"),
      publishedAt: p.date,
      viewCount: 0,
      category: categoryFromEmbed(p),
    }));
  } catch {
    return [];
  }
}

export { stableNumericId };
