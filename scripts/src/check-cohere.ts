const apiKey = process.env.COHERE_API_KEY;
const baseUrl = (process.env.COHERE_BASE_URL ?? "https://api.cohere.com").replace(
  /\/$/,
  "",
);

if (!apiKey) {
  throw new Error("Missing COHERE_API_KEY env");
}

type CohereModel = {
  name?: string;
  endpoints?: string[];
  finetuned?: boolean;
  context_length?: number;
  tokenizer_url?: string;
};

type CohereListModelsResponse = {
  models?: CohereModel[];
  message?: string;
};

async function main() {
  const response = await fetch(`${baseUrl}/v1/models`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const body = (await response.json()) as CohereListModelsResponse;
  if (!response.ok) {
    throw new Error(
      body.message ?? `Cohere request failed with ${response.status}`,
    );
  }

  const models = body.models ?? [];
  console.log(`Cohere API key is valid. Models visible: ${models.length}`);
  for (const model of models.slice(0, 12)) {
    const endpoints = model.endpoints?.join(", ") ?? "unknown endpoints";
    console.log(`- ${model.name ?? "unnamed-model"}: ${endpoints}`);
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});

export {};
