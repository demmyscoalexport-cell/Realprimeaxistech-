import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocation } from "wouter";
import {
  useSearchArticles,
  useListCategories,
  getSearchArticlesQueryKey,
} from "@workspace/api-client-react";
import { Search, Tag, Newspaper, Compass } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 200);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          t?.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = useSearchArticles(
    { q: debounced, limit: 8 },
    {
      query: {
        enabled: debounced.trim().length >= 2,
        queryKey: getSearchArticlesQueryKey({ q: debounced, limit: 8 }),
      },
    },
  );
  const cats = useListCategories();

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search PrimeAxis Tech…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {debounced.trim().length < 2
            ? "Type to search articles, reviews, and topics."
            : results.isLoading
              ? "Searching…"
              : "No results found."}
        </CommandEmpty>
        {results.data && results.data.length > 0 && (
          <CommandGroup heading="Articles">
            {results.data.map((a) => (
              <CommandItem
                key={a.id}
                value={`article-${a.slug}`}
                onSelect={() => go(`/article/${a.slug}`)}
              >
                <Newspaper className="mr-2 h-4 w-4 opacity-60" />
                <div className="flex-1 truncate">
                  <div className="truncate text-sm font-medium">{a.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.category.name} · {a.readingMinutes} min read
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Sections">
          <CommandItem onSelect={() => go("/")}>
            <Compass className="mr-2 h-4 w-4 opacity-60" />
            Home
          </CommandItem>
          <CommandItem onSelect={() => go("/reviews")}>
            <Compass className="mr-2 h-4 w-4 opacity-60" />
            Reviews
          </CommandItem>
          <CommandItem onSelect={() => go("/videos")}>
            <Compass className="mr-2 h-4 w-4 opacity-60" />
            Videos
          </CommandItem>
          <CommandItem onSelect={() => go("/newsletters")}>
            <Compass className="mr-2 h-4 w-4 opacity-60" />
            Newsletters
          </CommandItem>
        </CommandGroup>
        {cats.data && cats.data.length > 0 && (
          <CommandGroup heading="Categories">
            {cats.data.map((c) => (
              <CommandItem
                key={c.id}
                value={`cat-${c.slug}`}
                onSelect={() => go(`/category/${c.slug}`)}
              >
                <Tag
                  className="mr-2 h-4 w-4"
                  style={{ color: c.accentColor }}
                />
                {c.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {c.articleCount} stories
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup>
          <CommandItem
            onSelect={() => {
              if (debounced.trim()) {
                go(`/search?q=${encodeURIComponent(debounced.trim())}`);
              }
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            See all results for "{debounced || query}"
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPaletteShortcut() {
  // exposed for future use; the dialog wires its own
}
