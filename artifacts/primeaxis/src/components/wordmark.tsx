import { Link } from "wouter";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "text-3xl"
      : size === "sm"
        ? "text-base"
        : "text-xl";
  return (
    <Link href="/" className="group inline-flex items-center gap-2">
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <defs>
            <linearGradient id="wm-grad" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0" stopColor="hsl(188 95% 55%)" />
              <stop offset="0.55" stopColor="hsl(265 90% 65%)" />
              <stop offset="1" stopColor="hsl(330 85% 60%)" />
            </linearGradient>
          </defs>
          <path
            d="M5 26 L16 6 L27 26 M10 20 H22"
            stroke="url(#wm-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      <span className={`font-display font-bold tracking-tight ${cls}`}>
        PrimeAxis<span className="text-muted-foreground font-medium">
          {" "}Tech
        </span>
      </span>
    </Link>
  );
}
