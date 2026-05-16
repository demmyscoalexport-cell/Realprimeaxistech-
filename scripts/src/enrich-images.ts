import { createClient } from "@sanity/client";
import { v2 as cloudinary } from "cloudinary";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const sanityToken = process.env.SANITY_API_TOKEN;
const wsKey = process.env.WAVESPEED_API_KEY;
if (!projectId || !sanityToken || !wsKey)
  throw new Error("Missing SANITY/WAVESPEED env");

cloudinary.config({
  cloud_name: "dxizihlmo",
  api_key: "654919554582831",
  api_secret: "j4GLSAjjApKUgInR41eCUiQIqUo",
  secure: true,
});

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token: sanityToken,
  useCdn: false,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STYLE_BY_CATEGORY: Record<string, string> = {
  AI: "abstract data visualization, glowing neural networks, deep blue and electric cyan, volumetric light, particles, dark cinematic mood",
  Gadgets:
    "premium product photography, dramatic studio lighting, dark glossy backdrop, anodized aluminum and glass, macro detail",
  Reviews:
    "premium product photography on dark surface, soft rim light, depth of field, magazine cover quality",
  Gaming:
    "epic cinematic still from a AAA video game, dramatic god rays, particle effects, vivid color grade, ultra wide composition",
  Cybersecurity:
    "dark hooded silhouette in front of code walls, red and green terminal glow, fog, anamorphic lens flare",
  "EV & Mobility":
    "futuristic electric vehicle on a wet city street at dusk, reflections, neon signage, cinematic, bokeh",
  Entertainment:
    "behind-the-scenes editorial photograph, warm cinematic color grade, dramatic lighting",
  "Future Tech":
    "abstract scientific concept, holographic interface, clean white lab with cyan accents, ultra detailed",
  Robotics:
    "humanoid robot in a clean industrial environment, soft directional light, cinematic 35mm",
  Startups:
    "modern startup office, golden hour through floor-to-ceiling windows, founders silhouettes, cinematic editorial",
  "VR / AR":
    "person wearing a sleek AR headset, holographic UI elements floating, dark room with cyan glow, cinematic",
  "Artificial Intelligence":
    "abstract data visualization, glowing neural networks, deep blue and electric cyan, volumetric light, particles, dark cinematic mood",
};

function buildPrompt(title: string, category: string): string {
  const style =
    STYLE_BY_CATEGORY[category] ??
    "cinematic editorial photograph, dramatic lighting, deep colors, ultra detailed";
  return `${title}. ${style}. shot on Arri Alexa, 35mm, hyper detailed, 8k, photorealistic, magazine cover, no text, no watermark, no logo`;
}

const WS_BASE = "https://api.wavespeed.ai/api/v3";

async function generateImage(prompt: string, size = "1280*720"): Promise<string> {
  const create = await fetch(`${WS_BASE}/wavespeed-ai/flux-schnell`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${wsKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      size,
      num_inference_steps: 4,
      enable_safety_checker: true,
    }),
  });
  if (!create.ok)
    throw new Error(`WaveSpeed create ${create.status}: ${await create.text()}`);
  const cj = (await create.json()) as {
    data: { id: string; urls: { get: string } };
  };
  const pollUrl = cj.data.urls.get;

  for (let i = 0; i < 60; i++) {
    await sleep(1500);
    const r = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${wsKey}` },
    });
    if (!r.ok) continue;
    const j = (await r.json()) as {
      data: { status: string; outputs: string[]; error?: string };
    };
    if (j.data.status === "completed") {
      if (!j.data.outputs?.[0]) throw new Error("No outputs");
      return j.data.outputs[0];
    }
    if (j.data.status === "failed")
      throw new Error(`WaveSpeed failed: ${j.data.error}`);
  }
  throw new Error("WaveSpeed timeout");
}

async function uploadToCloudinary(
  imageUrl: string,
  publicId: string,
): Promise<string> {
  const res = await cloudinary.uploader.upload(imageUrl, {
    folder: "primeaxis/ai",
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
  return res.secure_url;
}

type Job = {
  _id: string;
  type: "article" | "review" | "video" | "author";
  field: "heroImageUrl" | "thumbnailUrl" | "avatarUrl";
  publicId: string;
  prompt: string;
  size?: string;
};

async function main() {
  const skipExisting = process.env.FORCE !== "1";
  const hasAi = (u?: string) => !!u && u.includes("/primeaxis/ai/");

  const articles = await sanity.fetch<
    {
      _id: string;
      title: string;
      slug: { current: string };
      heroImageUrl?: string;
      category?: { name: string };
    }[]
  >(
    `*[_type=="article"]{_id,title,slug,heroImageUrl,"category":category->{name}}`,
  );

  const reviews = await sanity.fetch<
    {
      _id: string;
      productName: string;
      slug: { current: string };
      heroImageUrl?: string;
      category?: { name: string };
    }[]
  >(
    `*[_type=="review"]{_id,productName,slug,heroImageUrl,"category":category->{name}}`,
  );

  const videos = await sanity.fetch<
    {
      _id: string;
      title: string;
      slug: { current: string };
      thumbnailUrl?: string;
    }[]
  >(`*[_type=="video"]{_id,title,slug,thumbnailUrl}`);

  const authors = await sanity.fetch<
    {
      _id: string;
      name: string;
      slug: { current: string };
      role?: string;
      avatarUrl?: string;
    }[]
  >(`*[_type=="author"]{_id,name,slug,role,avatarUrl}`);

  const jobs: Job[] = [];

  for (const a of articles) {
    if (skipExisting && hasAi(a.heroImageUrl)) continue;
    jobs.push({
      _id: a._id,
      type: "article",
      field: "heroImageUrl",
      publicId: `article-hero-${a.slug.current}`,
      prompt: buildPrompt(a.title, a.category?.name ?? "Tech"),
      size: "1280*720",
    });
  }
  for (const r of reviews) {
    if (skipExisting && hasAi(r.heroImageUrl)) continue;
    jobs.push({
      _id: r._id,
      type: "review",
      field: "heroImageUrl",
      publicId: `review-hero-${r.slug.current}`,
      prompt: buildPrompt(`${r.productName}, premium consumer technology product`, "Reviews"),
      size: "1280*720",
    });
  }
  for (const v of videos) {
    if (skipExisting && hasAi(v.thumbnailUrl)) continue;
    jobs.push({
      _id: v._id,
      type: "video",
      field: "thumbnailUrl",
      publicId: `video-thumb-${v.slug.current}`,
      prompt: buildPrompt(v.title, "Entertainment"),
      size: "1280*720",
    });
  }
  for (const au of authors) {
    if (skipExisting && hasAi(au.avatarUrl)) continue;
    jobs.push({
      _id: au._id,
      type: "author",
      field: "avatarUrl",
      publicId: `author-${au.slug.current}`,
      prompt: `professional editorial portrait headshot of a ${au.role ?? "tech journalist"}, neutral studio backdrop, soft cinematic light, magazine quality, sharp focus, photorealistic. no text`,
      size: "768*768",
    });
  }

  console.log(`Total jobs: ${jobs.length}`);

  let done = 0;
  let failed = 0;
  const concurrency = Number(process.env.CONCURRENCY ?? "6");
  const queue = [...jobs];

  async function worker(id: number) {
    while (queue.length) {
      const j = queue.shift();
      if (!j) return;
      const label = `[w${id}] ${j.type}/${j.publicId}`;
      try {
        const t0 = Date.now();
        const wsUrl = await generateImage(j.prompt, j.size);
        const cdn = await uploadToCloudinary(wsUrl, j.publicId);
        await sanity.patch(j._id).set({ [j.field]: cdn }).commit();
        done++;
        console.log(
          `  ✓ ${label} (${Math.round((Date.now() - t0) / 1000)}s)`,
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
  console.log(`\nDone. ${done} generated, ${failed} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
