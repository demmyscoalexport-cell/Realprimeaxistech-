import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required().max(140),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Dek",
      type: "text",
      rows: 2,
      validation: (r) => r.max(220),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Shown on cards and in social shares (~160 chars).",
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alt text" },
        { name: "credit", type: "string", title: "Photo credit" },
      ],
    }),
    defineField({
      name: "heroImageUrl",
      title: "Hero image URL (fallback)",
      type: "string",
      description:
        "Optional. Used only when no Hero image is uploaded above. Useful for seeded/imported content.",
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
      title: "Author",
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
      name: "readingMinutes",
      title: "Reading time (minutes)",
      type: "number",
      validation: (r) => r.required().min(1).max(120),
      initialValue: 5,
    }),
    defineField({
      name: "subcategorySlug",
      title: "Subcategory",
      type: "string",
      description:
        "Slug of one of the parent category's subcategories (e.g. 'llms').",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
    defineField({
      name: "keyTakeaways",
      title: "Key takeaways",
      type: "array",
      of: [{ type: "string" }],
      description: "3–5 short bullets shown in the sidebar summary.",
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "aiSummary",
      title: "AI summary",
      type: "text",
      rows: 4,
      description: "1–2 paragraph summary shown in the AI panel. Can be auto-generated.",
    }),
    defineField({
      name: "isBreaking",
      title: "Breaking news",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isFeature",
      title: "Featured on homepage",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category.name",
      media: "heroImage",
    },
  },
});
