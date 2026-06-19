import { createClient } from "@sanity/client";
import { VIDEO_URL_BY_SLUG } from "./video-url-map.js";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  throw new Error("Missing SANITY_PROJECT_ID / SANITY_API_TOKEN env");
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

type SanityVideo = {
  _id: string;
  slug: string;
  title: string;
  videoUrl?: string;
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const rows = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && defined(slug.current)]{
      _id,
      "slug": slug.current,
      title,
      videoUrl
    }`,
  );

  if (!rows.length) {
    console.log("No video documents found in Sanity.");
    return;
  }

  let patched = 0;
  let skipped = 0;

  for (const video of rows) {
    const url = VIDEO_URL_BY_SLUG[video.slug];
    if (!url) {
      console.log(`- skip ${video.slug}: no mapping in video-url-map.ts`);
      skipped++;
      continue;
    }
    if (video.videoUrl === url) {
      console.log(`- ok  ${video.slug}: already set`);
      continue;
    }
    if (dryRun) {
      console.log(`- dry ${video.slug}: would set ${url}`);
      patched++;
      continue;
    }
    try {
      await sanity.patch(video._id).set({ videoUrl: url }).commit();
      console.log(`- set ${video.slug}: ${url}`);
      patched++;
    } catch (err) {
      const msg = (err as Error).message;
      if (/insufficient permissions|permission "update"/i.test(msg)) {
        console.error(
          "\nSanity token lacks write permission. Videos still play via API fallback.\n" +
            "Upgrade token: https://www.sanity.io/manage/project/jyppkgsk/api#tokens\n",
        );
        process.exit(0);
      }
      throw err;
    }
  }

  console.log(
    `\nDone. ${patched} updated${dryRun ? " (dry run)" : ""}, ${skipped} skipped.`,
  );
}

main().catch((err) => {
  console.error((err as Error).message);
  process.exit(1);
});

export {};
