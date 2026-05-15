import { useSearch, useLocation } from "wouter";
import {
  useSearchArticles,
  getSearchArticlesQueryKey,
} from "@workspace/api-client-react";
import { ArticleCard } from "@/components/cards";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function SearchPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const initial = new URLSearchParams(search).get("q") ?? "";
  const [q, setQ] = useState(initial);
  const debounced = useDebounce(q, 250);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`, {
      replace: true,
    });
  }, [debounced, navigate]);

  const { data, isLoading } = useSearchArticles(
    { q: debounced, limit: 30 },
    {
      query: {
        enabled: debounced.trim().length >= 2,
        queryKey: getSearchArticlesQueryKey({ q: debounced, limit: 30 }),
      },
    },
  );

  return (
    <>
      <section className="border-b hairline">
        <div className="container-page py-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Search
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-6xl">
            Find a story.
          </h1>
          <div className="relative mt-8 max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles, authors, topics…"
              className="h-14 w-full rounded-full border hairline bg-card/60 pl-12 pr-4 text-lg outline-none backdrop-blur placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        {debounced.trim().length < 2 ? (
          <div className="rounded-2xl border hairline bg-card/30 p-12 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-card">
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">
              Start typing to search PrimeAxis Tech.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/9] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              {data.length} result{data.length === 1 ? "" : "s"} for "{debounced}"
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border hairline bg-card/30 p-12 text-center">
            <p className="text-muted-foreground">
              No results for "{debounced}". Try a different query.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
