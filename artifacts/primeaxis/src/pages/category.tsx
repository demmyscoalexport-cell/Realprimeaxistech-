import { useRoute, Link, useSearch } from "wouter";
import {
  useGetCategoryBySlug,
  useListArticles,
  getGetCategoryBySlugQueryKey,
  getListArticlesQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft } from "lucide-react";
import { ArticleCard, ArticleSkeleton } from "@/components/cards";
import { motion } from "framer-motion";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug ?? "";
  const search = useSearch();
  const sub = new URLSearchParams(search).get("sub");

  const { data, isLoading, isError } = useGetCategoryBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetCategoryBySlugQueryKey(slug) },
  });

  const subQuery = useListArticles(
    { category: slug, subcategory: sub ?? undefined, limit: 50 },
    {
      query: {
        enabled: !!slug && !!sub,
        queryKey: getListArticlesQueryKey({
          category: slug,
          subcategory: sub ?? undefined,
          limit: 50,
        }),
      },
    },
  );

  if (isLoading) {
    return (
      <div className="container-page py-16">
        <div className="mb-12 h-32 animate-pulse rounded-2xl bg-muted" />
        <ArticleSkeleton count={6} />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="container-page py-24 text-center text-muted-foreground">
        Category not found.
        <div className="mt-4">
          <Link href="/" className="text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const { category, articles: allArticles } = data;
  const subs = category.subcategories ?? [];
  const activeSub = sub ? subs.find((s) => s.slug === sub) : null;
  const articles = sub
    ? subQuery.data ?? []
    : allArticles;
  const [hero, ...rest] = articles;

  return (
    <>
      <section
        className="relative overflow-hidden border-b hairline"
        style={{
          background: `radial-gradient(50rem 30rem at 20% 0%, ${category.accentColor}33, transparent 60%)`,
        }}
      >
        <div className="container-page py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {activeSub ? (
                <Link
                  href={`/category/${category.slug}`}
                  className="hover:text-foreground"
                >
                  {category.name} /
                </Link>
              ) : (
                "Section"
              )}
            </div>
            <h1 className="mt-3 flex items-center gap-4 font-display text-5xl font-bold tracking-tight md:text-7xl">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: category.accentColor }}
              />
              {activeSub ? activeSub.name : category.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {activeSub ? activeSub.description : category.description}
            </p>
            <div className="mt-4 font-mono text-xs text-muted-foreground">
              {activeSub
                ? `${articles.length} stories in ${activeSub.name}`
                : `${category.articleCount} stories in this section`}
            </div>
          </motion.div>

          {subs.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Link
                href={`/category/${category.slug}`}
                className={`rounded-full border hairline px-3.5 py-1.5 text-xs font-medium transition ${
                  !sub
                    ? "bg-foreground text-background"
                    : "bg-card/40 text-foreground/70 hover:bg-card hover:text-foreground"
                }`}
              >
                All {category.name}
              </Link>
              {subs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/category/${category.slug}?sub=${s.slug}`}
                  className={`rounded-full border hairline px-3.5 py-1.5 text-xs font-medium transition ${
                    sub === s.slug
                      ? "bg-foreground text-background"
                      : "bg-card/40 text-foreground/70 hover:bg-card hover:text-foreground"
                  }`}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {sub && subQuery.isLoading ? (
        <section className="container-page py-16">
          <ArticleSkeleton count={6} />
        </section>
      ) : articles.length === 0 ? (
        <div className="container-page py-24 text-center text-muted-foreground">
          No stories in this section yet.
        </div>
      ) : (
        <section className="container-page py-16">
          {hero && (
            <div className="mb-12">
              <ArticleCard article={hero} variant="wide" />
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
