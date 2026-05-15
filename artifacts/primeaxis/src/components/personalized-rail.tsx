import { useMemo } from "react";
import {
  useGetHomeFeed,
  useGetCategoryBySlug,
  getGetCategoryBySlugQueryKey,
} from "@workspace/api-client-react";
import {
  useReadingHistory,
  useTopCategories,
} from "@/hooks/use-reading-history";
import { ArticleCard, SectionHeader } from "./cards";
import { Link } from "wouter";
import { Sparkles, History } from "lucide-react";
import { withBase } from "@/lib/format";
import { motion } from "framer-motion";

export function PersonalizedRail() {
  const history = useReadingHistory();
  const top = useTopCategories(1);
  const topSlug = top[0];
  const home = useGetHomeFeed();

  const cat = useGetCategoryBySlug(topSlug ?? "", {
    query: {
      enabled: !!topSlug,
      queryKey: getGetCategoryBySlugQueryKey(topSlug ?? ""),
    },
  });

  const recommendations = useMemo(() => {
    const seen = new Set(history.map((h) => h.slug));
    if (cat.data) {
      return cat.data.articles.filter((a) => !seen.has(a.slug)).slice(0, 4);
    }
    if (home.data) {
      return [...home.data.latest, ...home.data.spotlight]
        .filter((a) => !seen.has(a.slug))
        .slice(0, 4);
    }
    return [];
  }, [history, cat.data, home.data]);

  if (history.length === 0) return null;

  return (
    <section className="container-page py-16">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            <Sparkles className="mr-1.5 inline h-3 w-3" />
            For you
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
            Built around{" "}
            <span className="gradient-text">how you read.</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            PrimeAxis Intelligence learns from your reading and surfaces the
            stories most relevant to you. Nothing leaves your device.
          </p>

          <div className="mt-6">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <History className="h-3 w-3" /> Recently read
            </div>
            <div className="space-y-3">
              {history.slice(0, 4).map((h) => (
                <Link
                  key={h.slug}
                  href={`/article/${h.slug}`}
                  className="group flex items-center gap-3"
                >
                  <img
                    src={withBase(h.heroImageUrl)}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {h.categoryName}
                    </div>
                    <div className="line-clamp-2 text-xs font-medium group-hover:text-primary">
                      {h.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
          {recommendations.length > 0 ? (
            <>
              <SectionHeader
                title="Recommended next."
                description="Drawn from the sections you read most."
              />
              <div className="grid gap-6 sm:grid-cols-2">
                {recommendations.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <ArticleCard article={a} variant="compact" index={i} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
