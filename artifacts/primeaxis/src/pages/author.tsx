import { useRoute, Link } from "wouter";
import {
  useGetAuthorBySlug,
  getGetAuthorBySlugQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/cards";
import { motion } from "framer-motion";
import { EditorialImage } from "@/components/editorial-image";

export default function AuthorPage() {
  const [, params] = useRoute("/author/:slug");
  const slug = params?.slug ?? "";
  const { data, isLoading, isError } = useGetAuthorBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetAuthorBySlugQueryKey(slug) },
  });

  if (isLoading) {
    return (
      <div className="container-page py-16">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="container-page py-24 text-center text-muted-foreground">
        Author not found.
        <div className="mt-4">
          <Link href="/" className="text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    );
  }

  const { author, articles } = data;
  return (
    <>
      <section className="relative overflow-hidden border-b hairline">
        <div className="dark:glow-aurora glow-aurora-light pointer-events-none absolute inset-0 -z-10" />
        <div className="container-page py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start gap-8 md:flex-row md:items-center"
          >
            <EditorialImage
              src={author.avatarUrl}
              alt={author.name}
              width={400}
              className="h-32 w-32 rounded-full border hairline object-cover md:h-40 md:w-40"
            />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                {author.role}
              </div>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-6xl">
                {author.name}
              </h1>
              {author.bio && (
                <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                  {author.bio}
                </p>
              )}
              <div className="mt-3 font-mono text-xs text-muted-foreground">
                {author.articleCount} stories published
                {author.twitter ? ` · @${author.twitter}` : ""}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-16">
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No published stories yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
