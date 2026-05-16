import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
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

const uid = () => randomUUID().replace(/-/g, "").slice(0, 12);

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

const span = (text: string): PtSpan => ({
  _type: "span",
  _key: uid(),
  text,
  marks: [],
});
const block = (style: string, text: string, listItem?: "bullet"): PtBlock => {
  const b: PtBlock = {
    _type: "block",
    _key: uid(),
    style,
    children: [span(text)],
    markDefs: [],
  };
  if (listItem) {
    b.listItem = listItem;
    b.level = 1;
  }
  return b;
};

type Section =
  | { type: "h2"; content: string }
  | { type: "p"; content: string }
  | { type: "quote"; content: string }
  | { type: "bullets"; items: string[] };

type AiOut = {
  body: Section[];
  keyTakeaways: string[];
  aiSummary: string;
};

function toPortableText(sections: Section[]): PtBlock[] {
  const out: PtBlock[] = [];
  for (const s of sections) {
    if (s.type === "h2") out.push(block("h2", s.content));
    else if (s.type === "p") out.push(block("normal", s.content));
    else if (s.type === "quote") out.push(block("blockquote", s.content));
    else if (s.type === "bullets")
      for (const item of s.items) out.push(block("normal", item, "bullet"));
  }
  return out;
}

const SYSTEM = `You are a senior tech editor at a premium publication like Engadget, The Verge, and Wired combined. You write for sophisticated, busy readers. Your prose is sharp, specific, evidence-led, and never breathless. You favor concrete details, real numbers, named sources, and second-order analysis over hype.

Output ONLY valid JSON matching this TypeScript type:
{
  body: Array<
    | { type: "h2", content: string }
    | { type: "p", content: string }
    | { type: "quote", content: string }
    | { type: "bullets", items: string[] }
  >,
  keyTakeaways: string[],   // 4 short punchy bullets, ≤120 chars each
  aiSummary: string         // 2 paragraphs, ~80 words total
}

Rules:
- 1500–2000 words total in body.
- Open with a 2–3 paragraph lede that sets stakes immediately. No "in today's world" filler.
- 5–7 H2 sections after the lede with named, journalistic headers (e.g. "What Anthropic actually shipped", "Why investors care now", "The catch nobody is talking about").
- Each H2 has 2–4 paragraphs.
- Include ONE pull quote (type: "quote") attributed inline within a paragraph before/after it.
- Include ONE bullet list section in the middle.
- Use specific (plausible) numbers, named companies/people, dollar figures, dates.
- Reference real industry context where possible (companies that exist today).
- End with a forward-looking final section titled "What to watch next".
- No emojis. No hashtags. No marketing speak.`;

async function rewrite(article: {
  title: string;
  subtitle?: string;
  excerpt: string;
  category: string;
  tags?: string[];
}): Promise<AiOut> {
  const userMsg = `Write a longform article.

Title: ${article.title}
${article.subtitle ? `Dek: ${article.subtitle}\n` : ""}Category: ${article.category}
Tags: ${(article.tags ?? []).join(", ")}
Original excerpt: ${article.excerpt}

Write the full article now. JSON only, no prose, no markdown fences.`;

  const msg = await anthropic.messages.create({
    model: process.env.MODEL ?? "claude-haiku-4-5",
    max_tokens: 8192,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });
  const txt = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  const cleaned = txt.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as AiOut;
}

async function main() {
  const articles = await sanity.fetch<
    {
      _id: string;
      title: string;
      subtitle?: string;
      excerpt: string;
      tags?: string[];
      category?: { name: string };
      bodyLen?: number;
    }[]
  >(
    `*[_type=="article"]{_id,title,subtitle,excerpt,tags,"category":category->{name},"bodyLen":count(body)}`,
  );

  const limit = Number(process.env.LIMIT ?? "100");
  const toDo = articles.filter((a) => (a.bodyLen ?? 0) < 18).slice(0, limit);
  console.log(`Found ${articles.length} articles, ${toDo.length} to rewrite this pass`);

  let done = 0;
  let failed = 0;
  const concurrency = Number(process.env.CONCURRENCY ?? "8");
  const queue = [...toDo];

  async function worker(id: number) {
    while (queue.length) {
      const a = queue.shift();
      if (!a) return;
      const label = `[w${id}] ${a.title.slice(0, 60)}`;
      try {
        console.log(`→ ${label}`);
        const t0 = Date.now();
        const out = await rewrite({
          title: a.title,
          subtitle: a.subtitle,
          excerpt: a.excerpt,
          category: a.category?.name ?? "Tech",
          tags: a.tags,
        });
        await sanity
          .patch(a._id)
          .set({
            body: toPortableText(out.body),
            keyTakeaways: out.keyTakeaways.slice(0, 5),
            aiSummary: out.aiSummary,
          })
          .commit();
        done++;
        console.log(
          `  ✓ ${label} (${Math.round((Date.now() - t0) / 1000)}s, ${out.body.length} blocks)`,
        );
      } catch (e) {
        failed++;
        console.error(`  ✗ ${label}:`, (e as Error).message.slice(0, 200));
      }
    }
  }

  await Promise.all(
    Array.from({ length: concurrency }, (_, i) => worker(i + 1)),
  );
  console.log(`\nDone. ${done} rewritten, ${failed} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
