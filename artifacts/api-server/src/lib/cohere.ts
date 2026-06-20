import { logger } from "./logger";

const COHERE_TIMEOUT_MS = 25_000;

const cohereApiKey =
  process.env.COHERE_API_KEY && !/^CHANGE_ME/i.test(process.env.COHERE_API_KEY)
    ? process.env.COHERE_API_KEY
    : undefined;

const cohereBaseUrl = (
  process.env.COHERE_BASE_URL ?? "https://api.cohere.com"
).replace(/\/$/, "");

const cohereChatModel = process.env.COHERE_CHAT_MODEL ?? "command-r-plus";
const cohereEmbedModel = process.env.COHERE_EMBED_MODEL ?? "embed-english-v3.0";
const cohereRerankModel =
  process.env.COHERE_RERANK_MODEL ?? "rerank-english-v3.0";

type CohereErrorBody = {
  message?: string;
};

type CohereRerankResponse = {
  results?: { index: number; relevance_score: number }[];
  message?: string;
};

type CohereEmbedResponse = {
  embeddings?: number[][];
  message?: string;
};

type CohereChatContentPart = {
  type?: string;
  text?: string;
};

type CohereChatMessage = {
  role?: string;
  content?: string | CohereChatContentPart[];
};

type CohereChatResponse = {
  message?: CohereChatMessage;
  text?: string;
};

export function isCohereConfigured(): boolean {
  return Boolean(cohereApiKey);
}

async function cohereFetch<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  if (!cohereApiKey) {
    throw new Error("Cohere is not configured");
  }

  const response = await fetch(`${cohereBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${cohereApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "primeaxis-api/1.0",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(COHERE_TIMEOUT_MS),
  });

  const payload = (await response.json().catch(() => ({}))) as T &
    CohereErrorBody;
  if (!response.ok) {
    throw new Error(
      payload.message ?? `Cohere request failed with ${response.status}`,
    );
  }
  return payload;
}

export async function cohereRerank(
  query: string,
  documents: string[],
  topN: number,
): Promise<number[]> {
  if (documents.length === 0) return [];

  const payload = await cohereFetch<CohereRerankResponse>("/v1/rerank", {
    query,
    documents,
    model: cohereRerankModel,
    top_n: Math.min(topN, documents.length),
  });

  return (payload.results ?? [])
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .map((r) => r.index);
}

export async function cohereEmbed(
  texts: string[],
  inputType: "search_query" | "search_document" | "classification",
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const payload = await cohereFetch<CohereEmbedResponse>("/v1/embed", {
    texts,
    model: cohereEmbedModel,
    input_type: inputType,
    truncate: "END",
  });

  return payload.embeddings ?? [];
}

function extractChatText(message?: CohereChatMessage): string {
  if (!message?.content) return "";
  if (typeof message.content === "string") return message.content.trim();
  return message.content
    .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
    .join("")
    .trim();
}

export async function cohereChat(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const payload = await cohereFetch<CohereChatResponse>("/v2/chat", {
    model: cohereChatModel,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    max_tokens: opts.maxTokens ?? 600,
    temperature: 0.3,
  });

  const text = extractChatText(payload.message) || payload.text?.trim() || "";
  if (!text) {
    logger.warn("Cohere chat returned empty response");
    throw new Error("Cohere chat returned an empty response");
  }
  return text;
}
