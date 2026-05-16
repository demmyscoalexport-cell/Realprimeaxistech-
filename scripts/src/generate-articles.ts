import { createClient } from "@sanity/client";
import Anthropic from "@anthropic-ai/sdk";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !token) throw new Error("Missing SANITY env");

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const TARGET_PER_CATEGORY = Number(process.env.TARGET ?? "20");
const CATEGORY_SLUGS = [
  "future-tech",
  "gadgets",
  "ai",
  "artificial-intelligence",
  "gaming",
  "ev",
  "robotics",
  "cybersecurity",
  "vr-ar",
  "startups",
  "entertainment",
];

const AUTHORS = [
  "maya-chen",
  "amelia-okafor",
  "daniel-reyes",
  "marcus-bennett",
  "yuki-tanaka",
];

type Idea = {
  title: string;
  subtitle: string;
  excerpt: string;
  tags: string[];
};

const SYSTEM = `You are a senior tech editor at a publication that mixes Engadget, The Verge, and Wired. Generate fresh, distinct, current-feeling article ideas that sound like they ran today on a premium tech site. Topics should be specific (named companies, real product categories), forward-looking, and substantive — never listicles or "Top 10" pieces. Mix breaking-news, deep-dives, analysis, and opinion. No clickbait.

Output ONLY a JSON array (no prose, no markdown) of objects:
[{ "title": string, "subtitle": string, "excerpt": string, "tags": string[] }]

Title: 8-14 words, journalistic, no colons unless needed for clarity.
Subtitle (dek): one sentence that adds new info beyond the title, ≤180 chars.
Excerpt: 2 sentences, ≤260 chars, social-share-ready.
Tags: 3-5 lowercase hyphenated tags.`;

async function ideasFor(catSlug: string, count: number): Promise<Idea[]> {
  const prompt = `Generate ${count} article ideas in the "${catSlug}" category. Make them sound like recent 2025-2026 stories. JSON array only.`;
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  const txt = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const cleaned = txt.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as Idea[];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function rotatingAuthor(catSlug: string, i: number): string {
  const map: Record<string, string> = {
    ai: "daniel-reyes",
    "artificial-intelligence": "maya-chen",
    gadgets: "yuki-tanaka",
    gaming: "marcus-bennett",
    ev: "amelia-okafor",
    "future-tech": "maya-chen",
    robotics: "daniel-reyes",
    cybersecurity: "marcus-bennett",
    "vr-ar": "yuki-tanaka",
    startups: "amelia-okafor",
    entertainment: "marcus-bennett",
  };
  return map[catSlug] ?? AUTHORS[i % AUTHORS.length];
}

async function main() {
  const cats = await sanity.fetch<{ _id: string; slug: string; n: number }[]>(
    `*[_type=="category" && defined(slug.current)]{_id,"slug":slug.current,"n":count(*[_type=="article" && references(^._id)])}`,
  );
  const catIdBySlug = new Map(cats.map((c) => [c.slug, c._id]));
  const countMap = new Map(cats.map((c) => [c.slug, c.n]));
  console.log("Existing per category:", Object.fromEntries(countMap));

  const auths = await sanity.fetch<{ _id: string; slug: string }[]>(
    `*[_type=="author" && defined(slug.current)]{_id,"slug":slug.current}`,
  );
  const authIdBySlug = new Map(auths.map((a) => [a.slug, a._id]));

  const existingSlugs = new Set(
    await sanity.fetch<string[]>(`*[_type=="article"].slug.current`),
  );

  const all: { idea: Idea; catSlug: string; author: string }[] = [];

  console.log(`Generating ideas (target ${TARGET_PER_CATEGORY}/category)…`);
  await Promise.all(
    CATEGORY_SLUGS.map(async (slug) => {
      const have = countMap.get(slug) ?? 0;
      const need = Math.max(0, TARGET_PER_CATEGORY - have);
      if (need === 0) {
        console.log(`  • ${slug}: already at ${have}, skipping`);
        return;
      }
      try {
        const ideas = await ideasFor(slug, need);
        let added = 0;
        ideas.forEach((idea, i) => {
          const s = slugify(idea.title);
          if (existingSlugs.has(s)) return;
          existingSlugs.add(s);
          all.push({ idea, catSlug: slug, author: rotatingAuthor(slug, i) });
          added++;
        });
        console.log(`  ✓ ${slug}: have ${have}, need ${need}, added ${added}`);
      } catch (e) {
        console.error(`  ✗ ${slug}:`, (e as Error).message.slice(0, 200));
      }
    }),
  );

  console.log(`\nCommitting ${all.length} article stubs to Sanity…`);
  const tx = sanity.transaction();
  const now = Date.now();
  for (let i = 0; i < all.length; i++) {
    const { idea, catSlug, author } = all[i];
    const slug = slugify(idea.title);
    const publishedAt = new Date(now - i * 1000 * 60 * 47).toISOString();
    const catId = catIdBySlug.get(catSlug);
    const authId = authIdBySlug.get(author) ?? authIdBySlug.get("daniel-reyes");
    if (!catId || !authId) {
      console.warn(`  skip ${slug}: missing cat=${catId} or auth=${authId}`);
      continue;
    }
    tx.createOrReplace({
      _id: `article-${slug}`,
      _type: "article",
      title: idea.title,
      slug: { _type: "slug", current: slug },
      subtitle: idea.subtitle,
      excerpt: idea.excerpt,
      category: { _type: "reference", _ref: catId },
      author: { _type: "reference", _ref: authId },
      publishedAt,
      readingMinutes: 8,
      tags: idea.tags,
      body: [],
      keyTakeaways: [],
      aiSummary: "",
      isBreaking: false,
      isFeature: false,
    });
  }
  await tx.commit();
  console.log(`Done. ${all.length} new article stubs created.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
