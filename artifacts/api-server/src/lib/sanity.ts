import { createClient, type SanityClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId) {
  throw new Error("SANITY_PROJECT_ID env var is required");
}

export const sanity: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
  perspective: "published",
});

export function stableNumericId(s: string | undefined | null): number {
  if (!s) return 0;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

function imageUrl(img: unknown, fallback = ""): string {
  if (!img || typeof img !== "object") return fallback;
  const ref = (img as { asset?: { _ref?: string; url?: string } }).asset;
  if (ref?.url) return ref.url;
  if (ref?._ref) {
    const m = ref._ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
    if (m) {
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}`;
    }
  }
  return fallback;
}

type SanitySubcategory = {
  name: string;
  slug: string;
  description?: string;
};

type SanityCategory = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  accentColor?: string;
  subcategories?: SanitySubcategory[];
};
type SanityAuthor = {
  _id: string;
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  twitter?: string;
  avatar?: unknown;
  avatarUrl?: string;
};

const CATEGORY_PROJ = `_id, "slug": slug.current, name, description, accentColor, subcategories`;
const AUTHOR_PROJ = `_id, "slug": slug.current, name, role, bio, twitter, avatar, avatarUrl`;

export type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string;
  category: { slug: string; name: string; accentColor: string };
  subcategorySlug: string | null;
  author: { slug: string; name: string; avatarUrl: string; role: string };
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  isBreaking: boolean;
  isFeature: boolean;
  viewCount: number;
  commentCount: number;
};

type RawArticleSummary = {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  heroImage?: unknown;
  heroImageUrl?: string;
  publishedAt?: string;
  readingMinutes?: number;
  tags?: string[];
  isBreaking?: boolean;
  isFeature?: boolean;
  subcategorySlug?: string | null;
  category?: SanityCategory | null;
  author?: SanityAuthor | null;
};

const ARTICLE_SUMMARY_PROJ = `
  _id,
  "slug": slug.current,
  title,
  excerpt,
  heroImage,
  heroImageUrl,
  publishedAt,
  readingMinutes,
  tags,
  isBreaking,
  isFeature,
  subcategorySlug,
  "category": category->{ ${CATEGORY_PROJ} },
  "author": author->{ ${AUTHOR_PROJ} }
`;

function toArticleSummary(r: RawArticleSummary): ArticleSummary {
  return {
    id: stableNumericId(r._id),
    slug: r.slug ?? "",
    title: r.title ?? "",
    excerpt: r.excerpt ?? "",
    heroImageUrl: imageUrl(r.heroImage, r.heroImageUrl ?? ""),
    category: {
      slug: r.category?.slug ?? "uncategorized",
      name: r.category?.name ?? "Uncategorized",
      accentColor: r.category?.accentColor ?? "#888888",
    },
    subcategorySlug: r.subcategorySlug ?? null,
    author: {
      slug: r.author?.slug ?? "staff",
      name: r.author?.name ?? "PrimeAxis Staff",
      avatarUrl: imageUrl(r.author?.avatar, r.author?.avatarUrl ?? ""),
      role: r.author?.role ?? "Staff",
    },
    publishedAt: r.publishedAt ?? new Date(0).toISOString(),
    readingMinutes: r.readingMinutes ?? 5,
    tags: r.tags ?? [],
    isBreaking: r.isBreaking ?? false,
    isFeature: r.isFeature ?? false,
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
  const conditions: string[] = [`_type == "article"`, `defined(slug.current)`];
  const params: Record<string, unknown> = {};
  if (opts.categorySlug) {
    conditions.push(`category->slug.current == $categorySlug`);
    params.categorySlug = opts.categorySlug;
  }
  if (opts.subcategorySlug) {
    conditions.push(`subcategorySlug == $subcategorySlug`);
    params.subcategorySlug = opts.subcategorySlug;
  }
  if (opts.tag) {
    conditions.push(`$tag in tags`);
    params.tag = opts.tag;
  }
  if (opts.authorSlug) {
    conditions.push(`author->slug.current == $authorSlug`);
    params.authorSlug = opts.authorSlug;
  }
  if (opts.excludeSlug) {
    conditions.push(`slug.current != $excludeSlug`);
    params.excludeSlug = opts.excludeSlug;
  }
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;
  const order =
    opts.orderBy === "views" || opts.orderBy === "comments"
      ? `publishedAt desc`
      : `publishedAt desc`;

  const groq = `*[${conditions.join(" && ")}] | order(${order}) [${offset}...${offset + limit}] { ${ARTICLE_SUMMARY_PROJ} }`;
  const rows = await sanity.fetch<RawArticleSummary[]>(groq, params);
  return rows.map(toArticleSummary);
}

export async function searchArticleSummaries(
  q: string,
  limit = 20,
): Promise<ArticleSummary[]> {
  const groq = `*[_type == "article" && defined(slug.current) && (title match $q || excerpt match $q || subtitle match $q)] | order(publishedAt desc) [0...${limit}] { ${ARTICLE_SUMMARY_PROJ} }`;
  const rows = await sanity.fetch<RawArticleSummary[]>(groq, {
    q: `*${q}*`,
  });
  return rows.map(toArticleSummary);
}

type PortableTextBlock = {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: { _type: string; text?: string }[];
  asset?: unknown;
  caption?: string;
};

type ArticleBlock = {
  type: "paragraph" | "heading" | "quote" | "image" | "list";
  content: string;
  caption?: string | null;
  items?: string[] | null;
};

export function portableTextToArticleBlocks(
  blocks: PortableTextBlock[] | undefined | null,
): ArticleBlock[] {
  if (!blocks || !Array.isArray(blocks)) return [];
  const out: ArticleBlock[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length) {
      out.push({ type: "list", content: "", items: listBuf, caption: null });
      listBuf = [];
    }
  };
  for (const b of blocks) {
    if (b._type === "image") {
      flushList();
      out.push({
        type: "image",
        content: imageUrl(b),
        caption: b.caption ?? null,
        items: null,
      });
      continue;
    }
    if (b._type !== "block") continue;
    const text = (b.children ?? [])
      .map((c) => (c._type === "span" ? (c.text ?? "") : ""))
      .join("");
    if (b.listItem) {
      listBuf.push(text);
      continue;
    }
    flushList();
    if (b.style === "blockquote") {
      out.push({ type: "quote", content: text, caption: null, items: null });
    } else if (b.style && /^h[1-6]$/.test(b.style)) {
      out.push({ type: "heading", content: text, caption: null, items: null });
    } else {
      out.push({ type: "paragraph", content: text, caption: null, items: null });
    }
  }
  flushList();
  return out;
}

export type ArticleDetail = ArticleSummary & {
  subtitle: string;
  updatedAt: string;
  body: ArticleBlock[];
  keyTakeaways: string[];
  aiSummary: string;
};

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  const groq = `*[_type == "article" && slug.current == $slug][0]{
    ${ARTICLE_SUMMARY_PROJ},
    subtitle,
    _updatedAt,
    body,
    keyTakeaways,
    aiSummary
  }`;
  const r = await sanity.fetch<
    | (RawArticleSummary & {
        subtitle?: string;
        _updatedAt?: string;
        body?: PortableTextBlock[];
        keyTakeaways?: string[];
        aiSummary?: string;
      })
    | null
  >(groq, { slug });
  if (!r) return null;
  const summary = toArticleSummary(r);
  return {
    ...summary,
    subtitle: r.subtitle ?? "",
    updatedAt: r._updatedAt ?? summary.publishedAt,
    body: portableTextToArticleBlocks(r.body),
    keyTakeaways: r.keyTakeaways ?? [],
    aiSummary: r.aiSummary ?? "",
  };
}

export type Subcategory = { name: string; slug: string; description: string };

export type CategoryWithCount = {
  id: number;
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  articleCount: number;
  subcategories: Subcategory[];
};

function toSubs(s?: SanitySubcategory[] | null): Subcategory[] {
  return (s ?? [])
    .filter((x) => x && x.slug && x.name)
    .map((x) => ({
      name: x.name,
      slug: x.slug,
      description: x.description ?? "",
    }));
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const groq = `*[_type == "category" && defined(slug.current)] | order(order asc, name asc) {
    ${CATEGORY_PROJ},
    "articleCount": count(*[_type == "article" && references(^._id)])
  }`;
  const rows = await sanity.fetch<
    (SanityCategory & { articleCount: number })[]
  >(groq);
  return rows.map((c) => ({
    id: stableNumericId(c._id),
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    accentColor: c.accentColor ?? "#888888",
    articleCount: c.articleCount ?? 0,
    subcategories: toSubs(c.subcategories),
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryWithCount | null> {
  const groq = `*[_type == "category" && slug.current == $slug][0]{
    ${CATEGORY_PROJ},
    "articleCount": count(*[_type == "article" && references(^._id)])
  }`;
  const r = await sanity.fetch<
    (SanityCategory & { articleCount: number }) | null
  >(groq, { slug });
  if (!r) return null;
  return {
    id: stableNumericId(r._id),
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    accentColor: r.accentColor ?? "#888888",
    articleCount: r.articleCount ?? 0,
    subcategories: toSubs(r.subcategories),
  };
}

export type AuthorWithCount = {
  id: number;
  slug: string;
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  twitter: string;
  articleCount: number;
};

export async function listAuthorsWithCounts(): Promise<AuthorWithCount[]> {
  const groq = `*[_type == "author" && defined(slug.current)] | order(name asc) {
    ${AUTHOR_PROJ},
    "articleCount": count(*[_type == "article" && references(^._id)])
  }`;
  const rows = await sanity.fetch<(SanityAuthor & { articleCount: number })[]>(
    groq,
  );
  return rows.map((a) => ({
    id: stableNumericId(a._id),
    slug: a.slug,
    name: a.name,
    role: a.role ?? "",
    avatarUrl: imageUrl(a.avatar, a.avatarUrl ?? ""),
    bio: a.bio ?? "",
    twitter: a.twitter ?? "",
    articleCount: a.articleCount ?? 0,
  }));
}

export async function getAuthorBySlug(
  slug: string,
): Promise<AuthorWithCount | null> {
  const groq = `*[_type == "author" && slug.current == $slug][0]{
    ${AUTHOR_PROJ},
    "articleCount": count(*[_type == "article" && references(^._id)])
  }`;
  const r = await sanity.fetch<
    (SanityAuthor & { articleCount: number }) | null
  >(groq, { slug });
  if (!r) return null;
  return {
    id: stableNumericId(r._id),
    slug: r.slug,
    name: r.name,
    role: r.role ?? "",
    avatarUrl: imageUrl(r.avatar, r.avatarUrl ?? ""),
    bio: r.bio ?? "",
    twitter: r.twitter ?? "",
    articleCount: r.articleCount ?? 0,
  };
}

export type ReviewSummary = {
  id: number;
  slug: string;
  productName: string;
  tagline: string;
  heroImageUrl: string;
  score: number;
  verdict: string;
  publishedAt: string;
  priceUsd: number;
  category: { slug: string; name: string; accentColor: string };
};

type RawReviewSummary = {
  _id: string;
  slug: string;
  productName: string;
  tagline?: string;
  heroImage?: unknown;
  heroImageUrl?: string;
  score?: number;
  verdict?: string;
  publishedAt?: string;
  priceUsd?: number;
  category?: SanityCategory | null;
};

const REVIEW_SUMMARY_PROJ = `
  _id, "slug": slug.current, productName, tagline, heroImage, heroImageUrl, score, verdict,
  publishedAt, priceUsd,
  "category": category->{ ${CATEGORY_PROJ} }
`;

function toReviewSummary(r: RawReviewSummary): ReviewSummary {
  return {
    id: stableNumericId(r._id),
    slug: r.slug ?? "",
    productName: r.productName ?? "",
    tagline: r.tagline ?? "",
    heroImageUrl: imageUrl(r.heroImage, r.heroImageUrl ?? ""),
    score: r.score ?? 0,
    verdict: r.verdict ?? "",
    publishedAt: r.publishedAt ?? new Date(0).toISOString(),
    priceUsd: r.priceUsd ?? 0,
    category: {
      slug: r.category?.slug ?? "uncategorized",
      name: r.category?.name ?? "Uncategorized",
      accentColor: r.category?.accentColor ?? "#888888",
    },
  };
}

export async function listReviewSummaries(
  limit = 20,
  bestPicksOnly = false,
): Promise<ReviewSummary[]> {
  const cond = [`_type == "review"`, `defined(slug.current)`];
  if (bestPicksOnly) cond.push(`score >= 8`);
  const order = bestPicksOnly ? `score desc` : `publishedAt desc`;
  const groq = `*[${cond.join(" && ")}] | order(${order}) [0...${limit}] { ${REVIEW_SUMMARY_PROJ} }`;
  const rows = await sanity.fetch<RawReviewSummary[]>(groq);
  return rows.map(toReviewSummary);
}

export async function getReviewBySlug(slug: string) {
  const groq = `*[_type == "review" && slug.current == $slug][0]{
    ${REVIEW_SUMMARY_PROJ},
    galleryImages,
    galleryImageUrls,
    summary,
    "author": author->{ ${AUTHOR_PROJ} },
    pros, cons, ratings, sections
  }`;
  const r = await sanity.fetch<
    | (RawReviewSummary & {
        galleryImages?: unknown[];
        galleryImageUrls?: string[];
        summary?: string;
        author?: SanityAuthor | null;
        pros?: string[];
        cons?: string[];
        ratings?: { name: string; score: number }[];
        sections?: { heading: string; body: string }[];
      })
    | null
  >(groq, { slug });
  if (!r) return null;
  const summary = toReviewSummary(r);
  const gallery = (r.galleryImages ?? []).map((g) => imageUrl(g)).filter(Boolean);
  const galleryFromUrls = r.galleryImageUrls ?? [];
  return {
    ...summary,
    galleryImages: gallery.length > 0 ? gallery : galleryFromUrls,
    summary: r.summary ?? "",
    author: {
      slug: r.author?.slug ?? "staff",
      name: r.author?.name ?? "PrimeAxis Staff",
      avatarUrl: imageUrl(r.author?.avatar, r.author?.avatarUrl ?? ""),
      role: r.author?.role ?? "Staff",
    },
    pros: r.pros ?? [],
    cons: r.cons ?? [],
    ratings: r.ratings ?? [],
    sections: r.sections ?? [],
  };
}

export type VideoSummary = {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  durationSeconds: number;
  publishedAt: string;
  viewCount: number;
  category: { slug: string; name: string; accentColor: string };
};

export async function listVideoSummaries(limit = 20): Promise<VideoSummary[]> {
  const groq = `*[_type == "video" && defined(slug.current)] | order(publishedAt desc) [0...${limit}] {
    _id, "slug": slug.current, title, description, thumbnail, thumbnailUrl, "durationSeconds": duration, publishedAt,
    "category": category->{ ${CATEGORY_PROJ} }
  }`;
  const rows = await sanity.fetch<
    {
      _id: string;
      slug: string;
      title?: string;
      description?: string;
      thumbnail?: unknown;
      thumbnailUrl?: string;
      durationSeconds?: number;
      publishedAt?: string;
      category?: SanityCategory | null;
    }[]
  >(groq);
  return rows.map((v) => ({
    id: stableNumericId(v._id),
    slug: v.slug ?? "",
    title: v.title ?? "",
    description: v.description ?? "",
    thumbnailUrl: imageUrl(v.thumbnail, v.thumbnailUrl ?? ""),
    durationSeconds: v.durationSeconds ?? 0,
    publishedAt: v.publishedAt ?? new Date(0).toISOString(),
    viewCount: 0,
    category: {
      slug: v.category?.slug ?? "uncategorized",
      name: v.category?.name ?? "Uncategorized",
      accentColor: v.category?.accentColor ?? "#888888",
    },
  }));
}
