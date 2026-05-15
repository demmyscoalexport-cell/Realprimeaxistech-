import { defineField, defineType } from "sanity";

export const newsletter = defineType({
  name: "newsletter",
  title: "Newsletter",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "e.g. The Axis, Model Context",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "frequency",
      title: "Frequency",
      type: "string",
      options: {
        list: [
          { title: "Daily", value: "daily" },
          { title: "Weekly", value: "weekly" },
          { title: "Monthly", value: "monthly" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: "accentColor",
      title: "Accent color (hex)",
      type: "string",
      validation: (r) =>
        r.required().regex(/^#[0-9A-Fa-f]{6}$/, { name: "hex color" }),
    }),
    defineField({
      name: "subscriberCount",
      title: "Subscriber count (display)",
      type: "number",
      description: "Shown on newsletter cards. Update from your real provider periodically.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "frequency" },
  },
});
