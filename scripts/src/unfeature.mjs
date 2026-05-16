import { createClient } from "@sanity/client";
const c = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01", token: process.env.SANITY_API_TOKEN, useCdn: false,
});
// Unfeature any article that lacks a Cloudinary heroImageUrl
const arts = await c.fetch(`*[_type=="article" && isFeature == true]{_id, "slug": slug.current, heroImageUrl}`);
console.log("featured articles:", arts.length);
let tx = c.transaction();
for (const a of arts) {
  if (!a.heroImageUrl || !a.heroImageUrl.includes("cloudinary")) {
    console.log("  unfeaturing:", a.slug);
    tx = tx.patch(a._id, { set: { isFeature: false } });
  }
}
await tx.commit();
console.log("done");
