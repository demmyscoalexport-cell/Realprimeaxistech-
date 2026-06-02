const apiKey = process.env.RESEND_API_KEY;
const baseUrl = (process.env.RESEND_BASE_URL ?? "https://api.resend.com")
  .replace(/\/$/, "");

if (!apiKey) {
  throw new Error("Missing RESEND_API_KEY env");
}

type ResendDomain = {
  id?: string;
  name?: string;
  status?: string;
  region?: string;
  created_at?: string;
};

type ResendListDomainsResponse = {
  data?: ResendDomain[];
  message?: string;
  name?: string;
};

async function main() {
  const response = await fetch(`${baseUrl}/domains`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": "primeaxis-scripts/1.0",
    },
  });

  const body = (await response.json()) as ResendListDomainsResponse;
  if (!response.ok) {
    throw new Error(
      body.message ??
        body.name ??
        `Resend request failed with ${response.status}`,
    );
  }

  const domains = body.data ?? [];
  console.log(`Resend API key is valid. Domains visible: ${domains.length}`);
  for (const domain of domains.slice(0, 10)) {
    const status = domain.status ?? "unknown";
    const region = domain.region ? ` (${domain.region})` : "";
    console.log(`- ${domain.name ?? domain.id ?? "unnamed-domain"}: ${status}${region}`);
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});

export {};
