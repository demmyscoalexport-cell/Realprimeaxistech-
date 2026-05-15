import {
  useListReviews,
  useListBestPicks,
} from "@workspace/api-client-react";
import { ReviewCard, SectionHeader } from "@/components/cards";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function ReviewsPage() {
  const reviews = useListReviews({ limit: 24 });
  const best = useListBestPicks();

  return (
    <>
      <section className="relative overflow-hidden border-b hairline">
        <div className="dark:glow-aurora glow-aurora-light pointer-events-none absolute inset-0 -z-10" />
        <div className="container-page py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border hairline bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur">
              <Award className="h-3 w-3 text-primary" /> Reviews
            </div>
            <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl font-bold leading-tight text-balance md:text-7xl">
              The verdicts our reviewers <span className="gradient-text">stand behind.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Long-term tested. Honest scores. The shortlist for what to actually
              buy — and what to skip.
            </p>
          </motion.div>
        </div>
      </section>

      {best.data && best.data.length > 0 && (
        <section className="container-page py-16">
          <SectionHeader
            eyebrow="Best Picks"
            title="The shortlist."
            description="The products our team recommends without reservation."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {best.data.map((r, i) => (
              <ReviewCard key={r.id} review={r} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <SectionHeader
          eyebrow="All Reviews"
          title="Everything on the test bench."
        />
        {reviews.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/9] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : reviews.data && reviews.data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.data.map((r, i) => (
              <ReviewCard key={r.id} review={r} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet.</p>
        )}
      </section>
    </>
  );
}
