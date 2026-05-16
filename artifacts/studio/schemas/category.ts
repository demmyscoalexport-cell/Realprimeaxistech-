import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      validation: (r) => r.required().max(220),
    }),
    defineField({
      name: "accentColor",
      title: "Accent color (hex)",
      type: "string",
      description: "Used for chips, dots, and section accents. Example: #00d2ff",
      validation: (r) =>
        r
          .required()
          .regex(/^#[0-9A-Fa-f]{6}$/, { name: "hex color" }),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "subcategories",
      title: "Subcategories",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", type: "string", title: "Name" },
            {
              name: "slug",
              type: "string",
              title: "Slug",
              description: "URL-friendly id, e.g. 'llms'",
            },
            { name: "description", type: "string", title: "Short description" },
          ],
          preview: { select: { title: "name", subtitle: "slug" } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "description" },
  },
});
