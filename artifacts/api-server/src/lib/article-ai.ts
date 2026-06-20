import {
  listArticleSummaries,
  searchArticleSummaries,
  type ArticleDetail,
  type ArticleSummary,
} from "./cms";
import { cohereChat, cohereRerank, isCohereConfigured } from "./cohere";
import { logger } from "./logger";

const MAX_ASK_QUESTION_CHARS = 500;
const MAX_ASK_BODY_CHARS = 12_000;

export function articleToSearchDocument(article: ArticleSummary): string {
  const tags = article.tags.length ? `\nTags: ${article.tags.join(", ")}` : "";
  return `${article.title}\n${article.excerpt}${tags}`;
}

function mergeUniqueArticles(
  primary: ArticleSummary[],
  secondary: ArticleSummary[],
  max: number,
): ArticleSummary[] {
  const seen = new Set<string>();
  const merged: ArticleSummary[] = [];
  for (const article of [...primary, ...secondary]) {
    if (seen.has(article.slug)) continue;
    seen.add(article.slug);
    merged.push(article);
    if (merged.length >= max) break;
  }
  return merged;
}

async function gatherSearchCandidates(
  query: string,
  poolSize: number,
): Promise<ArticleSummary[]> {
  const keywordHits = await searchArticleSummaries(query, poolSize);
  if (keywordHits.length >= poolSize || !isCohereConfigured()) {
    return keywordHits;
  }

  const recent = await listArticleSummaries({ limit: poolSize });
  return mergeUniqueArticles(keywordHits, recent, poolSize);
}

export async function semanticSearchArticles(
  query: string,
  limit = 20,
): Promise<ArticleSummary[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const poolSize = Math.min(Math.max(limit * 4, 30), 100);
  const candidates = await gatherSearchCandidates(trimmed, poolSize);
  if (candidates.length === 0) return [];

  if (!isCohereConfigured()) {
    return candidates.slice(0, limit);
  }

  try {
    const documents = candidates.map(articleToSearchDocument);
    const rankedIndexes = await cohereRerank(trimmed, documents, limit);
    const ranked = rankedIndexes
      .map((index) => candidates[index])
      .filter((article): article is ArticleSummary => Boolean(article));
    return ranked.length > 0 ? ranked : candidates.slice(0, limit);
  } catch (error) {
    logger.warn(
      { err: error },
      "Cohere semantic search failed; falling back to keyword results",
    );
    return candidates.slice(0, limit);
  }
}

export async function getRelatedArticlesSemantic(
  article: ArticleDetail,
  limit = 6,
): Promise<ArticleSummary[]> {
  const poolSize = Math.max(limit * 4, 24);
  const categoryCandidates = await listArticleSummaries({
    categorySlug: article.category.slug,
    excludeSlug: article.slug,
    limit: poolSize,
  });

  if (!isCohereConfigured()) {
    return categoryCandidates.slice(0, limit);
  }

  const recentCandidates = await listArticleSummaries({
    excludeSlug: article.slug,
    limit: poolSize,
  });
  const candidates = mergeUniqueArticles(
    categoryCandidates,
    recentCandidates,
    poolSize,
  );

  if (candidates.length === 0) return [];

  const reference = [
    article.title,
    article.excerpt,
    article.aiSummary,
    article.tags.length ? `Tags: ${article.tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const documents = candidates.map(articleToSearchDocument);
    const rankedIndexes = await cohereRerank(reference, documents, limit);
    const ranked = rankedIndexes
      .map((index) => candidates[index])
      .filter((candidate): candidate is ArticleSummary => Boolean(candidate));
    return ranked.length > 0 ? ranked : categoryCandidates.slice(0, limit);
  } catch (error) {
    logger.warn(
      { err: error },
      "Cohere related-articles rerank failed; falling back to category matches",
    );
    return categoryCandidates.slice(0, limit);
  }
}

function articleBodyToText(article: ArticleDetail): string {
  return article.body
    .filter(
      (block) =>
        block.type === "paragraph" ||
        block.type === "heading" ||
        block.type === "quote",
    )
    .map((block) => block.content)
    .join("\n\n")
    .slice(0, MAX_ASK_BODY_CHARS);
}

export async function askArticleQuestion(
  article: ArticleDetail,
  question: string,
): Promise<string> {
  const trimmed = question.trim();
  if (!trimmed) {
    throw new Error("Question is required");
  }
  if (trimmed.length > MAX_ASK_QUESTION_CHARS) {
    throw new Error(
      `Question must be ${MAX_ASK_QUESTION_CHARS} characters or fewer`,
    );
  }
  if (!isCohereConfigured()) {
    throw new Error("Cohere is not configured");
  }

  const takeaways = article.keyTakeaways.length
    ? article.keyTakeaways.map((item) => `- ${item}`).join("\n")
    : "None listed.";

  const context = [
    `Title: ${article.title}`,
    article.subtitle ? `Subtitle: ${article.subtitle}` : "",
    `Summary: ${article.aiSummary || article.excerpt}`,
    `Key takeaways:\n${takeaways}`,
    `Article body:\n${articleBodyToText(article)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const system = [
    "You answer questions about a PrimeAxis Tech article.",
    "Use only the article context provided in the user message.",
    "If the answer is not supported by the context, say you cannot find that in the article.",
    "Keep answers concise, factual, and under 300 words.",
    "Do not invent facts, quotes, or sources.",
  ].join(" ");

  return cohereChat({
    system,
    user: `Article context:\n${context}\n\nQuestion: ${trimmed}`,
    maxTokens: 600,
  });
}
