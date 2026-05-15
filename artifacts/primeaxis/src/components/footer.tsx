import { Link } from "wouter";
import { Wordmark } from "./wordmark";
import { useListCategories } from "@workspace/api-client-react";

export function Footer() {
  const cats = useListCategories();
  return (
    <footer className="mt-24 border-t hairline bg-card/30">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Wordmark size="lg" />
          <p className="max-w-sm text-sm text-muted-foreground">
            PrimeAxis Tech is a global newsroom covering AI, gadgets, gaming,
            EVs, robotics, and the future of computing — with the depth our
            readers deserve and the pace the industry demands.
          </p>
          <div className="flex gap-2 pt-2">
            <Link
              href="/newsletters"
              className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
            >
              Subscribe to The Axis
            </Link>
          </div>
        </div>
        <div className="md:col-span-3">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sections
          </h4>
          <ul className="space-y-2 text-sm">
            {(cats.data ?? []).slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="text-foreground/70 hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            More
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/reviews"
                className="text-foreground/70 hover:text-foreground"
              >
                Reviews
              </Link>
            </li>
            <li>
              <Link
                href="/videos"
                className="text-foreground/70 hover:text-foreground"
              >
                Videos
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="text-foreground/70 hover:text-foreground"
              >
                Search
              </Link>
            </li>
            <li>
              <Link
                href="/newsletters"
                className="text-foreground/70 hover:text-foreground"
              >
                Newsletters
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Newsroom
          </h4>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li>About PrimeAxis</li>
            <li>Editorial Standards</li>
            <li>Ethics & Corrections</li>
            <li>Press Inquiries</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="container-page flex flex-col items-start gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} PrimeAxis Tech. The future, reported.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
            <span className="font-mono uppercase tracking-widest">
              v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
