import { useRoute, Link } from "wouter";
import {
  useGetArticleBySlug,
  useGetRelatedArticles,
  useListVideos,
  getGetArticleBySlugQueryKey,
  getGetRelatedArticlesQueryKey,
} from "@workspace/api-client-react";
import { VideoLightbox } from "@/components/video-lightbox";
import { formatDuration } from "@/lib/format";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Eye,
  MessageCircle,
  Play,
  Share2,
  Sparkles,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import {
  ArticleCard,
  CategoryChip,
  SectionHeader,
} from "@/components/cards";
import { formatDate, formatNumber, timeAgo, withBase } from "@/lib/format";
import { toast } from "sonner";
import { ListenButton } from "@/components/listen-button";
import { AiAsk } from "@/components/ai-ask";
import { recordRead } from "@/lib/personalization";

export default function ArticlePage() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug ?? "";
  const { data: article, isLoading, isError } = useGetArticleBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetArticleBySlugQueryKey(slug) },
  });
  const { data: related } = useGetRelatedArticles(slug, {
    query: { enabled: !!slug, queryKey: getGetRelatedArticlesQueryKey(slug) },
  });
  const { data: allVideos } = useListVideos({ limit: 12 });
  const [progress, setProgress] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setActiveVideo(null);
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    recordRead({
      slug: article.slug,
      title: article.title,
      categorySlug: article.category.slug,
      categoryName: article.category.name,
      heroImageUrl: article.heroImageUrl,
    });
  }, [article]);

  if (isLoading) {
    return (
      <div className="container-page space-y-6 py-16">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
        <div className="aspect-[21/9] animate-pulse rounded-3xl bg-muted" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-muted-foreground">Article not found.</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
    );
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <article className="relative">
      <div
        className="fixed left-0 right-0 top-0 z-50 h-0.5 origin-left bg-primary"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden
      />
      <div className="container-page pt-12">
        <Link
          href={`/category/${article.category.slug}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {article.category.name}
        </Link>
      </div>

      <header className="container-page max-w-4xl pt-8">
        <div className="flex flex-wrap items-center gap-2">
          {article.isBreaking && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Breaking
            </span>
          )}
          <CategoryChip category={article.category} />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-4 font-display text-4xl font-bold leading-[1.05] text-balance md:text-6xl"
        >
          {article.title}
        </motion.h1>
        <p className="mt-5 text-pretty text-lg text-muted-foreground md:text-xl">
          {article.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5 border-t hairline pt-6">
          <Link
            href={`/author/${article.author.slug}`}
            className="flex items-center gap-3"
          >
            <img
              src={withBase(article.author.avatarUrl)}
              alt={article.author.name}
              className="h-12 w-12 rounded-full border hairline object-cover"
            />
            <div className="text-sm">
              <div className="font-semibold">{article.author.name}</div>
              <div className="text-xs text-muted-foreground">
                {article.author.role}
              </div>
            </div>
          </Link>
          <div className="text-sm text-muted-foreground">
            <div>Published {formatDate(article.publishedAt)}</div>
            {article.updatedAt !== article.publishedAt && (
              <div className="text-xs">
                Updated {timeAgo(article.updatedAt)}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(article.viewCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatNumber(article.commentCount)}
            </span>
          </div>
        </div>
      </header>

      <div className="container-page mt-10 max-w-6xl">
        <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border hairline">
          <img
            src={withBase(article.heroImageUrl)}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="container-page mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {/* AI summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border hairline bg-card/60 p-6"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Summary
            </div>
            <p className="text-pretty text-foreground/85">
              {article.aiSummary}
            </p>
          </motion.div>

          {article.keyTakeaways.length > 0 && (
            <div className="mt-6 rounded-2xl border hairline bg-card/40 p-6">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Key Takeaways
              </div>
              <ul className="space-y-3">
                {article.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-foreground/85">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Ask */}
          <div className="mt-6">
            <AiAsk
              title={article.title}
              body={article.body}
              aiSummary={article.aiSummary}
              keyTakeaways={article.keyTakeaways}
            />
          </div>

          {/* BODY */}
          <div className="editorial-prose mt-12 max-w-2xl">
            {article.body.map((b, i) => {
              if (b.type === "heading") {
                return (
                  <h2
                    key={i}
                    className="mt-12 mb-4 font-display text-2xl font-bold leading-tight md:text-3xl"
                  >
                    {b.content}
                  </h2>
                );
              }
              if (b.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="my-10 border-l-2 border-primary pl-6 font-serif text-2xl italic leading-snug text-foreground/90 md:text-3xl"
                  >
                    "{b.content}"
                  </blockquote>
                );
              }
              if (b.type === "image") {
                return (
                  <figure key={i} className="my-10">
                    <img
                      src={withBase(b.content)}
                      alt={b.caption ?? ""}
                      className="w-full rounded-2xl border hairline"
                    />
                    {b.caption && (
                      <figcaption className="mt-3 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {b.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              if (b.type === "list") {
                return (
                  <ul key={i} className="my-6 space-y-2">
                    {(b.items ?? []).map((it, j) => (
                      <li key={j} className="flex gap-3 text-foreground/85">
                        <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{b.content}</p>;
            })}
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t hairline pt-6">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Tagged
              </span>
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border hairline bg-card/40 px-2.5 py-0.5 text-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — share + author */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ListenButton
            title={article.title}
            blocks={article.body}
            audioUrl={article.podcastAudioUrl}
            audioDurationSeconds={article.podcastDurationSeconds}
          />
          <div className="rounded-2xl border hairline bg-card/40 p-5">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Share
            </div>
            <div className="mt-3 flex gap-2">
              <button
                aria-label="Share to X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card hover:bg-accent"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      article.title,
                    )}&url=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                }
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                aria-label="Share to LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card hover:bg-accent"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      window.location.href,
                    )}`,
                    "_blank",
                  )
                }
              >
                <Linkedin className="h-4 w-4" />
              </button>
              <button
                aria-label="Copy link"
                onClick={copyLink}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card hover:bg-accent"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                aria-label="Bookmark"
                onClick={() => toast.success("Saved to your reading list")}
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card hover:bg-accent"
              >
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Link
            href={`/author/${article.author.slug}`}
            className="block rounded-2xl border hairline bg-card/40 p-5 transition hover:bg-card"
          >
            <img
              src={withBase(article.author.avatarUrl)}
              alt={article.author.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="mt-3 font-display text-lg font-bold">
              {article.author.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {article.author.role}
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
              <Share2 className="h-3 w-3" />
              More from this author
            </div>
          </Link>
        </aside>
      </div>

      {/* RELATED VIDEO */}
      {(() => {
        const match = (allVideos ?? []).find(
          (v) => v.category.slug === article.category.slug,
        );
        if (!match) return null;
        return (
          <section className="container-page max-w-6xl pt-16">
            <SectionHeader
              eyebrow="Watch"
              title="On video"
              description={`The ${article.category.name} desk's latest report.`}
            />
            <button
              type="button"
              onClick={() => setActiveVideo(match.slug)}
              className="group relative block w-full overflow-hidden rounded-2xl border hairline text-left"
            >
              <div className="relative aspect-[21/9]">
                <img
                  src={withBase(match.thumbnailUrl)}
                  alt={match.title}
                  className="editorial-img h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute right-4 top-4 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-white backdrop-blur">
                  {formatDuration(match.durationSeconds)}
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/30 transition group-hover:scale-110 group-hover:bg-white/20">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                  <CategoryChip
                    category={match.category}
                    asLink={false}
                    className="bg-white/10 text-white border-white/20"
                  />
                  <h3 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-balance md:text-3xl">
                    {match.title}
                  </h3>
                </div>
              </div>
            </button>
          </section>
        );
      })()}

      <VideoLightbox
        open={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        title={
          (allVideos ?? []).find((v) => v.slug === activeVideo)?.title ?? ""
        }
        thumbnailUrl={
          (allVideos ?? []).find((v) => v.slug === activeVideo)
            ?.thumbnailUrl ?? ""
        }
      />

      {/* RELATED */}
      {related && related.length > 0 && (
        <section className="container-page py-20">
          <SectionHeader
            eyebrow="Keep reading"
            title="Related stories."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {related.slice(0, 3).map((a, i) => (
              <ArticleCard
                key={a.id}
                article={a}
                variant="compact"
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
