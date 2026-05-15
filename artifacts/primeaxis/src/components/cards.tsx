import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, MessageCircle, Eye, ArrowUpRight, Play } from "lucide-react";
import {
  formatNumber,
  formatPrice,
  timeAgo,
  formatDuration,
  withBase,
} from "@/lib/format";

type ArticleLite = {
  slug: string;
  title: string;
  excerpt?: string;
  heroImageUrl: string;
  category: { slug: string; name: string; accentColor: string };
  author: { slug: string; name: string; avatarUrl: string; role?: string };
  publishedAt: string;
  readingMinutes: number;
  viewCount?: number;
  commentCount?: number;
  isBreaking?: boolean;
};

export function CategoryChip({
  category,
  className = "",
  asLink = true,
}: {
  category: { slug: string; name: string; accentColor: string };
  className?: string;
  asLink?: boolean;
}) {
  const cls = `inline-flex items-center gap-1.5 rounded-full border hairline bg-card/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur transition hover:bg-card hover:text-foreground ${className}`;
  const inner = (
    <>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: category.accentColor }}
      />
      {category.name}
    </>
  );
  if (!asLink) return <span className={cls}>{inner}</span>;
  return (
    <Link href={`/category/${category.slug}`} className={cls}>
      {inner}
    </Link>
  );
}

export function MetaLine({
  article,
  className = "",
}: {
  article: ArticleLite;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 text-xs text-muted-foreground ${className}`}
    >
      <span>{timeAgo(article.publishedAt)}</span>
      <span className="opacity-40">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {article.readingMinutes} min
      </span>
      {article.viewCount !== undefined && (
        <>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatNumber(article.viewCount)}
          </span>
        </>
      )}
    </div>
  );
}

export function ArticleHeroCard({ article }: { article: ArticleLite }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 0.65, 0.32, 1] }}
      className="group relative overflow-hidden rounded-3xl border hairline"
    >
      <Link href={`/article/${article.slug}`}>
        <div className="relative aspect-[16/9] overflow-hidden md:aspect-[21/9]">
          <img
            src={withBase(article.heroImageUrl)}
            alt={article.title}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
          <div className="flex flex-wrap items-center gap-2">
            {article.isBreaking && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Breaking
              </span>
            )}
            <CategoryChip
              category={article.category}
              asLink={false}
              className="bg-white/10 text-white border-white/20"
            />
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold leading-[1.05] text-balance md:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 max-w-2xl text-base text-white/75 md:text-lg">
              {article.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <img
              src={withBase(article.author.avatarUrl)}
              alt={article.author.name}
              className="h-9 w-9 rounded-full border border-white/20 object-cover"
            />
            <div className="text-sm">
              <div className="font-medium">{article.author.name}</div>
              <div className="text-white/60 text-xs">
                {timeAgo(article.publishedAt)} · {article.readingMinutes} min
                read
              </div>
            </div>
            <div className="ml-auto hidden items-center gap-1 text-sm text-white/80 transition group-hover:translate-x-1 md:inline-flex">
              Read story <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function ArticleCard({
  article,
  variant = "default",
  index = 0,
}: {
  article: ArticleLite;
  variant?: "default" | "compact" | "wide" | "minimal";
  index?: number;
}) {
  const motionProps = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.5, delay: Math.min(index * 0.04, 0.3) },
  };

  if (variant === "minimal") {
    return (
      <motion.article {...motionProps} className="group">
        <Link
          href={`/article/${article.slug}`}
          className="flex items-start gap-4"
        >
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md">
            <img
              src={withBase(article.heroImageUrl)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <CategoryChip category={article.category} asLink={false} />
            <h3 className="mt-1.5 text-sm font-semibold leading-snug text-pretty group-hover:text-primary line-clamp-3">
              {article.title}
            </h3>
            <div className="mt-1 text-xs text-muted-foreground">
              {timeAgo(article.publishedAt)}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === "wide") {
    return (
      <motion.article
        {...motionProps}
        className="group grid gap-6 md:grid-cols-[1.4fr_1fr]"
      >
        <Link
          href={`/article/${article.slug}`}
          className="relative aspect-[16/10] overflow-hidden rounded-2xl"
        >
          <img
            src={withBase(article.heroImageUrl)}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100" />
        </Link>
        <div className="flex flex-col justify-center">
          <CategoryChip category={article.category} className="self-start" />
          <Link href={`/article/${article.slug}`}>
            <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-balance group-hover:text-primary md:text-3xl">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3 md:text-base">
              {article.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center gap-3 text-sm">
            <img
              src={withBase(article.author.avatarUrl)}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="font-medium">{article.author.name}</span>
            <span className="text-muted-foreground">
              · {timeAgo(article.publishedAt)}
            </span>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === "compact") {
    return (
      <motion.article
        {...motionProps}
        className="group flex flex-col"
      >
        <Link
          href={`/article/${article.slug}`}
          className="relative aspect-[16/10] overflow-hidden rounded-xl"
        >
          <img
            src={withBase(article.heroImageUrl)}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </Link>
        <div className="mt-3 flex flex-1 flex-col">
          <CategoryChip category={article.category} className="self-start" />
          <Link href={`/article/${article.slug}`}>
            <h3 className="mt-2 font-display text-base font-semibold leading-snug text-pretty group-hover:text-primary line-clamp-3">
              {article.title}
            </h3>
          </Link>
          <div className="mt-auto pt-2">
            <MetaLine article={article} />
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      {...motionProps}
      className="group flex flex-col overflow-hidden rounded-2xl border hairline bg-card/40 transition hover:bg-card hover:shadow-2xl hover:shadow-primary/5"
    >
      <Link
        href={`/article/${article.slug}`}
        className="relative aspect-[16/9] overflow-hidden"
      >
        <img
          src={withBase(article.heroImageUrl)}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {article.isBreaking && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Breaking
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <CategoryChip category={article.category} className="self-start" />
        <Link href={`/article/${article.slug}`}>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-pretty group-hover:text-primary line-clamp-3">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
          <img
            src={withBase(article.author.avatarUrl)}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="font-medium text-foreground/80">
            {article.author.name}
          </span>
          <span className="opacity-40">·</span>
          <span>{timeAgo(article.publishedAt)}</span>
          {article.commentCount !== undefined && article.commentCount > 0 && (
            <span className="ml-auto inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatNumber(article.commentCount)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

type ReviewLite = {
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

export function ScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const tone =
    score >= 9
      ? "from-emerald-400 to-cyan-400"
      : score >= 8
        ? "from-cyan-400 to-violet-400"
        : score >= 7
          ? "from-violet-400 to-fuchsia-400"
          : "from-amber-400 to-rose-400";
  const dim =
    size === "lg"
      ? "h-24 w-24 text-3xl"
      : size === "sm"
        ? "h-12 w-12 text-base"
        : "h-16 w-16 text-xl";
  return (
    <div className="relative">
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${tone} blur-xl opacity-50`}
      />
      <div
        className={`relative ${dim} rounded-full border hairline bg-card flex items-center justify-center font-display font-bold`}
      >
        {score.toFixed(1)}
      </div>
    </div>
  );
}

export function ReviewCard({
  review,
  index = 0,
  variant = "default",
}: {
  review: ReviewLite;
  index?: number;
  variant?: "default" | "compact";
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative overflow-hidden rounded-2xl border hairline bg-card/40 transition hover:bg-card"
    >
      <Link href={`/review/${review.slug}`}>
        <div
          className={`relative overflow-hidden ${
            variant === "compact" ? "aspect-[16/10]" : "aspect-[16/9]"
          }`}
        >
          <img
            src={withBase(review.heroImageUrl)}
            alt={review.productName}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute right-4 top-4">
            <ScoreBadge score={review.score} size="md" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <CategoryChip
              category={review.category}
              asLink={false}
              className="bg-white/10 text-white border-white/20"
            />
            <h3 className="mt-2 font-display text-xl font-bold leading-tight text-balance">
              {review.productName}
            </h3>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {review.tagline}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground">
              {formatPrice(review.priceUsd)}
            </span>
            <span className="inline-flex items-center gap-1 text-foreground/70 transition group-hover:translate-x-1 group-hover:text-primary">
              Read review <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

type VideoLite = {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  durationSeconds: number;
  publishedAt: string;
  viewCount: number;
  category: { slug: string; name: string; accentColor: string };
};

export function VideoCard({
  video,
  index = 0,
  onPlay,
}: {
  video: VideoLite;
  index?: number;
  onPlay?: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
      className="group cursor-pointer"
      onClick={onPlay}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl border hairline">
        <img
          src={withBase(video.thumbnailUrl)}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-white backdrop-blur">
          {formatDuration(video.durationSeconds)}
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <CategoryChip
            category={video.category}
            className="bg-white/10 text-white border-white/20"
          />
          <h3 className="mt-2 font-display text-base font-semibold leading-snug text-balance line-clamp-2">
            {video.title}
          </h3>
          <div className="mt-1 text-xs text-white/60">
            {formatNumber(video.viewCount)} views · {timeAgo(video.publishedAt)}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  ctaLabel = "See all",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        {eyebrow && (
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground md:inline-flex"
        >
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function ArticleSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border hairline bg-card/30 p-3"
        >
          <div className="aspect-[16/9] animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
