import { Router, type IRouter } from "express";
import { GetHomeFeedResponse } from "@workspace/api-zod";
import {
  listArticleSummaries,
  listReviewSummaries,
  listVideoSummaries,
  listCategoriesWithCounts,
} from "../lib/sanity";

const router: IRouter = Router();

router.get("/home/feed", async (_req, res): Promise<void> => {
  const [all, featuredReviews, videos, categories] = await Promise.all([
    listArticleSummaries({ limit: 100 }),
    listReviewSummaries(6, false),
    listVideoSummaries(6),
    listCategoriesWithCounts(),
  ]);

  const placeholderHero = {
    id: 0,
    slug: "welcome",
    title: "Welcome to PrimeAxis Tech",
    excerpt:
      "We're just getting started. Add your first article in the Studio to see it here.",
    heroImageUrl: "",
    category: {
      slug: "uncategorized",
      name: "Uncategorized",
      accentColor: "#888888",
    },
    author: {
      slug: "staff",
      name: "PrimeAxis Staff",
      avatarUrl: "",
      role: "Staff",
    },
    publishedAt: new Date().toISOString(),
    readingMinutes: 1,
    tags: [],
    isBreaking: false,
    isFeature: false,
    viewCount: 0,
    commentCount: 0,
  };
  const featured = all.find((a) => a.isFeature) ?? all[0] ?? placeholderHero;
  const heroSlug = featured.slug;
  const spotlight = all.filter((a) => a.slug !== heroSlug).slice(0, 4);
  const trending = all.slice(0, 6);
  const latest = all.slice(0, 8);
  const aiAndFuture = all
    .filter((a) =>
      [
        "ai",
        "artificial-intelligence",
        "future-tech",
        "robotics",
        "vr-ar",
      ].includes(a.category.slug),
    )
    .slice(0, 6);
  const gamingAndEntertainment = all
    .filter((a) =>
      ["gaming", "entertainment", "streaming"].includes(a.category.slug),
    )
    .slice(0, 4);
  const investigations = all
    .filter((a) => a.tags.includes("investigation") || a.readingMinutes >= 8)
    .slice(0, 3);
  const buyingGuides = all
    .filter((a) => a.tags.includes("buying-guide"))
    .slice(0, 4);
  const startups = all
    .filter((a) => a.category.slug === "startups")
    .slice(0, 4);
  const mostDiscussed = all.slice(0, 5);

  res.json(
    GetHomeFeedResponse.parse({
      hero: featured,
      spotlight,
      trending,
      latest,
      featuredReviews,
      aiAndFuture,
      gamingAndEntertainment,
      videos,
      investigations,
      buyingGuides,
      startups,
      mostDiscussed,
      categories,
    }),
  );
});

export default router;
