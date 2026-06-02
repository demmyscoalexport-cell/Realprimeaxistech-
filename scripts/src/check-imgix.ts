const apiKey = process.env.IMGIX_API_KEY ?? process.env.IMIX_API_KEY;
const baseUrl = (process.env.IMGIX_BASE_URL ?? "https://api.imgix.com").replace(
  /\/$/,
  "",
);

if (!apiKey) {
  throw new Error("Missing IMGIX_API_KEY / IMIX_API_KEY env");
}

type JsonApiListResponse = {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      domains?: string[];
    };
  }>;
  errors?: Array<{
    title?: string;
    detail?: string;
    status?: string;
  }>;
};

async function main() {
  const response = await fetch(`${baseUrl}/api/v1/sources`, {
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
    },
  });

  const body = (await response.json()) as JsonApiListResponse;
  if (!response.ok) {
    const message =
      body.errors
        ?.map((error) => [error.status, error.title, error.detail].filter(Boolean).join(" "))
        .join("; ") || `Imgix request failed with ${response.status}`;
    throw new Error(message);
  }

  const sources = body.data ?? [];
  console.log(`Imgix API key is valid. Sources visible: ${sources.length}`);
  for (const source of sources.slice(0, 10)) {
    const name = source.attributes?.name ?? source.id ?? "unnamed-source";
    const domains = source.attributes?.domains?.join(", ") ?? "no domains";
    console.log(`- ${name}: ${domains}`);
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});
