import { createClient } from "@sanity/client";

const c = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const all = await c.fetch(`*[_type == "article"]{_id, "slug": slug.current}`);
console.log("ALL articles (no perspective):", all.length);
all.forEach(a => console.log(" ", a._id));

const pub = await c.fetch(`*[_type == "article" && !(_id in path("drafts.**"))]{_id}`);
console.log("PUBLISHED articles:", pub.length);

const drafts = await c.fetch(`*[_type == "article" && _id in path("drafts.**")]{_id}`);
console.log("DRAFT articles:", drafts.length);
