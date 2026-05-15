import { useListTrendingArticles } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Radio, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

export function LiveTicker() {
  const { data } = useListTrendingArticles({ limit: 10 });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) setPaused(true);
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  if (!data || data.length === 0) return null;
  const items = [...data, ...data];
  const animationStyle = paused
    ? { animationPlayState: "paused" as const }
    : undefined;

  return (
    <div className="relative overflow-hidden border-b hairline bg-foreground/[0.02] backdrop-blur">
      <div className="container-page flex items-center gap-3 py-1.5">
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-red-400">
          <span className="relative flex h-1.5 w-1.5">
            {!paused && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          <Radio className="h-3 w-3" />
          Live
        </div>
        <div
          className="relative flex-1 overflow-hidden scroll-fade-mask"
          onMouseEnter={() => !reduced && setPaused(true)}
          onMouseLeave={() => !reduced && setPaused(false)}
          onFocusCapture={() => setPaused(true)}
        >
          <div
            className="flex animate-[ticker_60s_linear_infinite] gap-10 whitespace-nowrap will-change-transform motion-reduce:animate-none"
            style={animationStyle}
          >
            {items.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`/article/${a.slug}`}
                className="inline-flex items-center gap-2 text-xs text-foreground/70 hover:text-foreground"
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: a.category.accentColor }}
                />
                <span className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                  {a.category.name}
                </span>
                <span className="font-medium">{a.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume live ticker" : "Pause live ticker"}
          aria-pressed={paused}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border hairline bg-card/60 text-muted-foreground hover:text-foreground"
        >
          {paused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
        </button>
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
