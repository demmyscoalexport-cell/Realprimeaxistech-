const KEY_HISTORY = "primeaxis:reading-history:v1";
const KEY_BOOKMARKS = "primeaxis:bookmarks:v1";

export type ReadingEntry = {
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  heroImageUrl: string;
  ts: number;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getReadingHistory(): ReadingEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<ReadingEntry[]>(localStorage.getItem(KEY_HISTORY), []);
}

export function recordRead(entry: Omit<ReadingEntry, "ts">) {
  if (typeof window === "undefined") return;
  const list = getReadingHistory().filter((e) => e.slug !== entry.slug);
  list.unshift({ ...entry, ts: Date.now() });
  const trimmed = list.slice(0, 24);
  localStorage.setItem(KEY_HISTORY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event("primeaxis:history-updated"));
}

export function getTopCategories(limit = 3): string[] {
  const counts = new Map<string, number>();
  for (const e of getReadingHistory()) {
    counts.set(e.categorySlug, (counts.get(e.categorySlug) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug]) => slug);
}

export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse<string[]>(localStorage.getItem(KEY_BOOKMARKS), []);
}

export function toggleBookmark(slug: string): boolean {
  const cur = new Set(getBookmarks());
  let now: boolean;
  if (cur.has(slug)) {
    cur.delete(slug);
    now = false;
  } else {
    cur.add(slug);
    now = true;
  }
  localStorage.setItem(KEY_BOOKMARKS, JSON.stringify([...cur]));
  window.dispatchEvent(new Event("primeaxis:bookmarks-updated"));
  return now;
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug);
}
