import { Link } from "wouter";
import { useState } from "react";
import { Wordmark } from "./wordmark";
import {
  useListCategories,
  useSubscribeNewsletter,
} from "@workspace/api-client-react";
import { Rss, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const SOCIALS = [
  { label: "Podcast RSS", href: "/api/podcast/feed.xml", icon: Rss },
];

export function Footer() {
  const cats = useListCategories();
  const subscribe = useSubscribeNewsletter();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    subscribe.mutate(
      { data: { email, newsletterSlug: "the-axis" } },
      {
        onSuccess: () => {
          toast.success("You're on the list. Welcome to The Axis.");
          setSubscribed(true);
          setEmail("");
        },
        onError: () => {
          toast.error("Subscription failed. Please try again.");
        },
      },
    );
  };

  return (
    <footer className="mt-24 border-t hairline bg-card/30">
      {/* Newsletter band */}
      <div className="border-b hairline">
        <div className="container-page grid items-center gap-8 py-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              The Axis · Daily Briefing
            </div>
            <h3 className="mt-2 font-display text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-balance md:text-[2.1rem]">
              The signal from the world of technology, in your inbox at 7am.
            </h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Curated by our newsroom. No fluff. Free, always.
            </p>
          </div>
          <form
            onSubmit={onSubscribe}
            className="flex w-full items-center gap-2 rounded-full border hairline bg-background p-1.5 pl-5"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={subscribe.isPending || subscribed}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition hover:bg-foreground/90"
            >
              {subscribed
                ? "Subscribed"
                : subscribe.isPending
                  ? "Subscribing..."
                  : "Subscribe"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4 space-y-5">
          <Wordmark size="lg" />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            PrimeAxis Tech is a global newsroom covering AI, gadgets, gaming,
            EVs, robotics, and the future of computing — with the depth our
            readers deserve and the pace the industry demands.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card/60 text-foreground/70 transition hover:bg-card hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Sections
          </h4>
          <ul className="space-y-2.5 text-sm">
            {(cats.data ?? []).slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="inline-flex items-center gap-2 text-foreground/70 transition hover:text-foreground"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c.accentColor }}
                  />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            More
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/reviews", label: "Reviews" },
              { href: "/videos", label: "Videos" },
              { href: "/search", label: "Search" },
              { href: "/newsletters", label: "Newsletters" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-foreground/70 transition hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Newsroom
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/about", label: "About PrimeAxis" },
              { href: "/ethics", label: "Editorial Standards" },
              { href: "/ethics", label: "Ethics & Corrections" },
              { href: "/contact", label: "Press Inquiries" },
              { href: "/careers", label: "Careers" },
            ].map((l, i) => (
              <li key={i}>
                <Link
                  href={l.href}
                  className="text-foreground/70 transition hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="container-page flex flex-col items-start gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} PrimeAxis Tech. The future, reported.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Cookies
            </Link>
            <span className="font-mono uppercase tracking-[0.2em]">v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
