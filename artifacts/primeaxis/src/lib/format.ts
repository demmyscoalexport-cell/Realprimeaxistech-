import { formatDistanceToNowStrict } from "date-fns";

export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return String(n);
}

export function formatPrice(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Subtle editorial placeholder when CMS media is missing or fails to load. */
export const EDITORIAL_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23111827'/%3E%3Cstop offset='100%25' stop-color='%231e293b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='675' fill='url(%23g)'/%3E%3C/svg%3E";

function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return "";
}

/** Cloudinary + Sanity CDN delivery transforms for fast, sharp images. */
export function optimizeDeliveryUrl(url: string, width = 1400): string {
  const normalized = normalizeExternalUrl(url);
  if (!normalized) return EDITORIAL_IMAGE_PLACEHOLDER;

  if (
    normalized.includes("res.cloudinary.com/") &&
    normalized.includes("/image/upload/")
  ) {
    if (normalized.includes("/image/upload/f_auto")) return normalized;
    return normalized.replace(
      "/image/upload/",
      `/image/upload/f_auto,q_auto,w_${width},c_limit/`,
    );
  }

  if (normalized.includes("cdn.sanity.io/images/")) {
    const join = normalized.includes("?") ? "&" : "?";
    return `${normalized}${join}w=${width}&auto=format&q=80`;
  }

  return normalized;
}

export function resolveMediaUrl(path: string, width = 1400): string {
  const external = normalizeExternalUrl(path);
  if (external) return optimizeDeliveryUrl(external, width);

  if (!path?.trim()) return EDITORIAL_IMAGE_PLACEHOLDER;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const resolved = path.startsWith("/") ? base + path : `${base}/${path}`;
  return resolved || EDITORIAL_IMAGE_PLACEHOLDER;
}

export function withBase(path: string): string {
  return resolveMediaUrl(path);
}
