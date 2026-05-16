import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./wordmark";
import { ThemeToggle } from "./theme-toggle";
import { Search, Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { useListCategories } from "@workspace/api-client-react";
import type { Category } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

const PRIMARY_NAV: { slug: string; label: string }[] = [
  { slug: "ai", label: "AI" },
  { slug: "gadgets", label: "Gadgets" },
  { slug: "gaming", label: "Gaming" },
  { slug: "ev", label: "EV" },
  { slug: "future-tech", label: "Tomorrow" },
  { slug: "vr-ar", label: "VR/AR" },
  { slug: "cybersecurity", label: "Security" },
  { slug: "entertainment", label: "Culture" },
];

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [loc, navigate] = useLocation();
  const cats = useListCategories();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenSlug(null);
    setMobileOpen(false);
  }, [loc]);

  const bySlug = new Map<string, Category>(
    (cats.data ?? []).map((c) => [c.slug, c]),
  );
  const navItems = PRIMARY_NAV.map((n) => {
    const c = bySlug.get(n.slug);
    return c ? { ...c, label: n.label } : null;
  }).filter((c): c is Category & { label: string } => !!c);

  const openMenu = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenSlug(slug);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenSlug(null), 120);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled
          ? "border-b hairline bg-background/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-background/40 backdrop-blur-md"
      }`}
      onMouseLeave={scheduleClose}
    >
      <div className="container-page flex h-[68px] items-center gap-8">
        <Wordmark />
        <nav className="hidden flex-1 items-center gap-0.5 lg:flex">
          {navItems.map((c) => {
            const href = `/category/${c.slug}`;
            const active = loc.startsWith(href);
            const hasSubs = (c.subcategories ?? []).length > 0;
            return (
              <div
                key={c.slug}
                className="relative"
                onMouseEnter={() => hasSubs && openMenu(c.slug)}
              >
                <Link
                  href={href}
                  className={`relative inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium tracking-[-0.005em] transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-foreground/65 hover:text-foreground"
                  }`}
                >
                  {c.label}
                  {hasSubs && (
                    <ChevronDown className="h-3 w-3 opacity-60" aria-hidden />
                  )}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[19px] h-px bg-foreground" />
                  )}
                </Link>
              </div>
            );
          })}
          <Link
            href="/reviews"
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium tracking-[-0.005em] transition-colors ${
              loc.startsWith("/reviews")
                ? "text-foreground"
                : "text-foreground/65 hover:text-foreground"
            }`}
          >
            Reviews
          </Link>
          <Link
            href="/videos"
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium tracking-[-0.005em] transition-colors ${
              loc.startsWith("/videos")
                ? "text-foreground"
                : "text-foreground/65 hover:text-foreground"
            }`}
          >
            Videos
          </Link>
          <Link
            href="/newsletters"
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium tracking-[-0.005em] transition-colors ${
              loc.startsWith("/newsletters")
                ? "text-foreground"
                : "text-foreground/65 hover:text-foreground"
            }`}
          >
            Newsletters
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search"
            className="hidden md:inline-flex items-center gap-2 rounded-full border hairline bg-card/60 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur transition hover:bg-card hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span>Search PrimeAxis</span>
            <kbd className="ml-2 hidden md:inline-flex items-center gap-1 rounded border hairline bg-background px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card/60 backdrop-blur"
          >
            <Search className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <Button
            size="sm"
            className="hidden sm:inline-flex h-9 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
            onClick={() => navigate("/newsletters")}
          >
            Subscribe
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
          <button
            type="button"
            aria-label="Open menu"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border hairline"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* MEGA MENU PANEL (desktop) */}
      {openSlug && (() => {
        const c = bySlug.get(openSlug);
        if (!c) return null;
        const subs = c.subcategories ?? [];
        return (
          <div
            className="hidden lg:block absolute inset-x-0 top-full border-t hairline bg-background/95 backdrop-blur-xl shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]"
            onMouseEnter={() => openMenu(openSlug)}
            onMouseLeave={scheduleClose}
          >
            <div className="container-page grid grid-cols-12 gap-10 py-8">
              <div className="col-span-3 flex flex-col gap-3">
                <div
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c.accentColor }}
                  />
                  Section
                </div>
                <Link
                  href={`/category/${c.slug}`}
                  className="font-display text-3xl font-bold tracking-tight hover:underline"
                >
                  {c.name}
                </Link>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <Link
                  href={`/category/${c.slug}`}
                  className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground"
                >
                  See all {c.articleCount} stories
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-1">
                {subs.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/category/${c.slug}?sub=${s.slug}`}
                    className="group flex flex-col gap-0.5 rounded-lg px-3 py-3 transition hover:bg-accent"
                  >
                    <div className="text-[15px] font-semibold tracking-tight">
                      {s.name}
                    </div>
                    {s.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {s.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TOPICS STRIP */}
      {cats.data && cats.data.length > 0 && (
        <div className="border-t hairline">
          <div className="container-page flex items-center gap-3 overflow-x-auto py-2 text-xs scroll-fade-mask">
            <span className="shrink-0 font-mono uppercase tracking-widest text-muted-foreground">
              Topics
            </span>
            {cats.data.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border hairline bg-card/40 px-3 py-1 text-foreground/70 transition hover:bg-card hover:text-foreground"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: c.accentColor }}
                />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden border-t hairline bg-background max-h-[80vh] overflow-y-auto">
          <div className="container-page flex flex-col gap-1 py-3">
            {navItems.map((c) => {
              const isOpen = mobileExpanded === c.slug;
              const subs = c.subcategories ?? [];
              return (
                <div key={c.slug} className="border-b hairline last:border-b-0">
                  <div className="flex items-center">
                    <Link
                      href={`/category/${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 px-3 py-3 text-sm font-semibold"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: c.accentColor }}
                        />
                        {c.label}
                      </span>
                    </Link>
                    {subs.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded(isOpen ? null : c.slug)
                        }
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        className="px-4 py-3"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {isOpen && subs.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 pb-2 pl-3">
                      {subs.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/category/${c.slug}?sub=${s.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="rounded-md px-3 py-2 text-sm text-foreground/75 hover:bg-accent hover:text-foreground"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              href="/reviews"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Reviews
            </Link>
            <Link
              href="/videos"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Videos
            </Link>
            <Link
              href="/newsletters"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Newsletters
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate("/newsletters");
              }}
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
            >
              Subscribe to The Axis
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
