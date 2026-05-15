import {
  useListNewsletters,
  useSubscribeNewsletter,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Mail, Check, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatNumber } from "@/lib/format";

export default function NewslettersPage() {
  const { data, isLoading } = useListNewsletters();
  const subscribe = useSubscribeNewsletter();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState("");

  const handleSubscribe = (slug: string) => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }
    subscribe.mutate(
      { data: { email, newsletterSlug: slug } },
      {
        onSuccess: () => {
          setDone((d) => ({ ...d, [slug]: true }));
          toast.success("Welcome aboard.");
          setEmail("");
        },
        onError: () => toast.error("Subscription failed. Try again."),
      },
    );
  };

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
              <Mail className="h-3 w-3 text-primary" /> Newsletters
            </div>
            <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl font-bold leading-tight text-balance md:text-7xl">
              The PrimeAxis briefing,{" "}
              <span className="gradient-text">in your inbox.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Pick the briefings that match how you read. Cancel any time. No
              tracking pixels, no dark patterns.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-16">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(data ?? []).map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative overflow-hidden rounded-3xl border hairline bg-card/40 p-8 transition hover:bg-card"
              >
                <div
                  className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
                  style={{ background: n.accentColor }}
                />
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {n.cadence}
                  </div>
                  <div
                    className="rounded-full px-2 py-0.5 font-mono text-[10px]"
                    style={{
                      background: `${n.accentColor}22`,
                      color: n.accentColor,
                    }}
                  >
                    {formatNumber(n.subscriberCount)} readers
                  </div>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold">
                  {n.name}
                </h2>
                <p className="mt-2 text-muted-foreground">{n.tagline}</p>

                {done[n.slug] ? (
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-400">
                    <Check className="h-4 w-4" />
                    Subscribed. Welcome to {n.name}.
                  </div>
                ) : openSlug === n.slug ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubscribe(n.slug);
                    }}
                    className="mt-6 flex flex-col gap-2 sm:flex-row"
                  >
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 flex-1 rounded-full border hairline bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="submit"
                      disabled={subscribe.isPending}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      {subscribe.isPending ? "Subscribing…" : "Subscribe"}
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setOpenSlug(n.slug)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border hairline bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Subscribe to {n.name}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
