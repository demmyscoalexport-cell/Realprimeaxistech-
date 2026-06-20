import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../data");
const outputFile = path.join(outputDir, "article-embeddings.json");

const apiKey = process.env.COHERE_API_KEY;
const baseUrl = (process.env.COHERE_BASE_URL ?? "https://api.cohere.com").replace(
  /\/$/,
  "",
);
const embedModel = process.env.COHERE_EMBED_MODEL ?? "embed-english-v3.0";

if (!apiKey) {
  throw new Error("Missing COHERE_API_KEY env");
}

type RawArticle = {
  slug: string;
  title: string;
  excerpt: string;
  tags?: string[];
};

type CohereEmbedResponse = {
  embeddings?: number[][];
  message?: string;
};

async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await fetch(`${baseUrl}/v1/embed`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts,
      model: embedModel,
      input_type: "search_document",
      truncate: "END",
    }),
  });

  const body = (await response.json()) as CohereEmbedResponse;
  if (!response.ok) {
    throw new Error(body.message ?? `Cohere embed failed with ${response.status}`);
  }
  return body.embeddings ?? [];
}

async function main() {
  const projectId = process.env.SANITY_PROJECT_ID ?? "jyppkgsk";
  const dataset = process.env.SANITY_DATASET ?? "production";
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: true,
  });

  const articles = await client.fetch<RawArticle[]>(
    `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
      "slug": slug.current,
      title,
      excerpt,
      tags
    }`,
  );

  const batchSize = 96;
  const records: {
    slug: string;
    title: string;
    embedding: number[];
  }[] = [];

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const texts = batch.map((article) => {
      const tags = article.tags?.length
        ? `\nTags: ${article.tags.join(", ")}`
        : "";
      return `${article.title}\n${article.excerpt}${tags}`;
    });
    const embeddings = await embedTexts(texts);
    for (let j = 0; j < batch.length; j += 1) {
      const embedding = embeddings[j];
      if (!embedding) continue;
      records.push({
        slug: batch[j].slug,
        title: batch[j].title,
        embedding,
      });
    }
    console.log(
      `Embedded ${Math.min(i + batch.length, articles.length)}/${articles.length}`,
    );
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    outputFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model: embedModel,
        count: records.length,
        articles: records,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote ${records.length} embeddings to ${outputFile}`);
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});

export {};
