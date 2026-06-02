export function stableNumericId(s: string | undefined | null): number {
  if (!s) return 0;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

export type Subcategory = { name: string; slug: string; description: string };

export type CategoryWithCount = {
  id: number;
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  articleCount: number;
  subcategories: Subcategory[];
};

export type AuthorWithCount = {
  id: number;
  slug: string;
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  twitter: string;
  articleCount: number;
};

export type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string;
  category: { slug: string; name: string; accentColor: string };
  subcategorySlug: string | null;
  author: { slug: string; name: string; avatarUrl: string; role: string };
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  podcastAudioUrl: string | null;
  podcastDurationSeconds: number | null;
  podcastAudioBytes: number | null;
  podcastGeneratedAt: string | null;
  podcastPlatforms: PodcastPlatformLink[];
  isBreaking: boolean;
  isFeature: boolean;
  viewCount: number;
  commentCount: number;
};

export type PodcastPlatformLink = {
  platform: string;
  url: string;
};

export type ArticleBlock = {
  type: "paragraph" | "heading" | "quote" | "image" | "list";
  content: string;
  caption?: string | null;
  items?: string[] | null;
};

export type ArticleDetail = ArticleSummary & {
  subtitle: string;
  updatedAt: string;
  body: ArticleBlock[];
  keyTakeaways: string[];
  aiSummary: string;
  podcastScript: string;
};

export type PodcastEpisode = ArticleSummary & {
  subtitle: string;
  updatedAt: string;
  podcastScript: string;
};

export type ReviewSummary = {
  id: number;
  slug: string;
  productName: string;
  tagline: string;
  heroImageUrl: string;
  score: number;
  verdict: string;
  publishedAt: string;
  priceUsd: number;
  category: { slug: string; name: string; accentColor: string };
};

export type VideoSummary = {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  durationSeconds: number;
  publishedAt: string;
  viewCount: number;
  category: { slug: string; name: string; accentColor: string };
};
