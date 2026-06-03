import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MailX, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useUnsubscribeNewsletter } from "@workspace/api-client-react";

function initialParam(name: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export default function UnsubscribePage() {
  const unsubscribe = useUnsubscribeNewsletter();
  const [email, setEmail] = useState(() => initialParam("email"));
  const [newsletterSlug, setNewsletterSlug] = useState(
    () => initialParam("newsletter") || "the-axis",
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialParam("email")) setEmail(initialParam("email"));
    if (initialParam("newsletter")) setNewsletterSlug(initialParam("newsletter"));
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    unsubscribe.mutate(
      { data: { email, newsletterSlug } },
      {
        onSuccess: () => {
          setDone(true);
          toast.success("Unsubscribe request processed.");
        },
        onError: () => {
          toast.error("Could not unsubscribe right now. Please try again.");
        },
      },
    );
  };

  return (
    <section className="relative overflow-hidden border-b hairline">
      <div className="dark:glow-aurora glow-aurora-light pointer-events-none absolute inset-0 -z-10" />
      <div className="container-page flex min-h-[70vh] items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl rounded-3xl border hairline bg-card/50 p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border hairline bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
            <MailX className="h-3.5 w-3.5 text-primary" />
            Newsletter preferences
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold">
            Unsubscribe from a PrimeAxis briefing.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enter the email address and newsletter slug you want removed. If the
            address is not subscribed, no new subscription will be created.
          </p>

          {done ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-300">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Request processed
              </div>
              <p className="mt-2 text-sm text-emerald-100/80">
                If {email} was subscribed to {newsletterSlug}, it has been
                removed.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-full border hairline bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Newsletter slug
                </span>
                <input
                  required
                  value={newsletterSlug}
                  onChange={(event) => setNewsletterSlug(event.target.value)}
                  className="h-12 w-full rounded-full border hairline bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="the-axis"
                />
              </label>
              <button
                type="submit"
                disabled={unsubscribe.isPending}
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:scale-[1.02] disabled:opacity-60"
              >
                {unsubscribe.isPending ? "Processing..." : "Unsubscribe"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
