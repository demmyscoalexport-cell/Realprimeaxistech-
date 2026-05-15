import { useEffect, useState } from "react";
import {
  getReadingHistory,
  getTopCategories,
  type ReadingEntry,
} from "@/lib/personalization";

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingEntry[]>([]);
  useEffect(() => {
    setHistory(getReadingHistory());
    const handler = () => setHistory(getReadingHistory());
    window.addEventListener("primeaxis:history-updated", handler);
    return () =>
      window.removeEventListener("primeaxis:history-updated", handler);
  }, []);
  return history;
}

export function useTopCategories(limit = 3): string[] {
  const [cats, setCats] = useState<string[]>([]);
  useEffect(() => {
    setCats(getTopCategories(limit));
    const handler = () => setCats(getTopCategories(limit));
    window.addEventListener("primeaxis:history-updated", handler);
    return () =>
      window.removeEventListener("primeaxis:history-updated", handler);
  }, [limit]);
  return cats;
}
