import { Link } from "wouter";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const wordCls =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  const markCls =
    size === "lg" ? "h-9 w-9" : size === "sm" ? "h-6 w-6" : "h-7 w-7";

  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className={`relative inline-flex items-center justify-center ${markCls}`}>
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full transition-transform duration-300 group-hover:rotate-45"
          aria-hidden
        >
          <defs>
            <linearGradient id="wm-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="hsl(188 95% 55%)" />
              <stop offset="0.55" stopColor="hsl(265 90% 65%)" />
              <stop offset="1" stopColor="hsl(330 85% 60%)" />
            </linearGradient>
            <radialGradient id="wm-node" cx="32" cy="32" r="7" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.4" stopColor="hsl(265 90% 70%)" />
              <stop offset="1" stopColor="hsl(265 90% 70%)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g stroke="url(#wm-grad)" strokeWidth="3.6" fill="none" strokeLinecap="round">
            <path d="M32 8 V56 M8 32 H56" />
            <path d="M32 14 L50 32 L32 50 L14 32 Z" strokeLinejoin="round" />
          </g>
          <circle cx="32" cy="32" r="6" fill="url(#wm-node)" />
          <circle cx="32" cy="32" r="2.4" fill="#fff" />
        </svg>
      </span>
      <span className={`font-display font-bold tracking-tight leading-none ${wordCls}`}>
        PrimeAxis
        <span className="text-muted-foreground font-medium"> Tech</span>
      </span>
    </Link>
  );
}
