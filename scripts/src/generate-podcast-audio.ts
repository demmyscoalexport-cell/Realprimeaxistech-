import { createClient } from "@sanity/client";
import { v2 as cloudinary } from "cloudinary";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const sanityToken = process.env.SANITY_API_TOKEN;
const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

if (!projectId || !sanityToken) {
  throw new Error("Missing SANITY_PROJECT_ID / SANITY_API_TOKEN env");
}

if (!elevenLabsKey) {
  throw new Error("Missing ELEVENLABS_API_KEY env");
}

if (!process.env.CLOUDINARY_URL) {
  throw new Error("Missing CLOUDINARY_URL env (cloudinary://key:secret@cloud)");
}

cloudinary.config({ secure: true });

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token: sanityToken,
  useCdn: false,
});

type PortableTextBlock = {
  _type: string;
  style?: string;
  listItem?: string;
  children?: { _type: string; text?: string }[];
};

type SanityArticle = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  aiSummary?: string;
  keyTakeaways?: string[];
  tags?: string[];
  body?: PortableTextBlock[];
  podcastAudioUrl?: string;
  podcastPlatforms?: PodcastPlatformLink[];
  category?: { name?: string };
  author?: { name?: string };
};

type PodcastPlatformLink = {
  platform: string;
  url: string;
};

type CloudinaryAudioUpload = {
  secure_url: string;
  duration?: number;
  bytes?: number;
};

const ELEVENLABS_BASE_URL =
  process.env.ELEVENLABS_BASE_URL ?? "https://api.elevenlabs.io";
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
const ELEVENLABS_MODEL_ID =
  process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const ELEVENLABS_OUTPUT_FORMAT =
  process.env.ELEVENLABS_OUTPUT_FORMAT ?? "mp3_44100_128";
const PODCAST_TAG = process.env.PODCAST_TAG ?? "podcast-v1";
const MAX_SCRIPT_CHARS = Number(process.env.PODCAST_MAX_CHARS ?? "4500");

function portableTextToText(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks) return "";

  const parts: string[] = [];
  for (const block of blocks) {
    if (block._type !== "block") continue;
    const text = (block.children ?? [])
      .map((child) => (child._type === "span" ? (child.text ?? "") : ""))
      .join("")
      .trim();
    if (!text) continue;

    if (block.listItem) {
      parts.push(`- ${text}`);
    } else if (block.style && /^h[1-6]$/.test(block.style)) {
      parts.push(`\n${text}`);
    } else {
      parts.push(text);
    }
  }

  return parts.join("\n\n");
}

function compactWhitespace(value: string): string {
  return value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function trimToSentenceBoundary(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;

  const clipped = value.slice(0, maxChars);
  const boundary = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? "),
    clipped.lastIndexOf("\n\n"),
  );

  if (boundary < Math.floor(maxChars * 0.65)) {
    return `${clipped.trimEnd()}...`;
  }

  return clipped.slice(0, boundary + 1).trimEnd();
}

function buildPodcastScript(article: SanityArticle): string {
  const articleText = portableTextToText(article.body);
  const takeaways = (article.keyTakeaways ?? [])
    .slice(0, 4)
    .map((takeaway) => `- ${takeaway}`)
    .join("\n");

  const source = compactWhitespace(
    [
      article.aiSummary,
      article.excerpt,
      takeaways ? `Key takeaways:\n${takeaways}` : "",
      articleText,
    ]
      .filter(Boolean)
      .join("\n\n"),
  );

  const intro = [
    "You're listening to PrimeAxis Tech.",
    `Today: ${article.title}.`,
    article.subtitle,
  ]
    .filter(Boolean)
    .join(" ");

  const outro =
    "For links, visuals, and the full story, visit PrimeAxis Tech. Thanks for listening.";
  const reserved = intro.length + outro.length + 8;
  const body = trimToSentenceBoundary(
    source,
    Math.max(800, MAX_SCRIPT_CHARS - reserved),
  );

  return compactWhitespace(`${intro}\n\n${body}\n\n${outro}`);
}

async function generateAudio(script: string): Promise<Buffer> {
  const url = new URL(
    `${ELEVENLABS_BASE_URL.replace(/\/$/, "")}/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
  );
  url.searchParams.set("output_format", ELEVENLABS_OUTPUT_FORMAT);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": elevenLabsKey,
    },
    body: JSON.stringify({
      text: script,
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: {
        stability: Number(process.env.ELEVENLABS_STABILITY ?? "0.48"),
        similarity_boost: Number(
          process.env.ELEVENLABS_SIMILARITY_BOOST ?? "0.78",
        ),
        style: Number(process.env.ELEVENLABS_STYLE ?? "0.18"),
        use_speaker_boost: process.env.ELEVENLABS_SPEAKER_BOOST !== "0",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `ElevenLabs ${response.status}: ${(await response.text()).slice(0, 400)}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

async function uploadAudio(
  audio: Buffer,
  publicId: string,
): Promise<CloudinaryAudioUpload> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "primeaxis/podcasts",
        public_id: publicId,
        overwrite: true,
        resource_type: "video",
        format: "mp3",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload did not return a secure URL"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          duration: result.duration,
          bytes: result.bytes,
        });
      },
    );

    stream.end(audio);
  });
}

function estimateDurationSeconds(script: string): number {
  const words = script.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((words / 155) * 60));
}

function mergePlatformLinks(
  existing: PodcastPlatformLink[] | undefined,
): PodcastPlatformLink[] {
  const links = (existing ?? []).filter((link) => link.platform && link.url);
  const feedUrl = process.env.PODCAST_FEED_URL;
  if (feedUrl && !links.some((link) => link.platform === "rss")) {
    links.push({ platform: "rss", url: feedUrl });
  }
  return links;
}

function uniqueTags(tags: string[] | undefined): string[] {
  return Array.from(new Set([...(tags ?? []), PODCAST_TAG]));
}

async function fetchArticles(): Promise<SanityArticle[]> {
  const limit = Math.max(1, Number(process.env.LIMIT ?? "10"));
  const conditions = [`_type == "article"`, `defined(slug.current)`];
  const params: Record<string, string> = {};

  if (process.env.ARTICLE_SLUG) {
    conditions.push(`slug.current == $slug`);
    params.slug = process.env.ARTICLE_SLUG;
  }

  if (process.env.CATEGORY_SLUG) {
    conditions.push(`category->slug.current == $categorySlug`);
    params.categorySlug = process.env.CATEGORY_SLUG;
  }

  if (process.env.TAG) {
    conditions.push(`$tag in tags`);
    params.tag = process.env.TAG;
  }

  if (process.env.FORCE !== "1") {
    conditions.push(`!defined(podcastAudioUrl)`);
  }

  return sanity.fetch<SanityArticle[]>(
    `*[${conditions.join(" && ")}] | order(publishedAt desc) [0...${limit}] {
      _id,
      title,
      "slug": slug.current,
      subtitle,
      excerpt,
      aiSummary,
      keyTakeaways,
      tags,
      body,
      podcastAudioUrl,
      podcastPlatforms,
      "category": category->{name},
      "author": author->{name}
    }`,
    params,
  );
}

async function main() {
  const articles = await fetchArticles();
  const concurrency = Math.max(1, Number(process.env.CONCURRENCY ?? "2"));
  const queue = [...articles];
  let done = 0;
  let failed = 0;

  console.log(`Found ${articles.length} article(s) for podcast generation`);

  async function worker(id: number): Promise<void> {
    while (queue.length) {
      const article = queue.shift();
      if (!article) return;

      const label = `[w${id}] ${article.slug}`;
      try {
        const script = buildPodcastScript(article);
        console.log(
          `→ ${label}: generating ${script.length.toLocaleString()} chars`,
        );

        const audio = await generateAudio(script);
        const upload = await uploadAudio(audio, `article-podcast-${article.slug}`);
        const duration = Math.round(
          upload.duration ?? estimateDurationSeconds(script),
        );

        await sanity
          .patch(article._id)
          .set({
            podcastAudioUrl: upload.secure_url,
            podcastDurationSeconds: duration,
            podcastAudioBytes: upload.bytes ?? audio.byteLength,
            podcastGeneratedAt: new Date().toISOString(),
            podcastScript: script,
            podcastPlatforms: mergePlatformLinks(article.podcastPlatforms),
            tags: uniqueTags(article.tags),
          })
          .commit();

        done++;
        console.log(`  ✓ ${label}: ${upload.secure_url}`);
      } catch (error) {
        failed++;
        console.error(`  ✗ ${label}:`, (error as Error).message.slice(0, 300));
      }
    }
  }

  await Promise.all(
    Array.from({ length: concurrency }, (_, index) => worker(index + 1)),
  );

  console.log(`Done. ${done} generated, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
