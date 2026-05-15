import { useRoute, Link } from "wouter";
import {
  useGetCategoryBySlug,
  getGetCategoryBySlugQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft } from "lucide-react";
import { ArticleCard, ArticleSkeleton } from "@/components/cards";
import { motion } from "framer-motion";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug ?? "";
  const { data, isLoading, isError } = useGetCategoryBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetCategoryBySlugQueryKey(slug) },
  });

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

  const { category, articles } = data;
  const [hero, ...rest] = articles;

  return (
    <>
      <section
        className="relative overflow-hidden border-b hairline"
        style={{
          background: `radial-gradient(50rem 30rem at 20% 0%, ${category.accentColor}33, transparent 60%)`,
        }}
      >
        <div className="container-page py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Section
            </div>
            <h1 className="mt-3 flex items-center gap-4 font-display text-5xl font-bold tracking-tight md:text-7xl">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: category.accentColor }}
              />
              {category.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {category.description}
            </p>
            <div className="mt-4 font-mono text-xs text-muted-foreground">
              {category.articleCount} stories in this section
            </div>
          </motion.div>
        </div>
      </section>

      {articles.length === 0 ? (
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
