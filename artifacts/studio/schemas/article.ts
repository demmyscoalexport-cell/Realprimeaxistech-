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
      name: "podcastAudioUrl",
      title: "Podcast audio URL",
      type: "url",
      description:
        "Hosted MP3 generated from this article. Used by the site player and podcast RSS feed.",
    }),
    defineField({
      name: "podcastDurationSeconds",
      title: "Podcast duration (seconds)",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "podcastAudioBytes",
      title: "Podcast audio size (bytes)",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "podcastGeneratedAt",
      title: "Podcast generated at",
      type: "datetime",
      description: "Timestamp of the latest ElevenLabs podcast generation.",
    }),
    defineField({
      name: "podcastScript",
      title: "Podcast script",
      type: "text",
      rows: 8,
      description:
        "Narration script sent to ElevenLabs. Regeneration can overwrite this field.",
    }),
    defineField({
      name: "podcastPlatforms",
      title: "Podcast platform links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "RSS", value: "rss" },
                  { title: "Spotify", value: "spotify" },
                  { title: "Apple Podcasts", value: "apple" },
                  { title: "YouTube", value: "youtube" },
                  { title: "Other", value: "other" },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (r) => r.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "affiliateLinks",
      title: "Affiliate buy links",
      type: "array",
      description:
        "Optional retailer links for buying guides. Shown as buy buttons in the article sidebar.",
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
            }),
          ],
          preview: {
            select: { title: "retailer", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "isSponsored",
      title: "Sponsored content",
      type: "boolean",
      description: "When enabled, a “Sponsored” label appears on the article.",
      initialValue: false,
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
