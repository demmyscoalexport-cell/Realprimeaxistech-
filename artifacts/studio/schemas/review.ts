import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "productName",
      title: "Product name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "productName", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "One-line review summary shown on cards.",
      validation: (r) => r.required().max(140),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroImageUrl",
      title: "Hero image URL (fallback)",
      type: "string",
    }),
    defineField({
      name: "galleryImageUrls",
      title: "Gallery image URLs (fallback)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "galleryImages",
      title: "Gallery images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "score",
      title: "Score (0–10)",
      type: "number",
      validation: (r) => r.required().min(0).max(10),
    }),
    defineField({
      name: "verdict",
      title: "Verdict",
      type: "string",
      description: "e.g. Buy it, Skip it, Wait",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(400),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Reviewer",
      type: "reference",
      to: [{ type: "author" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "priceUsd",
      title: "Price (USD)",
      type: "number",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "affiliateLinks",
      title: "Affiliate buy links",
      type: "array",
      description:
        "Optional retailer links (Amazon Associates, etc.). Shown as buy buttons on the review page.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "retailer",
              title: "Retailer",
              type: "string",
              options: {
                list: [
                  { title: "Amazon", value: "amazon" },
                  { title: "Best Buy", value: "bestbuy" },
                  { title: "B&H Photo", value: "bh" },
                  { title: "Other", value: "other" },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "Affiliate URL",
              type: "url",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              title: "Button label (optional)",
              type: "string",
              description: 'Defaults to "Buy at Amazon" etc.',
            }),
          ],
          preview: {
            select: { title: "retailer", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "pros",
      title: "Pros",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "cons",
      title: "Cons",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "ratings",
      title: "Sub-ratings",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label", validation: (r) => r.required() },
            {
              name: "score",
              type: "number",
              title: "Score (0–10)",
              validation: (r) => r.required().min(0).max(10),
            },
          ],
          preview: { select: { title: "label", subtitle: "score" } },
        },
      ],
    }),
    defineField({
      name: "sections",
      title: "Review sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "heading", type: "string", title: "Heading", validation: (r) => r.required() },
            { name: "body", type: "text", title: "Body", rows: 5, validation: (r) => r.required() },
          ],
          preview: { select: { title: "heading" } },
        },
      ],
    }),
    defineField({
      name: "isSponsored",
      title: "Sponsored review",
      type: "boolean",
      description: "When enabled, a “Sponsored” label appears on the review.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "productName", subtitle: "tagline", media: "heroImage" },
  },
});
