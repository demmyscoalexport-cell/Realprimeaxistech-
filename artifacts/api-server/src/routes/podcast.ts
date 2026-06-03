import { Router, type IRouter, type Request } from "express";
import { listPodcastEpisodes } from "../lib/cms";

const router: IRouter = Router();

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteSiteUrl(req: Request): string {
  const configured = process.env.PODCAST_SITE_URL ?? process.env.PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const proto =
    req.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? req.protocol;
  const host = req.get("x-forwarded-host") ?? req.get("host") ?? "localhost";
  return `${proto}://${host}`.replace(/\/$/, "");
}

function rssDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return new Date(0).toUTCString();
  return date.toUTCString();
}

function itunesDuration(seconds: number | null): string {
  const total = Math.max(0, Math.round(seconds ?? 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

router.get("/podcast/feed.xml", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? "100") || 100, 200);
  const siteUrl = absoluteSiteUrl(req);
  const episodes = await listPodcastEpisodes(limit);
  const feedUrl = `${siteUrl}/api/podcast/feed.xml`;
  const imageUrl =
    process.env.PODCAST_COVER_IMAGE_URL?.trim() || `${siteUrl}/favicon.svg`;
  const ownerName = process.env.PODCAST_OWNER_NAME ?? "PrimeAxis Tech";
  const ownerEmail = process.env.PODCAST_OWNER_EMAIL;

  const items = episodes
    .filter((episode) => episode.podcastAudioUrl)
    .map((episode) => {
      const episodeUrl = `${siteUrl}/article/${encodeURIComponent(episode.slug)}`;
      const description = episode.subtitle || episode.excerpt;
      const guid = episode.podcastAudioUrl ?? episodeUrl;

      return `
    <item>
      <title>${xmlEscape(episode.title)}</title>
      <link>${xmlEscape(episodeUrl)}</link>
      <guid isPermaLink="false">${xmlEscape(guid)}</guid>
      <description>${xmlEscape(description)}</description>
      <content:encoded>${xmlEscape(episode.podcastScript || description)}</content:encoded>
      <pubDate>${rssDate(episode.podcastGeneratedAt ?? episode.publishedAt)}</pubDate>
      <author>${xmlEscape(episode.author.name)}</author>
      <itunes:author>${xmlEscape(episode.author.name)}</itunes:author>
      <itunes:duration>${itunesDuration(episode.podcastDurationSeconds)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <enclosure url="${xmlEscape(episode.podcastAudioUrl ?? "")}" length="${episode.podcastAudioBytes ?? 0}" type="audio/mpeg" />
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>PrimeAxis Tech Podcasts</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>AI-narrated PrimeAxis Tech episodes generated from the newsroom's latest reporting.</description>
    <language>en-us</language>
    <lastBuildDate>${rssDate(new Date().toISOString())}</lastBuildDate>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${xmlEscape(imageUrl)}</url>
      <title>PrimeAxis Tech Podcasts</title>
      <link>${xmlEscape(siteUrl)}</link>
    </image>
    <itunes:author>PrimeAxis Tech</itunes:author>
    <itunes:summary>AI-narrated briefings from PrimeAxis Tech across AI, gadgets, gaming, EVs, robotics, cybersecurity, and the future of computing.</itunes:summary>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <itunes:category text="Technology" />
    <itunes:image href="${xmlEscape(imageUrl)}" />
    ${
      ownerEmail
        ? `<itunes:owner><itunes:name>${xmlEscape(ownerName)}</itunes:name><itunes:email>${xmlEscape(ownerEmail)}</itunes:email></itunes:owner>`
        : ""
    }
${items}
  </channel>
</rss>
`;

  res
    .status(200)
    .type("application/rss+xml; charset=utf-8")
    .set("Cache-Control", "public, max-age=300")
    .send(xml);
});

export default router;
