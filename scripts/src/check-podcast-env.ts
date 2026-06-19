const required = [
  "SANITY_PROJECT_ID",
  "SANITY_API_TOKEN",
  "ELEVENLABS_API_KEY",
  "CLOUDINARY_URL",
] as const;

const podcastVars = [
  "PODCAST_SITE_URL",
  "PODCAST_FEED_URL",
  "PODCAST_COVER_IMAGE_URL",
  "PODCAST_OWNER_NAME",
  "PODCAST_OWNER_EMAIL",
] as const;

function isSet(name: string): boolean {
  const v = process.env[name];
  return Boolean(v && !/^CHANGE_ME/i.test(v));
}

async function main() {
  let fail = 0;

  console.log("=== Podcast pipeline env ===");
  for (const name of required) {
    if (isSet(name)) {
      console.log(`  OK  ${name}`);
    } else {
      console.log(`  FAIL ${name}`);
      fail++;
    }
  }

  console.log("\n=== PODCAST_* (for RSS / directory submit) ===");
  for (const name of podcastVars) {
    if (isSet(name)) {
      console.log(`  OK  ${name}=${process.env[name]}`);
    } else {
      console.log(`  WARN ${name} not set (needed before Apple/Spotify submit)`);
    }
  }

  const feedUrl =
    process.env.PODCAST_FEED_URL ?? "https://primeaxishq.com/api/podcast/feed.xml";
  console.log(`\nRSS feed URL: ${feedUrl}`);
  console.log("See docs/PODCAST_SUBMISSION.md for generate + submit steps.");

  if (fail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error((err as Error).message);
  process.exit(1);
});

export {};
