import { useRoute, Link } from "wouter";
import {
  useGetReviewBySlug,
  getGetReviewBySlugQueryKey,
} from "@workspace/api-client-react";
import { ScoreBadge, CategoryChip } from "@/components/cards";
import { ReviewBuyLinks } from "@/components/review-buy-links";
import { ArrowLeft, Check, X } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { EditorialImage } from "@/components/editorial-image";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { usePageMeta } from "@/lib/seo";

export default function ReviewPage() {
  const [, params] = useRoute("/review/:slug");
  const slug = params?.slug ?? "";
  const { data, isLoading, isError } = useGetReviewBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetReviewBySlugQueryKey(slug) },
  });
  useEffect(() => window.scrollTo({ top: 0 }), [slug]);

  usePageMeta({
    title: data ? `${data.productName} Review — PrimeAxis Tech` : undefined,
    description: data?.summary,
    path: data ? `/review/${data.slug}` : undefined,
    image: data?.heroImageUrl,
    type: "article",
  });

  if (isLoading) {
    return (
      <div className="container-page py-16 space-y-6">
        <div className="aspect-[21/9] animate-pulse rounded-3xl bg-muted" />
        <div className="h-12 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container-page py-24 text-center text-muted-foreground">
        Review not found.
        <div className="mt-4">
          <Link href="/reviews" className="text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Back to reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article>
      <div className="relative">
        <div className="container-page pt-12">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All reviews
          </Link>
        </div>
        <div className="container-page mt-6 max-w-6xl">
          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border hairline">
            <EditorialImage
              src={data.heroImageUrl}
              alt={data.productName}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryChip
                      category={data.category}
                      className="bg-white/10 text-white border-white/20"
                    />
                    {data.isSponsored && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/90">
                        Sponsored
                      </span>
                    )}
                  </div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-3 font-display text-4xl font-bold leading-tight text-balance md:text-6xl"
                  >
                    {data.productName}
                  </motion.h1>
                  <p className="mt-3 max-w-2xl text-base text-white/75 md:text-xl">
                    {data.tagline}
                  </p>
                </div>
                <div className="hidden md:block">
                  <ScoreBadge score={data.score} size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="rounded-2xl border hairline bg-card/40 p-6">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Verdict
            </div>
            <p className="mt-3 font-serif text-2xl leading-snug text-pretty md:text-3xl">
              "{data.verdict}"
            </p>
            <p className="mt-4 text-muted-foreground">{data.summary}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border hairline bg-card/40 p-6">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-emerald-400">
                Pros
              </div>
              <ul className="space-y-3">
                {data.pros.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border hairline bg-card/40 p-6">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-rose-400">
                Cons
              </div>
              <ul className="space-y-3">
                {data.cons.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {data.sections.map((s, i) => (
            <section key={i} className="mt-12">
              <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">
                {s.heading}
              </h2>
              <p className="mt-4 text-pretty text-foreground/85 leading-relaxed text-lg">
                {s.body}
              </p>
            </section>
          ))}

          {data.galleryImages && data.galleryImages.length > 0 && (
            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {data.galleryImages.map((g, i) => (
                <EditorialImage
                  key={i}
                  src={g}
                  alt=""
                  width={800}
                  className="aspect-[16/10] w-full rounded-2xl border hairline object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border hairline bg-card p-6 text-center md:hidden">
            <ScoreBadge score={data.score} size="lg" />
            <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Overall Score
            </div>
          </div>

          <div className="rounded-2xl border hairline bg-card/40 p-6">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Ratings
            </div>
            <div className="space-y-3">
              {data.ratings.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{r.label}</span>
                    <span className="font-mono text-xs">
                      {r.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400"
                      style={{ width: `${(r.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border hairline bg-card/40 p-6">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Price
            </div>
            <div className="mt-2 font-display text-3xl font-bold">
              {formatPrice(data.priceUsd)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Reviewed {formatDate(data.publishedAt)}
            </div>
          </div>

          <ReviewBuyLinks links={data.affiliateLinks ?? []} />

          <Link
            href={`/author/${data.author.slug}`}
            className="block rounded-2xl border hairline bg-card/40 p-5 transition hover:bg-card"
          >
            <div className="flex items-center gap-3">
              <EditorialImage
                src={data.author.avatarUrl}
                alt=""
                width={200}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold">{data.author.name}</div>
                <div className="text-xs text-muted-foreground">
                  {data.author.role}
                </div>
              </div>
            </div>
          </Link>
        </aside>
      </div>
    </article>
  );
}
