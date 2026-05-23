/**
 * CMS layer — Sanity is the content source for articles, categories, and authors.
 */
export {
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
} from "./sanity";

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
