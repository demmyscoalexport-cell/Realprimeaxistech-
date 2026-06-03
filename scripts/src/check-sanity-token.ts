import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID || "jyppkgsk";
const dataset = process.env.SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!token || /^CHANGE_ME/i.test(token)) {
  throw new Error("Missing SANITY_API_TOKEN env");
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function main() {
  const articleCount = await sanity.fetch<number>(
    `count(*[_type == "article"])`,
  );
  console.log(`Sanity read check passed. Articles visible: ${articleCount}`);

  const id = "agent-smoke-test-sanity-token";
  try {
    await sanity.createOrReplace({
      _id: id,
      _type: "agentSmokeTest",
      createdAt: new Date().toISOString(),
    });
    const doc = await sanity.getDocument(id);
    if (!doc) throw new Error("Created document could not be read back");
    await sanity.delete(id);
    console.log("Sanity write check passed.");
  } catch (error) {
    throw new Error(
      `Sanity write check failed: ${(error as Error).message}`,
    );
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});

export {};
