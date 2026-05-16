/**
 * CMS adapter switch — selects Sanity or WordPress at runtime
 * based on the CMS_SOURCE env var. Routes import from this file
 * so we can swap back-ends without touching any route code.
 *
 *   CMS_SOURCE=sanity     (default — uses @sanity/client)
 *   CMS_SOURCE=wordpress  (uses WP REST API + Application Password)
 */
const SOURCE = (process.env.CMS_SOURCE || "sanity").toLowerCase();

const impl =
  SOURCE === "wordpress"
    ? await import("./wordpress")
    : await import("./sanity");

export const {
  listArticleSummaries,
  searchArticleSummaries,
  getArticleBySlug,
  listCategoriesWithCounts,
  getCategoryBySlug,
  listAuthorsWithCounts,
  getAuthorBySlug,
  listReviewSummaries,
  getReviewBySlug,
  listVideoSummaries,
  stableNumericId,
} = impl;

export type {
  ArticleSummary,
  ArticleDetail,
  ArticleBlock,
  CategoryWithCount,
  AuthorWithCount,
  ReviewSummary,
  VideoSummary,
  Subcategory,
} from "./sanity-types";
