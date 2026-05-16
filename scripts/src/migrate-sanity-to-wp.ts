/**
 * One-shot migrator: Sanity → WordPress (headless).
 *
 * Reads every article, category, author from the Sanity dataset and
 * pushes them into WordPress via the REST API, preserving:
 *   - slugs, publish dates, excerpts
 *   - cinematic Cloudinary hero image URLs (stored as `hero_image_url` meta —
 *     we do NOT re-upload to WP, the images stay on Cloudinary's CDN)
 *   - subtitles, key takeaways, AI summaries, reading minutes
 *   - subcategory slug, isBreaking, isFeature flags
 *   - category accent color and subcategories list (as term meta)
 *   - author role title, twitter, avatar URL (as user meta)
 *
 * Required env:
 *   SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN
 *   WORDPRESS_URL          e.g. https://primeaxistech.com
 *   WORDPRESS_USER         a WP admin username
 *   WORDPRESS_APP_PASSWORD an Application Password (Users → Profile)
 *
 * Idempotent: posts/categories/users with the same slug are updated, not
 * duplicated. Re-run safely.
 *
 * Usage (from repo root):
 *   pnpm --filter @workspace/scripts run migrate:sanity-to-wp
 */
import { createClient } from "@sanity/client";

const projectId = req("SANITY_PROJECT_ID");
const dataset = process.env.SANITY_DATASET || "production";
const sanityToken = req("SANITY_API_TOKEN");
const wpBase = req("WORDPRESS_URL").replace(/\/+$/, "");
const wpUser = req("WORDPRESS_USER");
const wpPass = req("WORDPRESS_APP_PASSWORD");

function req(key: string): string {
  const v = process.env[key];
  if (!v) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
  return v;
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: sanityToken,
  perspective: "published",
});

const auth = "Basic " + Buffer.from(`${wpUser}:${wpPass}`).toString("base64");

async function wp<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${wpBase}/wp-json${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: auth,
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`WP ${res.status} ${url}\n${text.slice(0, 500)}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

/* ----------------------------------------------------------- */
/*  helpers                                                     */
/* ----------------------------------------------------------- */

function imageUrl(img: unknown, fallback = ""): string {
  if (!img || typeof img !== "object") return fallback;
  const ref = (img as { asset?: { _ref?: string; url?: string } }).asset;
  if (ref?.url) return ref.url;
  if (ref?._ref) {
    const m = ref._ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
    if (m) return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}`;
  }
  return fallback;
}

type PortableBlock = {
  _type: string;
  style?: string;
  listItem?: string;
  children?: { _type: string; text?: string }[];
  asset?: unknown;
  caption?: string;
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function portableTextToHtml(blocks: PortableBlock[] | undefined): string {
  if (!Array.isArray(blocks)) return "";
  const out: string[] = [];
  let listBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  const flushList = () => {
    if (listBuf.length && listType) {
      out.push(`<${listType}>${listBuf.map((i) => `<li>${i}</li>`).join("")}</${listType}>`);
      listBuf = [];
      listType = null;
    }
  };
  for (const b of blocks) {
    if (b._type === "image") {
      flushList();
      const src = imageUrl(b);
      const cap = escapeHtml(b.caption ?? "");
      if (src) {
        out.push(
          cap
            ? `<figure><img src="${src}" alt="${cap}" /><figcaption>${cap}</figcaption></figure>`
            : `<figure><img src="${src}" alt="" /></figure>`,
        );
      }
      continue;
    }
    if (b._type !== "block") continue;
    const text = (b.children ?? [])
      .map((c) => (c._type === "span" ? escapeHtml(c.text ?? "") : ""))
      .join("");
    if (b.listItem) {
      const t = b.listItem === "number" ? "ol" : "ul";
      if (listType !== t) flushList();
      listType = t;
      listBuf.push(text);
      continue;
    }
    flushList();
    if (b.style === "blockquote") out.push(`<blockquote>${text}</blockquote>`);
    else if (b.style && /^h[1-6]$/.test(b.style)) out.push(`<${b.style}>${text}</${b.style}>`);
    else out.push(`<p>${text}</p>`);
  }
  flushList();
  return out.join("\n");
}

/* ----------------------------------------------------------- */
/*  WP lookups                                                  */
/* ----------------------------------------------------------- */

async function findWpCategoryBySlug(slug: string) {
  const list = await wp<Array<{ id: number }>>(`/wp/v2/categories?slug=${encodeURIComponent(slug)}`);
  return list[0]?.id;
}
async function findWpTagBySlug(slug: string) {
  const list = await wp<Array<{ id: number }>>(`/wp/v2/tags?slug=${encodeURIComponent(slug)}`);
  return list[0]?.id;
}
async function findWpPostBySlug(slug: string) {
  const list = await wp<Array<{ id: number }>>(`/wp/v2/posts?slug=${encodeURIComponent(slug)}&status=any`);
  return list[0]?.id;
}
async function findWpUserBySlug(slug: string) {
  try {
    const list = await wp<Array<{ id: number }>>(`/wp/v2/users?slug=${encodeURIComponent(slug)}`);
    return list[0]?.id;
  } catch {
    return undefined;
  }
}

async function ensureWpTag(name: string): Promise<number> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const existing = await findWpTagBySlug(slug);
  if (existing) return existing;
  const created = await wp<{ id: number }>("/wp/v2/tags", {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
  return created.id;
}

/* ----------------------------------------------------------- */
/*  1. Categories                                               */
/* ----------------------------------------------------------- */
type SanCat = {
  _id: string;
  slug: { current: string };
  name: string;
  description?: string;
  accentColor?: string;
  order?: number;
  subcategories?: Array<{ name: string; slug: string; description?: string }>;
};

const catIdBySlug = new Map<string, number>();

async function migrateCategories() {
  console.log("▶ Categories");
  const cats = await sanity.fetch<SanCat[]>(
    `*[_type=="category" && defined(slug.current)] | order(order asc, name asc)`,
  );
  for (const c of cats) {
    const slug = c.slug.current;
    let id = await findWpCategoryBySlug(slug);
    const meta = {
      accent_color: c.accentColor ?? "#888888",
      sort_order: c.order ?? 999,
      subcategories_json: JSON.stringify(c.subcategories ?? []),
    };
    if (id) {
      await wp(`/wp/v2/categories/${id}`, {
        method: "POST",
        body: JSON.stringify({
          name: c.name,
          description: c.description ?? "",
          meta,
        }),
      });
      console.log(`  ↻ ${slug}  (updated #${id})`);
    } else {
      const created = await wp<{ id: number }>("/wp/v2/categories", {
        method: "POST",
        body: JSON.stringify({
          name: c.name,
          slug,
          description: c.description ?? "",
          meta,
        }),
      });
      id = created.id;
      console.log(`  + ${slug}  (created #${id})`);
    }
    catIdBySlug.set(slug, id);
  }
}

/* ----------------------------------------------------------- */
/*  2. Authors                                                  */
/* ----------------------------------------------------------- */
type SanAuthor = {
  _id: string;
  slug: { current: string };
  name: string;
  role?: string;
  bio?: string;
  twitter?: string;
  avatar?: unknown;
  avatarUrl?: string;
};

const authorIdBySlug = new Map<string, number>();

async function migrateAuthors() {
  console.log("▶ Authors");
  const authors = await sanity.fetch<SanAuthor[]>(
    `*[_type=="author" && defined(slug.current)] | order(name asc)`,
  );
  for (const a of authors) {
    const slug = a.slug.current;
    let id = await findWpUserBySlug(slug);
    const payload = {
      name: a.name,
      slug,
      description: a.bio ?? "",
      meta: {
        role_title: a.role ?? "",
        twitter: a.twitter ?? "",
        avatar_url: imageUrl(a.avatar, a.avatarUrl ?? ""),
      },
    };
    if (id) {
      await wp(`/wp/v2/users/${id}`, { method: "POST", body: JSON.stringify(payload) });
      console.log(`  ↻ ${slug} (updated #${id})`);
    } else {
      // Need email + password to create. Generate deterministic ones.
      const email = `${slug}@authors.primeaxis.local`;
      const password = `pa_${slug}_${Math.random().toString(36).slice(2, 12)}`;
      try {
        const created = await wp<{ id: number }>("/wp/v2/users", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            username: slug,
            email,
            password,
            roles: ["author"],
          }),
        });
        id = created.id;
        console.log(`  + ${slug} (created #${id})`);
      } catch (e) {
        console.log(`  ! ${slug} skipped: ${(e as Error).message.slice(0, 120)}`);
        continue;
      }
    }
    authorIdBySlug.set(slug, id);
  }
}

/* ----------------------------------------------------------- */
/*  3. Articles                                                 */
/* ----------------------------------------------------------- */
type SanArticle = {
  _id: string;
  slug: { current: string };
  title: string;
  subtitle?: string;
  excerpt?: string;
  heroImage?: unknown;
  heroImageUrl?: string;
  publishedAt?: string;
  readingMinutes?: number;
  subcategorySlug?: string;
  tags?: string[];
  isBreaking?: boolean;
  isFeature?: boolean;
  body?: PortableBlock[];
  keyTakeaways?: string[];
  aiSummary?: string;
  category?: { slug: { current: string } } | null;
  author?: { slug: { current: string } } | null;
};

async function migrateArticles() {
  console.log("▶ Articles");
  const articles = await sanity.fetch<SanArticle[]>(
    `*[_type=="article" && defined(slug.current)] | order(publishedAt desc) {
      _id, slug, title, subtitle, excerpt, heroImage, heroImageUrl, publishedAt,
      readingMinutes, subcategorySlug, tags, isBreaking, isFeature,
      body, keyTakeaways, aiSummary,
      "category": category->{ slug },
      "author": author->{ slug }
    }`,
  );
  console.log(`  found ${articles.length} articles in Sanity`);

  let n = 0;
  for (const a of articles) {
    n++;
    const slug = a.slug.current;
    try {
      const catId =
        a.category?.slug.current && catIdBySlug.get(a.category.slug.current);
      const authorId =
        a.author?.slug.current && authorIdBySlug.get(a.author.slug.current);

      const tagIds: number[] = [];
      for (const t of a.tags ?? []) {
        try { tagIds.push(await ensureWpTag(t)); } catch { /* ignore */ }
      }

      const html = portableTextToHtml(a.body);
      const meta = {
        subtitle: a.subtitle ?? "",
        hero_image_url: imageUrl(a.heroImage, a.heroImageUrl ?? ""),
        reading_minutes: a.readingMinutes ?? 5,
        subcategory_slug: a.subcategorySlug ?? "",
        is_breaking: !!a.isBreaking,
        is_feature: !!a.isFeature,
        key_takeaways: a.keyTakeaways ?? [],
        ai_summary: a.aiSummary ?? "",
      };

      const payload: Record<string, unknown> = {
        title: a.title,
        slug,
        status: "publish",
        excerpt: a.excerpt ?? "",
        content: html,
        date: a.publishedAt ?? new Date().toISOString(),
        meta,
      };
      if (catId) payload.categories = [catId];
      if (authorId) payload.author = authorId;
      if (tagIds.length) payload.tags = tagIds;

      const existing = await findWpPostBySlug(slug);
      if (existing) {
        await wp(`/wp/v2/posts/${existing}`, { method: "POST", body: JSON.stringify(payload) });
        console.log(`  [${n}/${articles.length}] ↻ ${slug}`);
      } else {
        await wp("/wp/v2/posts", { method: "POST", body: JSON.stringify(payload) });
        console.log(`  [${n}/${articles.length}] + ${slug}`);
      }
    } catch (e) {
      console.log(`  [${n}/${articles.length}] ! ${slug} FAILED: ${(e as Error).message.slice(0, 200)}`);
    }
  }
}

/* ----------------------------------------------------------- */
/*  main                                                        */
/* ----------------------------------------------------------- */
/* ----------------------------------------------------------- */
/*  Reviews                                                     */
/* ----------------------------------------------------------- */
async function findWpReviewBySlug(slug: string): Promise<number | null> {
  const r = await wp<Array<{ id: number }>>(`/wp/v2/reviews?slug=${encodeURIComponent(slug)}&per_page=1`);
  return r[0]?.id ?? null;
}

async function findWpVideoBySlug(slug: string): Promise<number | null> {
  const r = await wp<Array<{ id: number }>>(`/wp/v2/videos?slug=${encodeURIComponent(slug)}&per_page=1`);
  return r[0]?.id ?? null;
}

type SanityReview = {
  _id: string;
  slug: { current: string };
  productName?: string;
  tagline?: string;
  heroImageUrl?: string;
  galleryImageUrls?: string[];
  score?: number;
  verdict?: string;
  summary?: string;
  publishedAt?: string;
  priceUsd?: number;
  pros?: string[];
  cons?: string[];
  ratings?: Array<{ name: string; score: number }>;
  sections?: Array<{ heading: string; body: string }>;
  category?: { slug?: { current: string } } | null;
  author?: { slug?: { current: string } } | null;
};

async function migrateReviews(): Promise<void> {
  console.log("▶ Reviews");
  const reviews = await sanity.fetch<SanityReview[]>(
    `*[_type == "review" && defined(slug.current)]{
      _id, slug, productName, tagline, heroImageUrl, galleryImageUrls,
      score, verdict, summary, publishedAt, priceUsd,
      pros, cons, ratings, sections,
      "category": category->{slug},
      "author": author->{slug}
    }`,
  );
  console.log(`  found ${reviews.length} reviews in Sanity`);
  let n = 0;
  for (const r of reviews) {
    n++;
    const slug = r.slug?.current ?? "";
    if (!slug) continue;
    try {
      const catId = r.category?.slug?.current
        ? catIdBySlug.get(r.category.slug.current)
        : undefined;
      const authorId = r.author?.slug?.current
        ? authorIdBySlug.get(r.author.slug.current)
        : undefined;

      const meta = {
        product_name: r.productName ?? "",
        tagline: r.tagline ?? "",
        hero_image_url: r.heroImageUrl ?? "",
        gallery_image_urls: r.galleryImageUrls ?? [],
        score: r.score ?? 0,
        verdict: r.verdict ?? "",
        price_usd: r.priceUsd ?? 0,
        pros: r.pros ?? [],
        cons: r.cons ?? [],
        ratings_json: JSON.stringify(r.ratings ?? []),
        sections_json: JSON.stringify(r.sections ?? []),
      };
      const payload: Record<string, unknown> = {
        title: r.productName ?? slug,
        slug,
        status: "publish",
        excerpt: r.summary ?? r.tagline ?? "",
        content: r.summary ?? "",
        date: r.publishedAt ?? new Date().toISOString(),
        meta,
      };
      if (catId) payload.categories = [catId];
      if (authorId) payload.author = authorId;

      const existing = await findWpReviewBySlug(slug);
      if (existing) {
        await wp(`/wp/v2/reviews/${existing}`, { method: "POST", body: JSON.stringify(payload) });
        console.log(`  [${n}/${reviews.length}] ↻ ${slug}`);
      } else {
        await wp(`/wp/v2/reviews`, { method: "POST", body: JSON.stringify(payload) });
        console.log(`  [${n}/${reviews.length}] + ${slug}`);
      }
    } catch (e) {
      console.log(`  [${n}/${reviews.length}] ! ${slug} FAILED: ${(e as Error).message.slice(0, 200)}`);
    }
  }
}

/* ----------------------------------------------------------- */
/*  Videos                                                      */
/* ----------------------------------------------------------- */
type SanityVideo = {
  _id: string;
  slug: { current: string };
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  publishedAt?: string;
  category?: { slug?: { current: string } } | null;
};

async function migrateVideos(): Promise<void> {
  console.log("▶ Videos");
  const videos = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && defined(slug.current)]{
      _id, slug, title, description, thumbnailUrl, videoUrl,
      "duration": duration, publishedAt,
      "category": category->{slug}
    }`,
  );
  console.log(`  found ${videos.length} videos in Sanity`);
  let n = 0;
  for (const v of videos) {
    n++;
    const slug = v.slug?.current ?? "";
    if (!slug) continue;
    try {
      const catId = v.category?.slug?.current
        ? catIdBySlug.get(v.category.slug.current)
        : undefined;

      const meta = {
        thumbnail_url: v.thumbnailUrl ?? "",
        video_url: v.videoUrl ?? "",
        duration_seconds: v.duration ?? 0,
        hero_image_url: v.thumbnailUrl ?? "",
      };
      const payload: Record<string, unknown> = {
        title: v.title ?? slug,
        slug,
        status: "publish",
        excerpt: v.description ?? "",
        content: v.description ?? "",
        date: v.publishedAt ?? new Date().toISOString(),
        meta,
      };
      if (catId) payload.categories = [catId];

      const existing = await findWpVideoBySlug(slug);
      if (existing) {
        await wp(`/wp/v2/videos/${existing}`, { method: "POST", body: JSON.stringify(payload) });
        console.log(`  [${n}/${videos.length}] ↻ ${slug}`);
      } else {
        await wp(`/wp/v2/videos`, { method: "POST", body: JSON.stringify(payload) });
        console.log(`  [${n}/${videos.length}] + ${slug}`);
      }
    } catch (e) {
      console.log(`  [${n}/${videos.length}] ! ${slug} FAILED: ${(e as Error).message.slice(0, 200)}`);
    }
  }
}

/* ----------------------------------------------------------- */
/*  main                                                        */
/* ----------------------------------------------------------- */
(async () => {
  console.log(`▶ Sanity → WordPress migration`);
  console.log(`  source: ${projectId}/${dataset}`);
  console.log(`  target: ${wpBase}`);
  await migrateCategories();
  await migrateAuthors();
  await migrateArticles();
  await migrateReviews();
  await migrateVideos();
  console.log("✅ Done.");
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
