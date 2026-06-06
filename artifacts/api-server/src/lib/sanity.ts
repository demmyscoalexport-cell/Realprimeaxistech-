import { createClient, type SanityClient } from "@sanity/client";
import { createHash } from "node:crypto";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const token =
  process.env.SANITY_API_TOKEN &&
  !/^CHANGE_ME/i.test(process.env.SANITY_API_TOKEN)
    ? process.env.SANITY_API_TOKEN
    : undefined;

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
  podcastAudioUrl: string | null;
  podcastDurationSeconds: number | null;
  podcastAudioBytes: number | null;
  podcastGeneratedAt: string | null;
  podcastPlatforms: PodcastPlatformLink[];
  isBreaking: boolean;
  isFeature: boolean;
  viewCount: number;
  commentCount: number;
};

export type PodcastPlatformLink = {
  platform: string;
  url: string;
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
  podcastAudioUrl?: string | null;
  podcastDurationSeconds?: number | null;
  podcastAudioBytes?: number | null;
  podcastGeneratedAt?: string | null;
  podcastPlatforms?: PodcastPlatformLink[];
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
  podcastAudioUrl,
  podcastDurationSeconds,
  podcastAudioBytes,
  podcastGeneratedAt,
  podcastPlatforms,
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
    podcastAudioUrl: r.podcastAudioUrl ?? null,
    podcastDurationSeconds: r.podcastDurationSeconds ?? null,
    podcastAudioBytes: r.podcastAudioBytes ?? null,
    podcastGeneratedAt: r.podcastGeneratedAt ?? null,
    podcastPlatforms: (r.podcastPlatforms ?? []).filter(
      (p) => p?.platform && p?.url,
    ),
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
  podcastScript: string;
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
    aiSummary,
    podcastScript
  }`;
  const r = await sanity.fetch<
    | (RawArticleSummary & {
        subtitle?: string;
        _updatedAt?: string;
        body?: PortableTextBlock[];
        keyTakeaways?: string[];
        aiSummary?: string;
        podcastScript?: string;
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
    podcastScript: r.podcastScript ?? "",
  };
}

export type PodcastEpisode = ArticleSummary & {
  subtitle: string;
  updatedAt: string;
  podcastScript: string;
};

export async function listPodcastEpisodes(limit = 100): Promise<PodcastEpisode[]> {
  const groq = `*[_type == "article" && defined(slug.current) && defined(podcastAudioUrl)] | order(coalesce(podcastGeneratedAt, publishedAt) desc) [0...${limit}] {
    ${ARTICLE_SUMMARY_PROJ},
    subtitle,
    _updatedAt,
    podcastScript
  }`;
  const rows = await sanity.fetch<
    (RawArticleSummary & {
      subtitle?: string;
      _updatedAt?: string;
      podcastScript?: string;
    })[]
  >(groq);

  return rows.map((r) => {
    const summary = toArticleSummary(r);
    return {
      ...summary,
      subtitle: r.subtitle ?? "",
      updatedAt: r._updatedAt ?? summary.publishedAt,
      podcastScript: r.podcastScript ?? "",
    };
  });
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
  videoUrl: string | null;
  category: { slug: string; name: string; accentColor: string };
};

export async function listVideoSummaries(limit = 20): Promise<VideoSummary[]> {
  const groq = `*[_type == "video" && defined(slug.current)] | order(publishedAt desc) [0...${limit}] {
    _id, "slug": slug.current, title, description, thumbnail, thumbnailUrl, videoUrl, "durationSeconds": duration, publishedAt,
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
      videoUrl?: string;
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
    videoUrl: v.videoUrl ?? null,
    category: {
      slug: v.category?.slug ?? "uncategorized",
      name: v.category?.name ?? "Uncategorized",
      accentColor: v.category?.accentColor ?? "#888888",
    },
  }));
}

type RawNewsletter = {
  _id: string;
  slug?: string;
  name?: string;
  description?: string;
  tagline?: string;
  frequency?: string;
  cadence?: string;
  subscriberCount?: number;
  accentColor?: string;
};

const FALLBACK_NEWSLETTERS: RawNewsletter[] = [
  {
    _id: "newsletter-the-axis",
    slug: "the-axis",
    name: "The Axis",
    description:
      "A morning briefing on the technology stories shaping the global agenda. Sent every weekday.",
    frequency: "daily",
    subscriberCount: 0,
    accentColor: "#22d3ee",
  },
  {
    _id: "newsletter-model-context",
    slug: "model-context",
    name: "Model Context",
    description:
      "A weekly deep read on AI research, the labs racing to deploy it, and the people building frontier intelligence.",
    frequency: "weekly",
    subscriberCount: 0,
    accentColor: "#a78bfa",
  },
  {
    _id: "newsletter-the-spec-sheet",
    slug: "the-spec-sheet",
    name: "The Spec Sheet",
    description:
      "Our reviews team's verdicts on the gadgets actually worth your money before you buy.",
    frequency: "weekly",
    subscriberCount: 0,
    accentColor: "#f472b6",
  },
];

export type NewsletterSummary = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  cadence: string;
  subscriberCount: number;
  accentColor: string;
};

export type NewsletterSubscriptionResult = {
  id: number;
  email: string;
  newsletterSlug: string;
  createdAt: string;
  created: boolean;
};

export type NewsletterUnsubscribeResult = {
  email: string;
  newsletterSlug: string;
  unsubscribed: boolean;
};

export function isSanityWriteConfigured(): boolean {
  return Boolean(token);
}

function formatCadence(value?: string): string {
  if (!value) return "Weekly";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function toNewsletterSummary(row: RawNewsletter): NewsletterSummary {
  return {
    id: stableNumericId(row._id),
    slug: row.slug ?? "",
    name: row.name ?? "",
    tagline: row.tagline ?? row.description ?? "",
    cadence: row.cadence ?? formatCadence(row.frequency),
    subscriberCount: row.subscriberCount ?? 0,
    accentColor: row.accentColor ?? "#22d3ee",
  };
}

export async function listNewsletterSummaries(): Promise<NewsletterSummary[]> {
  const rows = await sanity.fetch<RawNewsletter[]>(
    `*[_type == "newsletter" && defined(slug.current)] | order(name asc) {
      _id,
      "slug": slug.current,
      name,
      description,
      tagline,
      frequency,
      cadence,
      subscriberCount,
      accentColor
    }`,
  );

  return (rows.length > 0 ? rows : FALLBACK_NEWSLETTERS).map(
    toNewsletterSummary,
  );
}

function subscriberDocId(email: string, newsletterSlug: string): string {
  const digest = createHash("sha256")
    .update(`${newsletterSlug}:${email}`)
    .digest("hex")
    .slice(0, 24);
  return `newsletterSubscriber.${newsletterSlug}.${digest}`;
}

export async function subscribeNewsletterInSanity(input: {
  email: string;
  newsletterSlug: string;
}): Promise<NewsletterSubscriptionResult | null> {
  const email = input.email.trim().toLowerCase();
  const newsletterSlug = input.newsletterSlug.trim();

  if (!token) {
    throw new Error("SANITY_API_TOKEN is required to write newsletter subscribers");
  }

  let newsletter = await sanity.fetch<{ _id: string } | null>(
    `*[_type == "newsletter" && slug.current == $newsletterSlug][0]{ _id }`,
    { newsletterSlug },
  );
  const fallbackNewsletter = FALLBACK_NEWSLETTERS.find(
    (item) => item.slug === newsletterSlug,
  );

  if (!newsletter && !fallbackNewsletter) return null;
  if (!newsletter && fallbackNewsletter) {
    newsletter = { _id: fallbackNewsletter._id };
  }
  if (!newsletter) return null;
  const newsletterId = newsletter._id;

  const _id = subscriberDocId(email, newsletterSlug);
  const existing = await sanity.fetch<{ createdAt?: string } | null>(
    `*[_id == $id][0]{ createdAt }`,
    { id: _id },
  );

  if (existing) {
    return {
      id: stableNumericId(_id),
      email,
      newsletterSlug,
      createdAt: existing.createdAt ?? new Date().toISOString(),
      created: false,
    };
  }

  const createdAt = new Date().toISOString();
  await sanity
    .transaction()
    .createIfNotExists(
      fallbackNewsletter
        ? {
            _id: fallbackNewsletter._id,
            _type: "newsletter",
            name: fallbackNewsletter.name,
            slug: { _type: "slug", current: newsletterSlug },
            frequency: fallbackNewsletter.frequency,
            description: fallbackNewsletter.description,
            accentColor: fallbackNewsletter.accentColor,
            subscriberCount: fallbackNewsletter.subscriberCount ?? 0,
          }
        : { _id: newsletterId, _type: "newsletter" },
    )
    .create({
      _id,
      _type: "newsletterSubscriber",
      email,
      newsletterSlug,
      createdAt,
      source: "site",
    })
    .patch(newsletterId, (patch) =>
      patch.setIfMissing({ subscriberCount: 0 }).inc({ subscriberCount: 1 }),
    )
    .commit();

  return {
    id: stableNumericId(_id),
    email,
    newsletterSlug,
    createdAt,
    created: true,
  };
}

export async function unsubscribeNewsletterInSanity(input: {
  email: string;
  newsletterSlug: string;
}): Promise<NewsletterUnsubscribeResult> {
  const email = input.email.trim().toLowerCase();
  const newsletterSlug = input.newsletterSlug.trim();

  if (!token) {
    throw new Error("SANITY_API_TOKEN is required to delete newsletter subscribers");
  }

  const _id = subscriberDocId(email, newsletterSlug);
  const existing = await sanity.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{ _id }`,
    { id: _id },
  );

  if (!existing) {
    return { email, newsletterSlug, unsubscribed: false };
  }

  const newsletter = await sanity.fetch<{ _id: string } | null>(
    `*[_type == "newsletter" && slug.current == $newsletterSlug][0]{ _id }`,
    { newsletterSlug },
  );

  const transaction = sanity.transaction().delete(_id);
  if (newsletter) {
    transaction.patch(newsletter._id, (patch) =>
      patch.setIfMissing({ subscriberCount: 0 }).dec({ subscriberCount: 1 }),
    );
  }

  await transaction.commit();
  return { email, newsletterSlug, unsubscribed: true };
}
