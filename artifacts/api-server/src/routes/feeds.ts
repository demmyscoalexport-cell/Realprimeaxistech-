import { Router, type IRouter, type Request } from "express";
import {
  listArticleSummaries,
  listCategoriesWithCounts,
  listAuthorsWithCounts,
  listVideoSummaries,
} from "../lib/cms";

const router: IRouter = Router();

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function siteUrl(req: Request): string {
  const configured = process.env.PUBLIC_SITE_URL;
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

type SitemapUrl = {
  loc: string;
  priority: string;
  lastmod?: string;
};

router.get("/rss.xml", async (req, res): Promise<void> => {
  const origin = siteUrl(req);
  const articles = await listArticleSummaries({ limit: 50 });
  const items = articles
    .map((article) => {
      const url = `${origin}/article/${encodeURIComponent(article.slug)}`;
      return `
    <item>
      <title>${xmlEscape(article.title)}</title>
      <link>${xmlEscape(url)}</link>
      <guid>${xmlEscape(url)}</guid>
      <description>${xmlEscape(article.excerpt)}</description>
      <pubDate>${rssDate(article.publishedAt)}</pubDate>
      <category>${xmlEscape(article.category.name)}</category>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PrimeAxis Tech</title>
    <link>${xmlEscape(origin)}</link>
    <description>The latest reporting from PrimeAxis Tech.</description>
    <language>en-us</language>
    <lastBuildDate>${rssDate(new Date().toISOString())}</lastBuildDate>
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

router.get("/sitemap.xml", async (req, res): Promise<void> => {
  const origin = siteUrl(req);
  const [articles, categories, authors, videos] = await Promise.all([
    listArticleSummaries({ limit: 500 }),
    listCategoriesWithCounts(),
    listAuthorsWithCounts(),
    listVideoSummaries(200),
  ]);

  const urls: SitemapUrl[] = [
    { loc: `${origin}/`, priority: "1.0" },
    { loc: `${origin}/reviews`, priority: "0.8" },
    { loc: `${origin}/videos`, priority: "0.8" },
    { loc: `${origin}/newsletters`, priority: "0.7" },
    { loc: `${origin}/about`, priority: "0.5" },
    { loc: `${origin}/contact`, priority: "0.5" },
    { loc: `${origin}/privacy`, priority: "0.3" },
    { loc: `${origin}/terms`, priority: "0.3" },
    ...categories.map((category) => ({
      loc: `${origin}/category/${encodeURIComponent(category.slug)}`,
      priority: "0.8",
    })),
    ...authors.map((author) => ({
      loc: `${origin}/author/${encodeURIComponent(author.slug)}`,
      priority: "0.5",
    })),
    ...articles.map((article) => ({
      loc: `${origin}/article/${encodeURIComponent(article.slug)}`,
      lastmod: article.publishedAt,
      priority: "0.9",
    })),
    ...videos.map((video) => ({
      loc: `${origin}/videos?video=${encodeURIComponent(video.slug)}`,
      lastmod: video.publishedAt,
      priority: "0.6",
    })),
  ];

  const body = urls
    .map(
      (url) => `
  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${xmlEscape(url.lastmod)}</lastmod>` : ""}
    <changefreq>daily</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  res
    .status(200)
    .type("application/xml; charset=utf-8")
    .set("Cache-Control", "public, max-age=300")
    .send(xml);
});

export default router;
