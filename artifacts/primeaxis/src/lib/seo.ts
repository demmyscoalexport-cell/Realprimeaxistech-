import { useEffect } from "react";

/** Canonical production origin — keep in sync with PUBLIC_SITE_URL on Vercel. */
export const SITE_URL = "https://www.primeaxishq.com";

export const DEFAULT_TITLE = "PrimeAxis Tech — The Future, Reported.";
export const DEFAULT_DESCRIPTION =
  "PrimeAxis Tech is the global newsroom for AI, gadgets, gaming, EVs, robotics, and the future of computing.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

export type PageMeta = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
};

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function usePageMeta(meta: PageMeta): void {
  useEffect(() => {
    const title = meta.title ?? DEFAULT_TITLE;
    const description = meta.description ?? DEFAULT_DESCRIPTION;
    const url = meta.path ? `${SITE_URL}${meta.path}` : `${SITE_URL}/`;
    const image = meta.image?.trim()
      ? meta.image.startsWith("http")
        ? meta.image
        : `${SITE_URL}${meta.image.startsWith("/") ? meta.image : `/${meta.image}`}`
      : DEFAULT_OG_IMAGE;
    const type = meta.type ?? "website";

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    upsertCanonical(url);
  }, [meta.title, meta.description, meta.path, meta.image, meta.type]);
}
