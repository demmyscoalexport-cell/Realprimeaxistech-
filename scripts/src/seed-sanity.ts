import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import {
  categoriesSeed,
  authorsSeed,
  articlesSeed,
  reviewsSeed,
  videosSeed,
} from "./seed-primeaxis.js";
import type { ArticleBlock } from "@workspace/db";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing SANITY_PROJECT_ID or SANITY_API_TOKEN env vars. Aborting.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const docId = (kind: string, slug: string) => `${kind}-${slug}`;

function uid() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

type PtSpan = { _type: "span"; _key: string; text: string; marks: string[] };
type PtBlock = {
  _type: "block";
  _key: string;
  style: string;
  children: PtSpan[];
  markDefs: never[];
  listItem?: "bullet";
  level?: number;
};

function span(text: string): PtSpan {
  return { _type: "span", _key: uid(), text, marks: [] };
}

function ptBlock(style: string, text: string, listItem?: "bullet"): PtBlock {
  const block: PtBlock = {
    _type: "block",
    _key: uid(),
    style,
    children: [span(text)],
    markDefs: [],
  };
  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }
  return block;
}

function bodyToPortableText(body: ArticleBlock[]): PtBlock[] {
  const out: PtBlock[] = [];
  for (const b of body) {
    if (b.type === "paragraph") {
      out.push(ptBlock("normal", b.content));
    } else if (b.type === "heading") {
      out.push(ptBlock("h2", b.content));
    } else if (b.type === "quote") {
      out.push(ptBlock("blockquote", b.content));
    } else if (b.type === "image") {
      if (b.caption) out.push(ptBlock("normal", `[Image: ${b.caption}]`));
    } else if (b.type === "list") {
      for (const item of b.items ?? []) {
        out.push(ptBlock("normal", item, "bullet"));
      }
    }
  }
  return out;
}

async function run() {
  const tx = client.transaction();

  console.log(`→ Categories: ${categoriesSeed.length}`);
  for (const c of categoriesSeed) {
    tx.createOrReplace({
      _id: docId("category", c.slug),
      _type: "category",
      name: c.name,
      slug: { _type: "slug", current: c.slug },
      description: c.description,
      accentColor: c.accentColor,
      order: 0,
    });
  }

  console.log(`→ Authors: ${authorsSeed.length}`);
  for (const a of authorsSeed) {
    tx.createOrReplace({
      _id: docId("author", a.slug),
      _type: "author",
      name: a.name,
      slug: { _type: "slug", current: a.slug },
      role: a.role,
      bio: a.bio,
      twitter: a.twitter,
      avatarUrl: a.avatarUrl,
    });
  }

  console.log(`→ Articles: ${articlesSeed.length}`);
  for (const ar of articlesSeed) {
    tx.createOrReplace({
      _id: docId("article", ar.slug),
      _type: "article",
      title: ar.title,
      slug: { _type: "slug", current: ar.slug },
      subtitle: ar.subtitle,
      excerpt: ar.excerpt,
      heroImageUrl: ar.heroImageUrl,
      category: { _type: "reference", _ref: docId("category", ar.categorySlug) },
      author: { _type: "reference", _ref: docId("author", ar.authorSlug) },
      publishedAt: ar.publishedAt.toISOString(),
      readingMinutes: ar.readingMinutes,
      tags: ar.tags,
      body: bodyToPortableText(ar.body),
      keyTakeaways: ar.keyTakeaways,
      aiSummary: ar.aiSummary,
      isBreaking: ar.isBreaking,
      isFeature: ar.isFeature,
    });
  }

  console.log(`→ Reviews: ${reviewsSeed.length}`);
  for (const rv of reviewsSeed) {
    tx.createOrReplace({
      _id: docId("review", rv.slug),
      _type: "review",
      productName: rv.productName,
      slug: { _type: "slug", current: rv.slug },
      tagline: rv.tagline,
      heroImageUrl: rv.heroImageUrl,
      galleryImageUrls: rv.galleryImages,
      score: rv.score,
      verdict: rv.verdict,
      summary: rv.summary,
      category: { _type: "reference", _ref: docId("category", rv.categorySlug) },
      author: { _type: "reference", _ref: docId("author", rv.authorSlug) },
      publishedAt: rv.publishedAt.toISOString(),
      priceUsd: rv.priceUsd,
      pros: rv.pros,
      cons: rv.cons,
      ratings: (rv.ratings ?? []).map((r) => ({
        _key: uid(),
        _type: "object",
        label: r.label,
        score: r.score,
      })),
      sections: (rv.sections ?? []).map((s) => ({
        _key: uid(),
        _type: "object",
        heading: s.heading,
        body: s.body,
      })),
    });
  }

  console.log(`→ Videos: ${videosSeed.length}`);
  for (const v of videosSeed) {
    tx.createOrReplace({
      _id: docId("video", v.slug),
      _type: "video",
      title: v.title,
      slug: { _type: "slug", current: v.slug },
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      duration: v.durationSeconds,
      category: { _type: "reference", _ref: docId("category", v.categorySlug) },
      publishedAt: v.publishedAt.toISOString(),
    });
  }

  const result = await tx.commit();
  console.log(
    `✓ Committed ${result.results.length} documents to Sanity (${projectId}/${dataset}).`,
  );
}

run().catch((err) => {
  console.error("Sanity seed failed:", err);
  process.exit(1);
});
