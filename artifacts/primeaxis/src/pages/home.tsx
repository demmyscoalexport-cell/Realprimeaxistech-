import { useGetHomeFeed, useListNewsletters } from "@workspace/api-client-react";
import {
  ArticleCard,
  ArticleHeroCard,
  ArticleSkeleton,
  CategoryChip,
  ReviewCard,
  SectionHeader,
  VideoCard,
} from "@/components/cards";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Mail } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/format";
import { useState } from "react";
import { VideoLightbox } from "@/components/video-lightbox";
import { PersonalizedRail } from "@/components/personalized-rail";
import { TrustStrip } from "@/components/trust-strip";

export default function HomePage() {
  const { data, isLoading, isError } = useGetHomeFeed();
  const newsletters = useListNewsletters();
  const [video, setVideo] = useState<{
    title: string;
    thumbnailUrl: string;
    videoUrl?: string | null;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <div className="mb-8 aspect-[21/9] animate-pulse rounded-3xl bg-muted" />
        <ArticleSkeleton count={6} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-muted-foreground">
          The newsroom could not load right now. Please refresh.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 dark:glow-aurora glow-aurora-light" />
        <div className="container-page pt-8 pb-12 md:pt-12">
          <ArticleHeroCard article={data.hero} />
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data.spotlight.slice(0, 4).map((a, i) => (
              <ArticleCard key={a.id} article={a} variant="compact" index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING + LATEST */}
      <section className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <SectionHeader
              eyebrow="Latest"
              title="The newsroom, right now."
              description="The stories our editors think matter most this hour."
              href="/category/ai"
              ctaLabel="See more"
            />
            <div className="grid gap-8">
              {data.latest.slice(0, 2).map((a, i) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  variant="wide"
                  index={i}
                />
              ))}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.latest.slice(2, 8).map((a, i) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    variant="compact"
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-10">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">
                  Editor&apos;s picks
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Curated
                </span>
              </div>
              <ol className="space-y-5">
                {data.trending.slice(0, 6).map((a, i) => (
                  <li key={a.id} className="flex gap-4">
                    <span className="font-display text-3xl font-bold text-muted-foreground/50 leading-none w-8 shrink-0">
                      0{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <CategoryChip category={a.category} />
                      <Link href={`/article/${a.slug}`}>
                        <h4 className="mt-1.5 text-sm font-semibold leading-snug hover:text-primary line-clamp-3">
                          {a.title}
                        </h4>
                      </Link>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {a.readingMinutes} min read · {timeAgo(a.publishedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <NewsletterInline newsletter={newsletters.data?.[0]} />
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">
                  Worth a second read
                </h3>
              </div>
              <div className="space-y-5">
                {data.mostDiscussed.slice(0, 5).map((a) => (
                  <ArticleCard key={a.id} article={a} variant="minimal" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* PERSONALIZED — appears once you have reading history */}
      <PersonalizedRail />

      {/* AI & FUTURE TECH BAND */}
      <section className="relative overflow-hidden border-y hairline bg-card/30 py-20">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(60rem 30rem at 80% 50%, hsl(188 95% 55% / 0.10), transparent 60%)",
          }}
        />
        <div className="container-page">
          <SectionHeader
            eyebrow="AI & Future Tech"
            title="The intelligence economy."
            description="Inside the labs, the chips, and the politics shaping what computing becomes next."
            href="/category/ai"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.aiAndFuture.map((a, i) => (
              <ArticleCard
                key={a.id}
                article={a}
                variant="default"
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED REVIEWS */}
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Best Picks"
          title="The verdicts our reviewers stand behind."
          description="Long-term tested. Honest scores. The shortlist for what to actually buy."
          href="/reviews"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.featuredReviews.map((r, i) => (
            <ReviewCard key={r.id} review={r} index={i} />
          ))}
        </div>
      </section>

      {/* GAMING + ENTERTAINMENT */}
      <section className="relative border-y hairline bg-card/20 py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Gaming & Entertainment"
            title="Studios. Streams. Stories."
            href="/category/gaming"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data.gamingAndEntertainment.map((a, i) => (
              <ArticleCard
                key={a.id}
                article={a}
                variant="compact"
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Watch"
          title="On screen this week."
          description="Long-form explainers, hands-on reviews, and field reports from the PrimeAxis video team."
          href="/videos"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.videos.slice(0, 3).map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              index={i}
              onPlay={() =>
                setVideo({
                  title: v.title,
                  thumbnailUrl: v.thumbnailUrl,
                  videoUrl: v.videoUrl,
                })
              }
            />
          ))}
        </div>
      </section>

      {/* INVESTIGATIONS */}
      {data.investigations.length > 0 && (
        <section className="container-page py-20">
          <SectionHeader
            eyebrow="Investigations"
            title="Long reads worth your evening."
            description="Original reporting from the PrimeAxis newsroom. Months in the making."
          />
          <div className="grid gap-12">
            {data.investigations.map((a, i) => (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="group grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center"
              >
                <Link
                  href={`/article/${a.slug}`}
                  className="relative aspect-[16/10] overflow-hidden rounded-2xl border hairline"
                >
                  <img
                    src={a.heroImageUrl}
                    alt={a.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </Link>
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border hairline bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Investigation · {a.readingMinutes} min read
                  </div>
                  <Link href={`/article/${a.slug}`}>
                    <h3 className="font-display text-2xl font-bold leading-tight text-balance group-hover:text-primary md:text-3xl">
                      {a.title}
                    </h3>
                  </Link>
                  <p className="mt-3 text-muted-foreground">{a.excerpt}</p>
                  <div className="mt-5 flex items-center gap-3 text-sm">
                    <img
                      src={a.author.avatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">{a.author.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.author.role ?? "Staff Writer"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* BUYING GUIDES + STARTUPS */}
      <section className="container-page grid gap-16 py-20 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="Buying Guides"
            title="Worth your money."
            href="/reviews"
          />
          <div className="space-y-5">
            {data.buyingGuides.map((a) => (
              <ArticleCard key={a.id} article={a} variant="minimal" />
            ))}
            {data.buyingGuides.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Buying guides land here as the team publishes them.
              </p>
            )}
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow="Startups"
            title="The next platforms."
            href="/category/startups"
          />
          <div className="space-y-5">
            {data.startups.map((a) => (
              <ArticleCard key={a.id} article={a} variant="minimal" />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <TrustStrip />

      {/* NEWSLETTER CTA */}
      <NewsletterBand />

      {/* CATEGORIES */}
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Sections"
          title="The PrimeAxis universe."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {data.categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl border hairline bg-card/40 p-5 transition hover:bg-card"
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: c.accentColor }}
              />
              <div className="font-display text-lg font-bold">{c.name}</div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {c.description}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  {c.articleCount} stories
                </span>
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <VideoLightbox
        open={!!video}
        onClose={() => setVideo(null)}
        title={video?.title ?? ""}
        thumbnailUrl={video?.thumbnailUrl ?? ""}
        videoUrl={video?.videoUrl}
      />
    </>
  );
}

function NewsletterInline({
  newsletter,
}: {
  newsletter?: {
    slug: string;
    name: string;
    tagline: string;
    accentColor: string;
    subscriberCount: number;
  };
}) {
  if (!newsletter) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl border hairline bg-card p-5">
      <div
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{ background: newsletter.accentColor }}
      />
      <div className="inline-flex items-center gap-1.5 rounded-full border hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <Mail className="h-3 w-3" /> Newsletter
      </div>
      <h3 className="mt-3 font-display text-xl font-bold">{newsletter.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{newsletter.tagline}</p>
      <Link
        href="/newsletters"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        Subscribe <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
      {newsletter.subscriberCount != null && newsletter.subscriberCount > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          {formatNumber(newsletter.subscriberCount)} readers
        </div>
      )}
    </div>
  );
}

function NewsletterBand() {
  return (
    <section className="relative overflow-hidden border-y hairline">
      <div className="dark:glow-aurora glow-aurora-light pointer-events-none absolute inset-0 -z-10 opacity-90" />
      <div className="container-page py-20 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border hairline bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur">
          <Mail className="h-3 w-3 text-primary" /> The Briefing
        </div>
        <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-balance md:text-6xl">
          The technology stories shaping{" "}
          <span className="gradient-text">the global agenda.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Sign up for The Axis — our morning briefing on the technology stories
          shaping the day, sent every weekday at 06:00 GMT.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/newsletters"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:scale-[1.02]"
          >
            Choose your newsletters
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
