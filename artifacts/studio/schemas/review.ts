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
      validation: (r) => r.required(),
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
  ],
  preview: {
    select: { title: "productName", subtitle: "tagline", media: "heroImage" },
  },
});
