/**
 * Fallback YouTube URLs for seeded Sanity videos when videoUrl is not set in CMS.
 * Keep in sync with scripts/src/video-url-map.ts
 */
export const VIDEO_URL_BY_SLUG: Record<string, string> = {
  "the-machine-that-thinks-explained":
    "https://www.youtube.com/watch?v=aircAruvnKk",
  "axis-pro-16-review": "https://www.youtube.com/watch?v=2GgUsWjQe5M",
  "the-flagship-shootout-video":
    "https://www.youtube.com/watch?v=WaNoqB4xhF0",
  "the-ev-pricing-war-video":
    "https://www.youtube.com/watch?v=6RHTGdKPMjE",
  "studio-reference-pro-video":
    "https://www.youtube.com/watch?v=OpW35_gwF2c",
  "the-quantum-explainer":
    "https://www.youtube.com/watch?v=JhHMojcA4mI",
};

export function fallbackVideoUrl(slug: string): string | null {
  return VIDEO_URL_BY_SLUG[slug] ?? null;
}
