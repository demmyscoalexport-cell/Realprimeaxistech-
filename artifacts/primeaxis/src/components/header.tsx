import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Wordmark } from "./wordmark";
import { ThemeToggle } from "./theme-toggle";
import { Search, Menu, X, ArrowUpRight } from "lucide-react";
import { useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

const PRIMARY_NAV = [
  { label: "AI", href: "/category/ai" },
  { label: "Gadgets", href: "/category/gadgets" },
  { label: "Reviews", href: "/reviews" },
  { label: "Gaming", href: "/category/gaming" },
  { label: "EV", href: "/category/ev" },
  { label: "Future Tech", href: "/category/future-tech" },
  { label: "Videos", href: "/videos" },
  { label: "Newsletters", href: "/newsletters" },
];

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loc, navigate] = useLocation();
  const cats = useListCategories();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled
          ? "border-b hairline bg-background/75 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-background/30 backdrop-blur-md"
      }`}
    >
      <div className="container-page flex h-[68px] items-center gap-8">
        <Wordmark />
        <nav className="hidden flex-1 items-center gap-0.5 lg:flex">
          {PRIMARY_NAV.map((item) => {
            const active =
              item.href === loc ||
              (item.href !== "/" && loc.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-md px-3 py-1.5 text-[13px] font-medium tracking-[-0.005em] transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-foreground/65 hover:text-foreground"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[19px] h-px bg-foreground" />
                )}
              </Link>
            );
          })}
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
      {/* Trending strip */}
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
      {mobileOpen && (
        <div className="lg:hidden border-t hairline bg-background">
          <div className="container-page flex flex-col gap-1 py-3">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
