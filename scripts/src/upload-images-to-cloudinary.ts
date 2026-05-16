import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@sanity/client";
import { readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";

const SEED_DIR = "/home/runner/workspace/artifacts/primeaxis/public/seed";
const FOLDER = "primeaxis/seed";

if (!process.env.CLOUDINARY_URL) {
  console.error("Missing CLOUDINARY_URL"); process.exit(1);
}
const projectId = process.env.SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !token) {
  console.error("Missing SANITY_PROJECT_ID or SANITY_API_TOKEN"); process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function uploadAll(): Promise<Record<string, string>> {
  const files = readdirSync(SEED_DIR).filter((f) =>
    /\.(png|jpg|jpeg|webp)$/i.test(f),
  );
  const map: Record<string, string> = {};
  for (const f of files) {
    const publicId = basename(f, extname(f));
    const path = join(SEED_DIR, f);
    process.stdout.write(`  uploading ${f} ... `);
    const r = await cloudinary.uploader.upload(path, {
      folder: FOLDER,
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });
    map[`/seed/${f}`] = r.secure_url;
    console.log(r.secure_url);
  }
  return map;
}

async function patchSanity(urlMap: Record<string, string>) {
  const subst = (u?: string) => (u && urlMap[u]) || u || undefined;

  console.log("\nPatching articles...");
  const arts = await sanity.fetch<{ _id: string; heroImageUrl?: string }[]>(
    `*[_type == "article" && defined(heroImageUrl)]{_id, heroImageUrl}`,
  );
  let tx = sanity.transaction();
  for (const a of arts) {
    const next = subst(a.heroImageUrl);
    if (next && next !== a.heroImageUrl) {
      tx = tx.patch(a._id, { set: { heroImageUrl: next } });
    }
  }

  console.log("Patching authors...");
  const authors = await sanity.fetch<{ _id: string; avatarUrl?: string }[]>(
    `*[_type == "author" && defined(avatarUrl)]{_id, avatarUrl}`,
  );
  for (const a of authors) {
    const next = subst(a.avatarUrl);
    if (next && next !== a.avatarUrl) {
      tx = tx.patch(a._id, { set: { avatarUrl: next } });
    }
  }

  console.log("Patching reviews...");
  const reviews = await sanity.fetch<
    { _id: string; heroImageUrl?: string; galleryImageUrls?: string[] }[]
  >(
    `*[_type == "review"]{_id, heroImageUrl, galleryImageUrls}`,
  );
  for (const r of reviews) {
    const set: Record<string, unknown> = {};
    const nh = subst(r.heroImageUrl);
    if (nh && nh !== r.heroImageUrl) set.heroImageUrl = nh;
    if (r.galleryImageUrls?.length) {
      const ng = r.galleryImageUrls.map((u) => subst(u) ?? u);
      if (JSON.stringify(ng) !== JSON.stringify(r.galleryImageUrls)) {
        set.galleryImageUrls = ng;
      }
    }
    if (Object.keys(set).length) tx = tx.patch(r._id, { set });
  }

  console.log("Patching videos...");
  const vids = await sanity.fetch<{ _id: string; thumbnailUrl?: string }[]>(
    `*[_type == "video" && defined(thumbnailUrl)]{_id, thumbnailUrl}`,
  );
  for (const v of vids) {
    const next = subst(v.thumbnailUrl);
    if (next && next !== v.thumbnailUrl) {
      tx = tx.patch(v._id, { set: { thumbnailUrl: next } });
    }
  }

  const result = await tx.commit();
  console.log(`\n✓ Patched ${result.results.length} Sanity documents.`);
}

async function run() {
  console.log("Uploading seed images to Cloudinary...");
  const map = await uploadAll();
  console.log(`\nUploaded ${Object.keys(map).length} images.`);
  await patchSanity(map);
}

run().catch((e) => {
  console.error("Upload failed:", e);
  process.exit(1);
});
