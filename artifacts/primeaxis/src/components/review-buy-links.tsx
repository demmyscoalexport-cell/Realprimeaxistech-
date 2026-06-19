import { ExternalLink } from "lucide-react";
import { Link } from "wouter";

const RETAILER_LABELS: Record<string, string> = {
  amazon: "Amazon",
  bestbuy: "Best Buy",
  bh: "B&H Photo",
  other: "Retailer",
};

function linkLabel(link: {
  retailer: string;
  label?: string | null;
}): string {
  if (link.label?.trim()) return link.label.trim();
  const name = RETAILER_LABELS[link.retailer] ?? link.retailer;
  return `Buy at ${name}`;
}

export function ReviewBuyLinks({
  links,
}: {
  links: { retailer: string; url: string; label?: string | null }[];
}) {
  if (!links.length) return null;

  return (
    <div className="rounded-2xl border hairline bg-card/40 p-6">
      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Where to buy
      </div>
      <div className="mt-4 space-y-2">
        {links.map((link) => (
          <a
            key={`${link.retailer}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {linkLabel(link)}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        PrimeAxis may earn a commission from qualifying purchases.{" "}
        <Link href="/affiliate-disclosure" className="text-primary hover:underline">
          Affiliate disclosure
        </Link>
      </p>
    </div>
  );
}
